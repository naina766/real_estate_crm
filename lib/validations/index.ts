import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "MANAGER", "AGENT"]).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Lead ────────────────────────────────────────────────────────────────────

export const CreateLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.union([z.string().email(), z.literal(""), z.undefined()]).optional(),
  budget: z.number().positive().optional(),
  source: z
    .enum([
      "WEBSITE",
      "REFERRAL",
      "PORTAL",
      "SOCIAL_MEDIA",
      "COLD_CALL",
      "WALK_IN",
      "API_WEBHOOK",
      "OTHER",
    ])
    .optional(),
  notes: z.string().optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
  assignedToId: z.string().optional(),
});

export const UpdateLeadSchema = CreateLeadSchema.partial().extend({
  status: z
    .enum(["NEW", "CONTACTED", "QUALIFIED", "CLOSED", "LOST"])
    .optional(),
});

// ─── Property ────────────────────────────────────────────────────────────────

export const CreatePropertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "LAND", "MIXED_USE"]),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().default("India"),
  pincode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  price: z.number().positive("Price must be positive"),
  size: z.number().positive().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  floors: z.number().int().nonnegative().optional(),
  yearBuilt: z.number().int().optional(),
  amenities: z.array(z.string()).optional(),
  features: z.record(z.string(), z.unknown()).optional(),
  agentId: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

export const UpdatePropertySchema = CreatePropertySchema.partial().extend({
  status: z
    .enum(["AVAILABLE", "UNDER_OFFER", "SOLD", "RENTED", "OFF_MARKET"])
    .optional(),
});

// ─── Client ──────────────────────────────────────────────────────────────────

export const CreateClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.union([z.string().email(), z.literal(""), z.undefined()]).optional(),
  type: z.enum(["BUYER", "SELLER", "BOTH"]).default("BUYER"),
  preferences: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  agentId: z.string().optional(),
});

export const UpdateClientSchema = CreateClientSchema.partial();

// ─── Deal ────────────────────────────────────────────────────────────────────

export const CreateDealSchema = z.object({
  title: z.string().min(1, "Title is required"),
  clientId: z.string().min(1, "Client ID is required"),
  propertyId: z.string().optional(),
  agentId: z.string().optional(),
  leadId: z.string().optional(),
  amount: z.number().positive().optional(),
  commissionRate: z.number().min(0).max(100).default(2.0),
  expectedCloseDate: z.string().optional(),
  notes: z.string().optional(),
  stage: z
    .enum([
      "PROSPECTING",
      "NEGOTIATION",
      "AGREEMENT",
      "DUE_DILIGENCE",
      "CLOSED_WON",
      "CLOSED_LOST",
    ])
    .optional(),
});

export const UpdateDealSchema = CreateDealSchema.partial();

// ─── Activity ────────────────────────────────────────────────────────────────

export const CreateActivitySchema = z.object({
  type: z.enum([
    "CALL",
    "EMAIL",
    "SMS",
    "VISIT",
    "NOTE",
    "MEETING",
    "TASK_COMPLETED",
    "STATUS_CHANGE",
    "DOCUMENT_UPLOAD",
    "DEAL_STAGE_CHANGE",
    "LEAD_ASSIGNED",
    "FOLLOW_UP",
  ]),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  leadId: z.string().optional(),
  clientId: z.string().optional(),
  dealId: z.string().optional(),
  propertyId: z.string().optional(),
});

// ─── Follow Up ────────────────────────────────────────────────────────────────

export const CreateFollowUpSchema = z.object({
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
  scheduledAt: z.string().min(1, "Scheduled date is required"),
  leadId: z.string().optional(),
  clientId: z.string().optional(),
});

// ─── Task ────────────────────────────────────────────────────────────────────

export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.number().int().min(1).max(3).default(2),
  dueDate: z.string().optional(),
  assignedToId: z.string().optional(),
  dealId: z.string().optional(),
});

// ─── Pagination ───────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
