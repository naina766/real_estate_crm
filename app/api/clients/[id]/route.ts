import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateClientSchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError, getUserFromRequest } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        agent: { select: { id: true, name: true, email: true, avatar: true } },
        leads: { select: { id: true, name: true, status: true, createdAt: true } },
        deals: {
          include: {
            property: { select: { id: true, title: true, city: true } },
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 30,
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        followUps: { where: { isCompleted: false }, orderBy: { scheduledAt: "asc" } },
        documents: true,
      },
    });
    if (!client) return errorResponse("Client not found", 404);
    return successResponse(client);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(req);
    const body = await req.json();
    const parsed = UpdateClientSchema.safeParse(body);

    if (!parsed.success) return errorResponse("Validation failed", 400, parsed.error.flatten());

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) return errorResponse("Client not found", 404);
    if (user.role === "AGENT" && existing.agentId !== user.userId) return errorResponse("Forbidden", 403);

    const { preferences, ...rest } = parsed.data;
    const client = await prisma.client.update({
      where: { id },
      data: { ...rest, preferences: preferences ? (preferences as any) : undefined },
    });
    return successResponse(client, "Client updated");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(req);
    if (!["ADMIN", "MANAGER"].includes(user.role)) return errorResponse("Forbidden", 403);
    await prisma.client.delete({ where: { id } });
    return successResponse(null, "Client deleted");
  } catch (error) {
    return handleApiError(error);
  }
}
