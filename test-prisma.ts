import { prisma } from "./src/lib/prisma"

async function main() {
  try {
    const userCount = await prisma.user.count()
    console.log("User count:", userCount)
  } catch (error) {
    console.error("Prisma error:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
