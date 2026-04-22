import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "./auth";

export type ApiHandler = (
  req: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>;

// ─── Success Response ─────────────────────────────────────────────────────────

export function successResponse<T>(
  data: T,
  message = "Success",
  status = 200
) {
  return NextResponse.json({ success: true, message, data }, { status });
}

// ─── Error Response ───────────────────────────────────────────────────────────

export function errorResponse(message: string, status = 400, errors?: unknown) {
  const body: Record<string, unknown> = { success: false, message };
  if (errors !== undefined) body.errors = errors;
  return NextResponse.json(body, { status });
}

// ─── Pagination Helper ────────────────────────────────────────────────────────

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "20"))
  );
  const skip = (page - 1) * limit;
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  return { page, limit, skip, search, sortBy, sortOrder };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return successResponse({
    items: data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}

// ─── Auth Guard ───────────────────────────────────────────────────────────────

type Role = "ADMIN" | "MANAGER" | "AGENT";

const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 3,
  MANAGER: 2,
  AGENT: 1,
};

export function withAuth(
  handler: ApiHandler,
  requiredRole?: Role
): ApiHandler {
  return async (req, context) => {
    const user = await getAuthUser(req);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    if (
      requiredRole &&
      ROLE_HIERARCHY[user.role as Role] < ROLE_HIERARCHY[requiredRole]
    ) {
      return errorResponse("Forbidden: Insufficient permissions", 403);
    }

    // Attach user to request headers for downstream use
    const newHeaders = new Headers(req.headers);
    newHeaders.set("x-user-id", user.userId);
    newHeaders.set("x-user-email", user.email);
    newHeaders.set("x-user-role", user.role);
    newHeaders.set("x-user-name", user.name);

    const requestWithUser = new NextRequest(req.url, {
      headers: newHeaders,
      method: req.method,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
      duplex: "half",
    });

    return handler(requestWithUser, context);
  };
}

// ─── Extract User from Request ─────────────────────────────────────────────

export function getUserFromRequest(req: NextRequest) {
  return {
    userId: req.headers.get("x-user-id") || "",
    email: req.headers.get("x-user-email") || "",
    role: req.headers.get("x-user-role") || "",
    name: req.headers.get("x-user-name") || "",
  };
}

// ─── Error Handler ────────────────────────────────────────────────────────────

export function handleApiError(error: unknown) {
  console.error("[API Error]:", error);

  if (error instanceof Error) {
    if (error.message.includes("Unique constraint")) {
      return errorResponse("Record already exists", 409);
    }
    if (error.message.includes("Record to update not found")) {
      return errorResponse("Record not found", 404);
    }
    if (error.message.includes("Foreign key constraint")) {
      return errorResponse("Referenced record not found", 400);
    }
  }

  return errorResponse("Internal server error", 500);
}
