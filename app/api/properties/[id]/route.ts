import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdatePropertySchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError, getUserFromRequest } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        agent: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        images: true,
        deals: {
          select: { id: true, title: true, stage: true, amount: true, client: { select: { id: true, name: true } } },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
    });

    if (!property) return errorResponse("Property not found", 404);

    // Increment view count
    await prisma.property.update({ where: { id }, data: { viewCount: { increment: 1 } } });

    return successResponse(property);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(req);
    const body = await req.json();
    const parsed = UpdatePropertySchema.safeParse(body);

    if (!parsed.success) return errorResponse("Validation failed", 400, parsed.error.flatten());

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return errorResponse("Property not found", 404);

    // Agents can only edit their own properties
    if (user.role === "AGENT" && existing.agentId !== user.userId) {
      return errorResponse("Forbidden", 403);
    }

    const { features, ...rest } = parsed.data;
    const property = await prisma.property.update({
      where: { id },
      data: { ...rest, features: features ? (features as any) : undefined },
    });

    await prisma.auditLog.create({
      data: { action: "UPDATE", entity: "Property", entityId: id, userId: user.userId },
    });

    return successResponse(property, "Property updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(req);

    if (!["ADMIN", "MANAGER"].includes(user.role)) {
      return errorResponse("Forbidden", 403);
    }

    // Delete associated Cloudinary images first
    const docs = await prisma.document.findMany({ where: { propertyId: id } });
    // Note: Cloudinary cleanup handled in background
    await prisma.property.delete({ where: { id } });

    await prisma.auditLog.create({
      data: { action: "DELETE", entity: "Property", entityId: id, userId: user.userId },
    });

    return successResponse(null, "Property deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
