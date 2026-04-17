import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";
const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
});
const prismaClientSingleton = () => {
    return new PrismaClient({ adapter, log: ["error"] });
};
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = prisma;
//# sourceMappingURL=db.js.map