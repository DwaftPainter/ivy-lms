import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma =  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL
    })
  })

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      firstName: 'ADMIN',
      lastName: 'IVY',
      password: 'congM456',
      role: 'ADMIN',
      status: 'ACTIVE',
      authProvider: 'LOCAL',
      isActive: true,
    },
  })
  console.log({ admin })
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())