# 🏠 RealCRM — Production-Ready Real Estate CRM

A full-stack Real Estate CRM built with **Next.js 14**, **Tailwind CSS**, **Prisma ORM**, **PostgreSQL**, and **Cloudinary** — all in a single Next.js monorepo.

---

## ✨ Features

| Module | Features |
|---|---|
| **Leads** | Capture, assign, score (AI), status pipeline, follow-ups |
| **Properties** | CRUD listings, image upload, grid/list view, map-ready |
| **Clients** | Buyer/Seller profiles, interaction history |
| **Deals** | Kanban pipeline, commission calculation, document upload |
| **Communications** | Activity timeline, calls/emails/visits logged |
| **Agents** | Role-based access (Admin/Manager/Agent), performance stats |
| **Reports** | Live analytics dashboard, revenue charts, export |
| **Webhooks** | Accept leads from external portals via HMAC-signed webhooks |
| **AI Scoring** | Rule-based lead scoring 0-100 |
| **Auth** | JWT access+refresh tokens, cookie-based, RBAC |

---

## 🏗️ Project Structure

```
real-estate-crm/
├── app/
│   ├── (auth)/            # Login, Register pages
│   ├── (dashboard)/       # All protected dashboard pages
│   │   ├── dashboard/     # Analytics overview
│   │   ├── leads/         # Lead management + form
│   │   ├── properties/    # Property listings (grid/list)
│   │   ├── clients/       # Client directory
│   │   ├── deals/         # Kanban pipeline
│   │   ├── communications/# Activity timeline
│   │   ├── agents/        # Team management
│   │   └── reports/       # Analytics & charts
│   └── api/               # All backend API routes
│       ├── auth/          # register, login, refresh
│       ├── leads/         # CRUD + assign + AI score
│       ├── properties/    # CRUD + search
│       ├── clients/       # CRUD
│       ├── deals/         # CRUD + pipeline
│       ├── communications/# Activity log
│       ├── users/         # User management
│       ├── notifications/ # In-app notifications
│       ├── reports/       # Analytics aggregation
│       ├── upload/        # Cloudinary upload
│       ├── webhooks/      # External lead capture
│       └── ai/            # Lead scoring
├── components/
│   ├── ui/                # Button, Badge, Input, Select, Card, Avatar...
│   └── layout/            # Sidebar, Navbar
├── lib/
│   ├── prisma.ts          # Prisma singleton
│   ├── auth.ts            # JWT (jose)
│   ├── cloudinary.ts      # Cloudinary SDK
│   ├── api.ts             # API helpers + auth guard HOF
│   └── validations/       # Zod schemas for all entities
├── middleware.ts           # JWT route protection
└── prisma/
    ├── schema.prisma       # 12-model database schema
    └── seed.ts             # Demo data seed
```

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL database (local or [Neon.tech](https://neon.tech) free tier)
- Cloudinary account (free tier works)

### 2. Clone & Install

```bash
cd real-estate-crm
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://USER:PASS@HOST:5432/real_estate_crm"
JWT_SECRET="your-secret-key-min-32-chars"
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 4. Database Setup

```bash
# Push schema to database
npx prisma db push

# Seed with demo data
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Visit **http://localhost:3000**

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@realcrm.com | Admin@1234 |
| Manager | manager@realcrm.com | Agent@1234 |
| Agent 1 | agent@realcrm.com | Agent@1234 |
| Agent 2 | agent2@realcrm.com | Agent@1234 |

---

## 📡 API Reference

### Authentication

```bash
# Register (first user auto-promoted to Admin)
POST /api/auth/register
{ "name": "John", "email": "john@example.com", "password": "Secret@123" }

# Login
POST /api/auth/login
{ "email": "admin@realcrm.com", "password": "Admin@1234" }

# Refresh Token
POST /api/auth/refresh

# Logout
DELETE /api/auth/refresh
```

### Leads

```bash
# List (with filters)
GET /api/leads?status=NEW&source=REFERRAL&page=1&limit=20&search=john

# Create
POST /api/leads
{ "name": "Jane Doe", "phone": "+91 98765 43210", "budget": 5000000, "source": "WEBSITE" }

# Update status
PATCH /api/leads/:id
{ "status": "QUALIFIED", "assignedToId": "user-id" }

# AI score a lead
POST /api/ai/score-lead
{ "leadId": "lead-id" }
```

### Properties

```bash
# List with filters
GET /api/properties?type=RESIDENTIAL&city=Mumbai&minPrice=5000000&maxPrice=30000000

# Create
POST /api/properties
{
  "title": "3BHK Apartment",
  "type": "RESIDENTIAL",
  "address": "MG Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "price": 15000000
}
```

### Deals

```bash
# Create deal
POST /api/deals
{ "title": "Deal Title", "clientId": "cuid", "propertyId": "cuid", "amount": 15000000, "commissionRate": 2 }

# Move stage (drag-drop calls this)
PATCH /api/deals/:id
{ "stage": "NEGOTIATION" }
```

### Webhooks (External Lead Capture)

```bash
# Accept lead from property portal
POST /api/webhooks/lead
X-Webhook-Signature: sha256=HMAC_SIGNATURE
{ "name": "Lead Name", "phone": "+91...", "email": "...", "budget": 5000000 }
```

---

## 🗄️ Database Schema Overview

| Model | Key Fields |
|---|---|
| `User` | name, email, password (bcrypt), role (ADMIN\|MANAGER\|AGENT) |
| `Lead` | name, phone, email, budget, source, status, score, assignedToId |
| `Property` | title, type, address, price, size, bedrooms, lat/lng, images |
| `Client` | name, type (BUYER\|SELLER\|BOTH), preferences, agentId |
| `Deal` | title, stage, amount, commissionRate, commissionAmount |
| `Activity` | type (CALL\|EMAIL\|VISIT\|NOTE...), polymorphic entity links |
| `FollowUp` | title, scheduledAt, leadId\|clientId |
| `Document` | url, publicId (Cloudinary), dealId\|propertyId\|clientId |
| `Notification` | type, message, isRead, userId |
| `Task` | title, status, priority, dueDate, assignedToId |
| `AuditLog` | action, entity, oldData, newData, userId |
| `RefreshToken` | token, userId, expiresAt |

---

## ☁️ Cloudinary Setup

1. Create free account at [cloudinary.com](https://cloudinary.com)
2. Get your `Cloud Name`, `API Key`, `API Secret`
3. Add to `.env`

Files are organized in folders:
- `real-estate-crm/properties/` — Property images
- `real-estate-crm/documents/` — Deal documents (PDF)
- `real-estate-crm/avatars/` — User avatars

---

## 🔒 RBAC Permissions

| Action | Admin | Manager | Agent |
|---|---|---|---|
| View all leads | ✅ | ✅ | Own only |
| Create/Delete leads | ✅ | ✅ | Create only |
| Manage users | ✅ | View only | ❌ |
| View all deals | ✅ | ✅ | Own only |
| Delete properties | ✅ | ✅ | ❌ |
| View reports | ✅ | ✅ | Own metrics |

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Push to GitHub, then connect to Vercel
# Set environment variables in Vercel dashboard
# Use Neon.tech for PostgreSQL (free)
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production

```
DATABASE_URL=           # Neon/Supabase/PlanetScale connection string
JWT_SECRET=             # 64-char random string
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXTAUTH_URL=           # https://yourdomain.com
```

---

## 📊 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router, React 19 |
| Styling | Tailwind CSS v4 |
| Backend | Next.js API Routes (Route Handlers) |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (jose) with access + refresh tokens |
| Storage | Cloudinary |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Notifications | react-hot-toast |
| Icons | Lucide React |
