import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api";
import crypto from "crypto";

// POST /api/webhooks/lead - Accept leads from external portals
export async function POST(req: NextRequest) {
  try {
    // Verify HMAC signature if secret is set
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers.get("x-webhook-signature");
      const rawBody = await req.text();
      const expectedSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (signature !== `sha256=${expectedSig}`) {
        return errorResponse("Invalid webhook signature", 401);
      }

      // Re-parse body after reading as text
      const body = JSON.parse(rawBody);
      return await processWebhookLead(body);
    }

    const body = await req.json();
    return await processWebhookLead(body);
  } catch (error) {
    return handleApiError(error);
  }
}

async function processWebhookLead(body: Record<string, unknown>) {
  const { name, phone, email, source, budget, notes, preferences } = body;

  if (!name || !phone) {
    return errorResponse("name and phone are required", 400);
  }

  // Find an admin/manager to auto-assign
  const defaultAgent = await prisma.user.findFirst({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });

  const lead = await prisma.lead.create({
    data: {
      name: String(name),
      phone: String(phone),
      email: email ? String(email) : undefined,
      source: "API_WEBHOOK",
      budget: budget ? parseFloat(String(budget)) : undefined,
      notes: notes ? String(notes) : undefined,
      preferences: preferences ? (preferences as any) : undefined,
      assignedToId: defaultAgent?.id,
    },
  });

  // Notify admin
  if (defaultAgent) {
    await prisma.notification.create({
      data: {
        type: "LEAD_ASSIGNED",
        title: "New webhook lead received",
        message: `New lead "${lead.name}" captured via webhook`,
        userId: defaultAgent.id,
        leadId: lead.id,
      },
    });
  }

  return successResponse({ leadId: lead.id }, "Lead captured successfully", 201);
}
