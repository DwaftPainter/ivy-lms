import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcrypt"

function createPrismaClient() {
  const client = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL
    })
  })

  return client.$extends({
    query: {
      user: {
        async create({ args, query }) {
          if (args.data.password) {
            args.data.password = await bcrypt.hash(args.data.password as string, 10)
          }
          return query(args)
        }
      }
    }
  })
}

type PrismaClientExtended = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientExtended | undefined
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}