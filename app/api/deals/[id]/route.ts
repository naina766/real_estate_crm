import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateDealSchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError, getUserFromRequest } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        client: true,
        property: { include: { images: { take: 5 } } },
        agent: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        lead: { select: { id: true, name: true, status: true } },
        documents: true,
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { dueDate: "asc" },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
    });
    if (!deal) return errorResponse("Deal not found", 404);
    return successResponse(deal);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(req);
    const body = await req.json();
    const parsed = UpdateDealSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Validation failed", 400, parsed.error.flatten());

    const existing = await prisma.deal.findUnique({ where: { id } });
    if (!existing) return errorResponse("Deal not found", 404);

    if (user.role === "AGENT" && existing.agentId !== user.userId) return errorResponse("Forbidden", 403);

    const { amount, commissionRate, ...rest } = parsed.data;
    const effectiveRate = commissionRate ?? Number(existing.commissionRate);
    const effectiveAmount = amount ?? (existing.amount ? Number(existing.amount) : null);
    const commissionAmount = effectiveAmount ? (effectiveAmount * effectiveRate) / 100 : null;

    const deal = await prisma.deal.update({
      where: { id },
      data: {
        ...rest,
        ...(amount !== undefined && { amount }),
        ...(commissionRate !== undefined && { commissionRate }),
        ...(commissionAmount !== null && { commissionAmount }),
        ...(rest.stage === "CLOSED_WON" && { closedAt: new Date() }),
      },
    });

    // Log stage change
    if (rest.stage && rest.stage !== existing.stage) {
      await prisma.activity.create({
        data: {
          type: "DEAL_STAGE_CHANGE",
          title: "Deal stage updated",
          description: `Stage changed from ${existing.stage} to ${rest.stage}`,
          metadata: { from: existing.stage, to: rest.stage },
          userId: user.userId,
          dealId: id,
          clientId: existing.clientId,
        },
      });

      // Notify agent
      if (existing.agentId) {
        await prisma.notification.create({
          data: {
            type: "DEAL_STAGE_CHANGE",
            title: "Deal stage changed",
            message: `Deal "${deal.title}" moved to ${rest.stage}`,
            userId: existing.agentId,
          },
        });
      }
    }

    return successResponse(deal, "Deal updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(req);
    if (!["ADMIN", "MANAGER"].includes(user.role)) return errorResponse("Forbidden", 403);
    await prisma.deal.delete({ where: { id } });
    return successResponse(null, "Deal deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
