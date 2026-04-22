import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  successResponse,
  handleApiError,
  errorResponse,
} from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import type { LeadStatus, DealStage } from "@prisma/client";

// GET /api/reports/dashboard
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const agentFilter =
      user.role === "AGENT" ? { agentId: user.userId } : {};

    const leadFilter =
      user.role === "AGENT"
        ? { assignedToId: user.userId }
        : {};

    const [
      totalLeads,
      newLeads,
      qualifiedLeads,
      closedLeads,
      lostLeads,
      totalProperties,
      availableProperties,
      totalClients,
      totalDeals,
      closedDeals,
      revenueResult,
      commissionResult,
      recentLeads,
      recentDeals,
      leadsByStatus,
      dealsByStage,
    
    ] = await Promise.all([
      // Leads
      prisma.lead.count({ where: leadFilter }),
      prisma.lead.count({ where: { ...leadFilter, status: "NEW" } }),
      prisma.lead.count({
        where: { ...leadFilter, status: "QUALIFIED" },
      }),
      prisma.lead.count({
        where: { ...leadFilter, status: "CLOSED" },
      }),
      prisma.lead.count({
        where: { ...leadFilter, status: "LOST" },
      }),

      // Properties
      prisma.property.count({ where: agentFilter }),
      prisma.property.count({
        where: { ...agentFilter, status: "AVAILABLE" },
      }),

      // Clients & Deals
      prisma.client.count({ where: agentFilter }),
      prisma.deal.count({ where: agentFilter }),
      prisma.deal.count({
        where: { ...agentFilter, stage: "CLOSED_WON" },
      }),

      // Revenue
      prisma.deal.aggregate({
        where: { ...agentFilter, stage: "CLOSED_WON" },
        _sum: { amount: true },
      }),

      prisma.deal.aggregate({
        where: { ...agentFilter, stage: "CLOSED_WON" },
        _sum: { commissionAmount: true },
      }),

      // Recent Leads
      prisma.lead.findMany({
        where: leadFilter,
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          assignedTo: {
            select: { name: true, avatar: true },
          },
        },
      }),

      // Recent Deals
      prisma.deal.findMany({
        where: agentFilter,
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: {
          client: { select: { name: true } },
          property: { select: { title: true } },
        },
      }),

      // Charts
      prisma.lead.groupBy({
        by: ["status"],
        where: leadFilter,
        _count: { id: true },
      }),

      prisma.deal.groupBy({
        by: ["stage"],
        where: agentFilter,
        _count: { id: true },
      }),

      
    ]);

const agentCondition =
  user.role === "AGENT"
    ? Prisma.sql`AND "agentId" = ${user.userId}`
    : Prisma.empty;

const monthlyRevenue = await prisma.$queryRaw<
  { month: Date; revenue: number; deals: number }[]
>(Prisma.sql`
  SELECT 
    DATE_TRUNC('month', "closedAt") as month,
    COALESCE(SUM(amount), 0) as revenue,
    COUNT(*) as deals
  FROM deals
  WHERE stage = 'CLOSED_WON'
    AND "closedAt" IS NOT NULL   -- 🔥 IMPORTANT FIX
    AND "closedAt" >= NOW() - INTERVAL '6 months'
    ${agentCondition}
  GROUP BY DATE_TRUNC('month', "closedAt")
  ORDER BY month ASC
`);
    const conversionRate =
      totalLeads > 0
        ? ((closedLeads / totalLeads) * 100).toFixed(1)
        : "0";

    return successResponse({
      summary: {
        totalLeads,
        newLeads,
        qualifiedLeads,
        closedLeads,
        lostLeads,
        conversionRate: parseFloat(conversionRate),

        totalProperties,
        availableProperties,

        totalClients,
        totalDeals,
        closedDeals,

        totalRevenue: revenueResult._sum.amount || 0,
        totalCommission:
          commissionResult._sum.commissionAmount || 0,
      },

      charts: {
        leadsByStatus: leadsByStatus.map((s: { status: LeadStatus; _count: { id: number; }; }) => ({
          status: s.status,
          count: s._count.id,
        })),
        dealsByStage: dealsByStage.map((s: { stage: DealStage; _count: { id: number; }; }) => ({
          stage: s.stage,
          count: s._count.id,
        })),
        monthlyRevenue,
      },

      recentActivity: {
        leads: recentLeads,
        deals: recentDeals,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
