import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateActivitySchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError, getPaginationParams, paginatedResponse, getUserFromRequest } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const { page, limit, skip } = getPaginationParams(req.nextUrl.searchParams);
    const leadId = req.nextUrl.searchParams.get("leadId");
    const clientId = req.nextUrl.searchParams.get("clientId");
    const dealId = req.nextUrl.searchParams.get("dealId");
    const type = req.nextUrl.searchParams.get("type");

    const where = {
      ...(leadId && { leadId }),
      ...(clientId && { clientId }),
      ...(dealId && { dealId }),
      ...(type && { type: type as any }),
    };

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, avatar: true, role: true } },
          lead: { select: { id: true, name: true } },
          client: { select: { id: true, name: true } },
          deal: { select: { id: true, title: true } },
          property: { select: { id: true, title: true } },
        },
      }),
      prisma.activity.count({ where }),
    ]);

    return paginatedResponse(activities, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const body = await req.json();
    const parsed = CreateActivitySchema.safeParse(body);
    if (!parsed.success) return errorResponse("Validation failed", 400, parsed.error.flatten());

    const { metadata, ...rest } = parsed.data;
    const activity = await prisma.activity.create({
      data: {
        ...rest,
        metadata: metadata ? (metadata as any) : undefined,
        userId: user.userId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return successResponse(activity, "Activity logged", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
