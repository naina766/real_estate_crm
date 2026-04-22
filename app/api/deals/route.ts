import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateDealSchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError, getPaginationParams, paginatedResponse, getUserFromRequest } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const { page, limit, skip, search, sortBy, sortOrder } = getPaginationParams(req.nextUrl.searchParams);
    const stage = req.nextUrl.searchParams.get("stage");

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { client: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }),
      ...(stage && { stage: stage as any }),
      ...(user.role === "AGENT" && { agentId: user.userId }),
    };

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          client: { select: { id: true, name: true, phone: true } },
          property: { select: { id: true, title: true, city: true, thumbnailUrl: true } },
          agent: { select: { id: true, name: true, avatar: true } },
          documents: true,
          _count: { select: { tasks: true, activities: true } },
        },
      }),
      prisma.deal.count({ where }),
    ]);

    return paginatedResponse(deals, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const body = await req.json();
    const parsed = CreateDealSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Validation failed", 400, parsed.error.flatten());

    const { amount, commissionRate = 2.0, ...rest } = parsed.data;
    const commissionAmount = amount ? (amount * commissionRate) / 100 : null;

    const deal = await prisma.deal.create({
      data: {
        ...rest,
        amount: amount ? amount : undefined,
        commissionRate,
        commissionAmount: commissionAmount ? commissionAmount : undefined,
        agentId: rest.agentId || user.userId,
      },
      include: {
        client: { select: { id: true, name: true } },
        property: { select: { id: true, title: true } },
        agent: { select: { id: true, name: true } },
      },
    });

    await prisma.activity.create({
      data: {
        type: "NOTE",
        title: "Deal created",
        description: `Deal "${deal.title}" created in ${deal.stage} stage`,
        userId: user.userId,
        dealId: deal.id,
        clientId: deal.clientId,
      },
    });

    return successResponse(deal, "Deal created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
