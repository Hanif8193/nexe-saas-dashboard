import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })
  const user = await prisma.user.findUnique({ where: { email: "admin@example.com" } })
  console.log("User found:", !!user)
  console.log("Has password:", !!user?.password)
  if (user?.password) {
    const match = await bcrypt.compare("password123", user.password)
    console.log("Password match:", match)
    console.log("Hash prefix:", user.password.substring(0, 7))
  }
  await prisma.$disconnect()
}
main().catch(console.error)
