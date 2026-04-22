import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleApiError, getUserFromRequest } from "@/lib/api";

// POST /api/ai/score-lead
export async function POST(req: NextRequest) {
  try {
    const { leadId } = await req.json();
    if (!leadId) return errorResponse("leadId is required", 400);

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        activities: { select: { type: true } },
        followUps: { select: { isCompleted: true } },
      },
    });
    if (!lead) return errorResponse("Lead not found", 404);

    // Rule-based AI lead scoring (0-100)
    let score = 0;

    // Budget provided
    if (lead.budget) score += 20;
    if (lead.budget && Number(lead.budget) > 5000000) score += 10;

    // Email provided
    if (lead.email) score += 10;

    // Source quality
    const sourceScores: Record<string, number> = {
      REFERRAL: 20,
      WALK_IN: 15,
      WEBSITE: 10,
      PORTAL: 10,
      SOCIAL_MEDIA: 5,
      COLD_CALL: 3,
      OTHER: 2,
    };
    score += sourceScores[lead.source] || 0;

    // Status progression
    const statusScores: Record<string, number> = {
      QUALIFIED: 15,
      CONTACTED: 8,
      NEW: 0,
    };
    score += statusScores[lead.status] || 0;

    // Engagement: activities
    const activityCount = lead.activities.length;
    score += Math.min(activityCount * 2, 10);

    // Follow-ups completed
    const completedFollowUps = lead.followUps.filter((f: { isCompleted: boolean }) => f.isCompleted).length;
    score += Math.min(completedFollowUps * 3, 9);

    // Preferences provided
    if (lead.preferences && Object.keys(lead.preferences as object).length > 0) score += 6;

    // Cap score at 100
    score = Math.min(score, 100);

    await prisma.lead.update({ where: { id: leadId }, data: { score } });

    return successResponse({ score, leadId }, "Lead scored successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
