import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Users ──────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@1234", 12);
  const agentPassword = await bcrypt.hash("Agent@1234", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@realcrm.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@realcrm.com",
      password: adminPassword,
      role: "ADMIN",
      phone: "+91 98765 00001",
      isApproved: true,
      isActive: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@realcrm.com" },
    update: {},
    create: {
      name: "Priya Sharma",
      email: "manager@realcrm.com",
      password: agentPassword,
      role: "MANAGER",
      phone: "+91 98765 00002",
      isApproved: true,
      isActive: true,
    },
  });

  const agent1 = await prisma.user.upsert({
    where: { email: "agent@realcrm.com" },
    update: {},
    create: {
      name: "Rahul Verma",
      email: "agent@realcrm.com",
      password: agentPassword,
      role: "AGENT",
      phone: "+91 98765 00003",
      isApproved: true,
      isActive: true,
    },
  });

  const agent2 = await prisma.user.upsert({
    where: { email: "agent2@realcrm.com" },
    update: {},
    create: {
      name: "Anjali Singh",
      email: "agent2@realcrm.com",
      password: agentPassword,
      role: "AGENT",
      phone: "+91 98765 00004",
      isApproved: true,
      isActive: true,
    },
  });

  console.log("✅ Users created");

  // ── Properties ─────────────────────────────────────────────────
  const prop1 = await prisma.property.create({
    data: {
      title: "Luxury 3BHK Apartment - Bandra West",
      description: "Premium sea-facing apartment with modern amenities",
      type: "RESIDENTIAL",
      status: "AVAILABLE",
      address: "Sea View Towers, Hill Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      latitude: 19.0544,
      longitude: 72.8258,
      price: 25000000,
      size: 1800,
      bedrooms: 3,
      bathrooms: 3,
      amenities: ["Swimming Pool", "Gym", "24/7 Security", "Parking", "Clubhouse"],
      isFeatured: true,
      agentId: agent1.id,
      thumbnailUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    },
  });

  const prop2 = await prisma.property.create({
    data: {
      title: "Commercial Office Space - Cyber City",
      description: "Grade A office space with modern infrastructure",
      type: "COMMERCIAL",
      status: "AVAILABLE",
      address: "DLF Cyber City, Phase 2",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122002",
      latitude: 28.495,
      longitude: 77.0895,
      price: 75000000,
      size: 5000,
      floors: 3,
      amenities: ["High-speed Internet", "Conference Rooms", "Cafeteria", "Power Backup"],
      agentId: agent2.id,
      thumbnailUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    },
  });

  const prop3 = await prisma.property.create({
    data: {
      title: "Independent Villa - Koramangala",
      description: "Spacious 4BHK villa with private garden",
      type: "RESIDENTIAL",
      status: "UNDER_OFFER",
      address: "8th Block, Koramangala",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560095",
      latitude: 12.9352,
      longitude: 77.6245,
      price: 45000000,
      size: 3200,
      bedrooms: 4,
      bathrooms: 4,
      amenities: ["Private Garden", "Home Theatre", "Smart Home", "EV Charging"],
      agentId: agent1.id,
      thumbnailUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    },
  });

  console.log("✅ Properties created");

  // ── Clients ────────────────────────────────────────────────────
  const client1 = await prisma.client.create({
    data: {
      name: "Vikram Malhotra",
      email: "vikram.m@example.com",
      phone: "+91 98100 11111",
      type: "BUYER",
      preferences: { budget: 30000000, location: ["Mumbai", "Pune"], type: "RESIDENTIAL", bedrooms: 3 },
      agentId: agent1.id,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: "Sunita Reddy",
      email: "sunita.r@example.com",
      phone: "+91 98100 22222",
      type: "SELLER",
      preferences: { listedPrice: 50000000 },
      agentId: agent2.id,
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: "Aditya Kumar",
      email: "aditya.k@example.com",
      phone: "+91 98100 33333",
      type: "BOTH",
      agentId: agent1.id,
    },
  });

  console.log("✅ Clients created");

  // ── Leads ──────────────────────────────────────────────────────
  const lead1 = await prisma.lead.create({
    data: {
      name: "Rajesh Patel",
      phone: "+91 98200 11111",
      email: "rajesh.p@example.com",
      budget: 15000000,
      source: "WEBSITE",
      status: "QUALIFIED",
      score: 72,
      preferences: { bedrooms: 2, location: "Andheri", type: "RESIDENTIAL" },
      assignedToId: agent1.id,
      createdById: admin.id,
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      name: "Meera Joshi",
      phone: "+91 98200 22222",
      email: "meera.j@example.com",
      budget: 30000000,
      source: "REFERRAL",
      status: "CONTACTED",
      score: 58,
      assignedToId: agent2.id,
      createdById: admin.id,
    },
  });

  const lead3 = await prisma.lead.create({
    data: {
      name: "Suresh Nair",
      phone: "+91 98200 33333",
      source: "PORTAL",
      status: "NEW",
      score: 25,
      assignedToId: agent1.id,
      createdById: agent1.id,
    },
  });

  const lead4 = await prisma.lead.create({
    data: {
      name: "Kavita Sharma",
      phone: "+91 98200 44444",
      email: "kavita@example.com",
      budget: 60000000,
      source: "SOCIAL_MEDIA",
      status: "CLOSED",
      score: 91,
      clientId: client1.id,
      assignedToId: agent1.id,
      createdById: agent1.id,
    },
  });

  const lead5 = await prisma.lead.create({
    data: {
      name: "Prakash Mehta",
      phone: "+91 98200 55555",
      source: "COLD_CALL",
      status: "LOST",
      score: 12,
      assignedToId: agent2.id,
      createdById: agent2.id,
    },
  });

  console.log("✅ Leads created");

  // ── Deals ──────────────────────────────────────────────────────
  const deal1 = await prisma.deal.create({
    data: {
      title: "3BHK Bandra - Vikram Malhotra",
      stage: "NEGOTIATION",
      amount: 24500000,
      commissionRate: 2.0,
      commissionAmount: 490000,
      clientId: client1.id,
      propertyId: prop1.id,
      agentId: agent1.id,
      leadId: lead4.id,
      notes: "Client interested, negotiating price",
    },
  });

  const deal2 = await prisma.deal.create({
    data: {
      title: "Office Space - Gurugram",
      stage: "AGREEMENT",
      amount: 72000000,
      commissionRate: 1.5,
      commissionAmount: 1080000,
      clientId: client2.id,
      propertyId: prop2.id,
      agentId: agent2.id,
      notes: "LOI signed, preparing final agreement",
    },
  });

  const deal3 = await prisma.deal.create({
    data: {
      title: "Koramangala Villa Sale",
      stage: "CLOSED_WON",
      amount: 44500000,
      commissionRate: 2.0,
      commissionAmount: 890000,
      clientId: client3.id,
      propertyId: prop3.id,
      agentId: agent1.id,
      closedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });

  const deal4 = await prisma.deal.create({
    data: {
      title: "Commercial Space - Bangalore",
      stage: "PROSPECTING",
      amount: 35000000,
      commissionRate: 2.0,
      commissionAmount: 700000,
      clientId: client1.id,
      agentId: agent2.id,
    },
  });

  console.log("✅ Deals created");

  // ── Activities ─────────────────────────────────────────────────
  await prisma.activity.createMany({
    data: [
      {
        type: "CALL",
        title: "Initial call with Rajesh",
        description: "Discussed property requirements, budget ₹1.5Cr, prefers Andheri",
        userId: agent1.id,
        leadId: lead1.id,
        metadata: { duration: "12 mins" },
      },
      {
        type: "EMAIL",
        title: "Sent property listings to Meera",
        description: "Shared 5 property listings matching criteria",
        userId: agent2.id,
        leadId: lead2.id,
      },
      {
        type: "VISIT",
        title: "Site visit - Bandra apartment",
        description: "Client visited property, showed interest",
        userId: agent1.id,
        clientId: client1.id,
        dealId: deal1.id,
        propertyId: prop1.id,
      },
      {
        type: "DEAL_STAGE_CHANGE",
        title: "Deal moved to Negotiation",
        description: "Stage changed from PROSPECTING to NEGOTIATION",
        userId: agent1.id,
        dealId: deal1.id,
        clientId: client1.id,
        metadata: { from: "PROSPECTING", to: "NEGOTIATION" },
      },
      {
        type: "NOTE",
        title: "Follow-up note",
        description: "Client seems eager, decision expected within 2 weeks",
        userId: agent2.id,
        dealId: deal2.id,
      },
    ],
  });

  console.log("✅ Activities created");

  // ── Notifications ──────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        type: "LEAD_ASSIGNED",
        title: "New lead assigned",
        message: `Lead "${lead1.name}" has been assigned to you`,
        userId: agent1.id,
        leadId: lead1.id,
        isRead: true,
      },
      {
        type: "FOLLOW_UP_DUE",
        title: "Follow-up due today",
        message: `Follow up with ${lead2.name} is due today`,
        userId: agent2.id,
        isRead: false,
      },
      {
        type: "DEAL_STAGE_CHANGE",
        title: "Deal stage updated",
        message: `"${deal1.title}" moved to Negotiation`,
        userId: agent1.id,
        isRead: false,
      },
    ],
  });

  // ── Follow-ups ─────────────────────────────────────────────────
  await prisma.followUp.createMany({
    data: [
      {
        title: "Call Rajesh about final decision",
        notes: "Confirm if they want to proceed with the Bandra apartment",
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        userId: agent1.id,
        leadId: lead1.id,
      },
      {
        title: "Email updated floor plan to Meera",
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        userId: agent2.id,
        leadId: lead2.id,
      },
      {
        title: "Schedule 2nd visit for deal agreement",
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        userId: agent2.id,
        clientId: client2.id,
      },
    ],
  });

  console.log("✅ Follow-ups and notifications created");
  console.log("\n🎉 Seeding complete!\n");
  console.log("Login credentials:");
  console.log("  Admin:   admin@realcrm.com / Admin@1234");
  console.log("  Manager: manager@realcrm.com / Agent@1234");
  console.log("  Agent 1: agent@realcrm.com / Agent@1234");
  console.log("  Agent 2: agent2@realcrm.com / Agent@1234\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
