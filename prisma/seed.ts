import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { UserRole, OrgRole } from "@prisma/client"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { password: hashedPassword, role: UserRole.ADMIN, name: "Admin User" },
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  })

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: { password: hashedPassword, role: UserRole.USER, name: "Regular User" },
    create: {
      email: "user@example.com",
      name: "Regular User",
      password: hashedPassword,
      role: UserRole.USER,
    },
  })

  const adminOrg = await prisma.organization.upsert({
    where: { slug: "admin-corp" },
    update: {},
    create: {
      name: "Admin Corp",
      slug: "admin-corp",
      members: {
        create: { userId: admin.id, role: OrgRole.OWNER },
      },
    },
  })

  const userOrg = await prisma.organization.upsert({
    where: { slug: "user-startup" },
    update: {},
    create: {
      name: "User Startup",
      slug: "user-startup",
      members: {
        create: { userId: user.id, role: OrgRole.OWNER },
      },
    },
  })

  console.log("Seeded:", {
    admin: admin.email,
    user: user.email,
    adminOrg: adminOrg.name,
    userOrg: userOrg.name,
  })
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
