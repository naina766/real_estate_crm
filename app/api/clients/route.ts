import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateClientSchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError, getPaginationParams, paginatedResponse, getUserFromRequest } from "@/lib/api";
import type { ClientType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const { page, limit, skip, search, sortBy, sortOrder } = getPaginationParams(req.nextUrl.searchParams);
    const type = req.nextUrl.searchParams.get("type");

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(type && { type: type as ClientType }),
      ...(user.role === "AGENT" && { agentId: user.userId }),
    };

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          agent: { select: { id: true, name: true, email: true, avatar: true } },
          _count: { select: { activities: true, deals: true, leads: true } },
        },
      }),
      prisma.client.count({ where }),
    ]);

    return paginatedResponse(clients, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const body = await req.json();
    const parsed = CreateClientSchema.safeParse(body);

    if (!parsed.success) return errorResponse("Validation failed", 400, parsed.error.flatten());

    const { preferences, ...rest } = parsed.data;
    const client = await prisma.client.create({
      data: {
        ...rest,
        ...(preferences && { preferences: JSON.parse(JSON.stringify(preferences)) }),
        agentId: rest.agentId || user.userId,
      },
    });

    await prisma.activity.create({
      data: { type: "NOTE", title: "Client profile created", userId: user.userId, clientId: client.id },
    });

    return successResponse(client, "Client created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
