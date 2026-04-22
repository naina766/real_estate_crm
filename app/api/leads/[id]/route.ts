import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateLeadSchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  handleApiError,
  getUserFromRequest,
} from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

// GET /api/leads/:id
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(req);

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
        createdBy: { select: { id: true, name: true } },
        client: true,
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        followUps: {
          orderBy: { scheduledAt: "asc" },
          where: { isCompleted: false },
        },
        deals: {
          select: { id: true, title: true, stage: true, amount: true },
        },
      },
    });

    if (!lead) {
      return errorResponse("Lead not found", 404);
    }

    // Agents can only view their assigned leads
    if (user.role === "AGENT" && lead.assignedToId !== user.userId) {
      return errorResponse("Forbidden", 403);
    }

    return successResponse(lead);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/leads/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(req);
    const body = await req.json();
    const parsed = UpdateLeadSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) return errorResponse("Lead not found", 404);

    if (user.role === "AGENT" && existing.assignedToId !== user.userId) {
      return errorResponse("Forbidden", 403);
    }

    const { preferences, ...rest } = parsed.data;

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...rest,
        preferences: preferences ? (preferences as any) : undefined,
      },
    });

    // Log status change activity
    if (rest.status && rest.status !== existing.status) {
      await prisma.activity.create({
        data: {
          type: "STATUS_CHANGE",
          title: "Lead status updated",
          description: `Status changed from ${existing.status} to ${rest.status}`,
          userId: user.userId,
          leadId: id,
          metadata: { from: existing.status, to: rest.status },
        },
      });
    }

    // Notify new assignee
    if (rest.assignedToId && rest.assignedToId !== existing.assignedToId) {
      await prisma.activity.create({
        data: {
          type: "LEAD_ASSIGNED",
          title: "Lead reassigned",
          description: `Lead assigned to new agent`,
          userId: user.userId,
          leadId: id,
        },
      });
      await prisma.notification.create({
        data: {
          type: "LEAD_ASSIGNED",
          title: "Lead assigned to you",
          message: `Lead "${lead.name}" has been assigned to you`,
          userId: rest.assignedToId,
          leadId: id,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "Lead",
        entityId: id,
        oldData: { status: existing.status, assignedToId: existing.assignedToId },
        newData: { ...rest },
        userId: user.userId,
      },
    });

    return successResponse(lead, "Lead updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/leads/:id
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(req);

    if (!["ADMIN", "MANAGER"].includes(user.role)) {
      return errorResponse("Forbidden", 403);
    }

    await prisma.lead.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entity: "Lead",
        entityId: id,
        userId: user.userId,
      },
    });

    return successResponse(null, "Lead deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
