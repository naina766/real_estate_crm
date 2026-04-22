# 🏠 RealCRM — Production-Ready Real Estate CRM

A full-stack Real Estate CRM built with **Next.js 14**, **Prisma ORM**, **PostgreSQL (Neon DB)**, and **Cloudinary** — designed to manage leads, properties, clients, and deals with automation and analytics.

---

## 🔗 Live Demo

* 🌐 App:[ https://realestatecrm-sigma.vercel.app/login](https://realestatecrm-sigma.vercel.app/login)
* 📦 GitHub: https://github.com/your-username/real-estate-crm

### 🔑 Demo Credentials

| Role    | Email                                             | Password   |
| ------- | ------------------------------------------------- | ---------- |
| Admin   | [admin@realcrm.com](mailto:admin@realcrm.com)     | Admin@1234 |
| Manager | [manager@realcrm.com](mailto:manager@realcrm.com) | Agent@1234 |
| Agent   | [agent@realcrm.com](mailto:agent@realcrm.com)     | Agent@1234 |

---

## 📸 Screenshots

<img width="959" height="439" alt="image" src="https://github.com/user-attachments/assets/34025dbe-35b9-4aa5-a461-912262c092d7" />


---

## ✨ Features

### 📌 Lead Management

* Multi-source lead capture (website, API, webhook)
* Lead scoring (AI-based)
* Status tracking (New → Closed)
* Assignment & follow-ups

### 🏠 Property Management

* Full CRUD for listings
* Image upload via Cloudinary
* Advanced filtering & search
* Map-ready location fields

### 👥 Client Management

* Buyer/Seller profiles
* Interaction history tracking
* Linked with leads & deals

### 💼 Deal Management

* Kanban pipeline (drag & drop)
* Commission calculation
* Document uploads

### 🔔 Notifications & Activities

* Activity timeline (calls, emails, visits)
* Follow-up reminders
* In-app notifications

### 👨‍💼 User & Roles

* Role-based access (Admin, Manager, Agent)
* Agent performance tracking

### 📊 Reports & Analytics

* Revenue tracking
* Lead conversion rate
* Monthly performance charts

---

## 🔗 Automation (Webhook Integration)

This CRM supports automation using webhooks.

Example:

* New Lead → Trigger webhook → Send notification/email

```ts
await fetch("https://agnayi2026.app.n8n.cloud/webhook/lead-create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, phone, budget }),
});
```

> Note: If shared n8n credentials are inaccessible, webhook integration is still fully implemented in backend.

---

## 🏗️ Project Structure

```
app/
 ├── (auth)/              # Login/Register
 ├── (dashboard)/         # Protected dashboard
 └── api/                 # Backend APIs

lib/
 ├── prisma.ts            # Prisma client
 ├── auth.ts              # JWT logic
 ├── api.ts               # API helpers
 └── validations/         # Zod schemas

prisma/
 └── schema.prisma
```

---

## ⚙️ Setup Instructions

### 1. Clone Repo

```bash
git clone https://github.com/your-username/real-estate-crm.git
cd real-estate-crm
```

### 2. Install

```bash
npm install
```

### 3. Environment Variables

```env
DATABASE_URL=your_neon_db_url
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 4. Database Setup

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 5. Run App

```bash
npm run dev
```

---

## 📡 API Overview

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`

### Leads

* `GET /api/leads`
* `POST /api/leads`

### Properties

* `GET /api/properties`
* `POST /api/properties`

### Deals

* `POST /api/deals`
* `PATCH /api/deals/:id`

---

## 🗄️ Database Models

* User, Lead, Property, Client
* Deal, Activity, FollowUp
* Notification, Task, Document
* AuditLog, RefreshToken

---

## 🔒 Security

* JWT Authentication (Access + Refresh Tokens)
* HTTP-only cookies
* Role-Based Access Control (RBAC)
* Input validation using Zod

---

## 🚀 Deployment

* Vercel (Frontend + API)
* Neon DB (PostgreSQL)
* Cloudinary (Media Storage)

---

## 💡 Why This Project?

This project demonstrates:

* Full-stack development (Frontend + Backend)
* Scalable database design
* Authentication & authorization
* Real-world CRM workflows
* API + webhook integrations

---

## 📌 Future Enhancements

* AI-powered property recommendations
* WhatsApp integration
* Mobile app (React Native)
* Advanced analytics dashboard

---

## 📄 License

This project is built for learning and assignment purposes.
