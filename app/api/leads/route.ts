import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import {
  CreateLeadSchema,
} from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  handleApiError,
  getPaginationParams,
  paginatedResponse,
} from "@/lib/api";
import type { LeadSource, LeadStatus } from "@prisma/client";

// ======================
// GET /api/leads
// ======================
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return errorResponse("Unauthorized", 401);

    const { page, limit, skip, search, sortBy, sortOrder } =
      getPaginationParams(req.nextUrl.searchParams);

    const status = req.nextUrl.searchParams.get("status") as LeadStatus | null;
    const source = req.nextUrl.searchParams.get("source") as LeadSource | null;
    const assignedToId = req.nextUrl.searchParams.get("assignedToId");

    const where: {
      OR?: Array<{ name: { contains: string; mode: "insensitive" } } | { email: { contains: string; mode: "insensitive" } } | { phone: { contains: string; mode: "insensitive" } }>;
      status?: LeadStatus;
      source?: LeadSource;
      assignedToId?: string;
    } = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(status && { status }),
      ...(source && { source }),
      ...(user.role === "AGENT" && { assignedToId: user.userId }),
      ...(assignedToId && user.role !== "AGENT" && { assignedToId }),
    };

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          client: { select: { id: true, name: true } },
          _count: { select: { activities: true, followUps: true } },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return paginatedResponse(leads, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

// ======================
// POST /api/leads
// ======================
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return errorResponse("Unauthorized", 401);

    const body = await req.json();

    const parsed = CreateLeadSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const { preferences, ...rest } = parsed.data;

    const lead = await prisma.lead.create({
      data: {
        name: rest.name,
        phone: rest.phone,
        email: rest.email,
        budget: rest.budget,
        source: rest.source,
        notes: rest.notes,
        tags: rest.tags,
        ...(preferences && { preferences: JSON.parse(JSON.stringify(preferences)) }),
        createdById: user.userId,
        assignedToId: rest.assignedToId || user.userId,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

     try {
      await fetch("https://agnayi2026.app.n8n.cloud/webhook/lead-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": process.env.WEBHOOK_SECRET!
        },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          budget: lead.budget,
        }),
      });
    } catch (err) {
      console.error("n8n webhook failed:", err);
    }
    // Activity log
    await prisma.activity.create({
      data: {
        type: "NOTE",
        title: "Lead created",
        description: `Lead ${lead.name} created`,
        userId: user.userId,
        leadId: lead.id,
      },
    });

    // Notification
    if (lead.assignedToId && lead.assignedToId !== user.userId) {
      await prisma.notification.create({
        data: {
          type: "LEAD_ASSIGNED",
          title: "New lead assigned",
          message: `You have been assigned a new lead: ${lead.name}`,
          userId: lead.assignedToId,
          leadId: lead.id,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "Lead",
        entityId: lead.id,
        newData: { name: lead.name, source: lead.source },
        userId: user.userId,
      },
    });

    return successResponse(lead, "Lead created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}