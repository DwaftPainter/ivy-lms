import bcrypt from "bcrypt";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
    adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL
    })
});

async function main() {
    console.log(await bcrypt.hash("congM456", 10))
    const admin = await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
            email: "admin@ivy.com",
            firstName: "ADMIN",
            lastName: "IVY",
            password: await bcrypt.hash("congM456", 10),
            role: "ADMIN",
            status: "ACTIVE",
            authProvider: "LOCAL",
            isActive: true
        }
    });
    console.log({ admin });
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
