import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreatePropertySchema, UpdatePropertySchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  handleApiError,
  getPaginationParams,
  paginatedResponse,
  getUserFromRequest,
} from "@/lib/api";

// GET /api/properties
export async function GET(req: NextRequest) {
  try {
    const { page, limit, skip, search, sortBy, sortOrder } =
      getPaginationParams(req.nextUrl.searchParams);

    const type = req.nextUrl.searchParams.get("type");
    const status = req.nextUrl.searchParams.get("status");
    const city = req.nextUrl.searchParams.get("city");
    const minPrice = req.nextUrl.searchParams.get("minPrice");
    const maxPrice = req.nextUrl.searchParams.get("maxPrice");
    const bedrooms = req.nextUrl.searchParams.get("bedrooms");
    const featured = req.nextUrl.searchParams.get("featured");

    const where: any = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { address: { contains: search, mode: "insensitive" as const } },
          { city: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(type && { type }),
      ...(status && { status }),
      ...(city && { city: { contains: city, mode: "insensitive" as const } }),
      ...(minPrice || maxPrice
        ? {
            price: {
              ...(minPrice && { gte: parseFloat(minPrice) }),
              ...(maxPrice && { lte: parseFloat(maxPrice) }),
            },
          }
        : {}),
      ...(bedrooms && { bedrooms: parseInt(bedrooms) }),
      ...(featured === "true" && { isFeatured: true }),
    };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          agent: { select: { id: true, name: true, email: true, avatar: true } },
          images: { where: { type: "OTHER" }, take: 5 },
          _count: { select: { deals: true } },
        },
      }),
      prisma.property.count({ where }),
    ]);

    return paginatedResponse(properties, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/properties
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const user = getUserFromRequest(req);
    if (!user.userId) {
      return errorResponse("Unauthorized - Please log in", 401);
    }

    const body = await req.json();
    const parsed = CreatePropertySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const { features, ...rest } = parsed.data;

    const property = await prisma.property.create({
      data: {
        ...rest,
        features: features ? (features as any) : undefined,
        agentId: rest.agentId || user.userId,
      },
      include: {
        agent: { select: { id: true, name: true, email: true } },
      },
    });
try {
  await fetch("https://agnayi2026.app.n8n.cloud/webhook/property-create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: property.title,
      price: property.price,
      city: property.city,
      type: property.type,
    }),
  });
} catch (err) {
  console.error("n8n property webhook failed:", err);
}
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "Property",
        entityId: property.id,
        newData: { title: property.title, type: property.type },
        userId: user.userId,
      },
    });

    return successResponse(property, "Property created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
