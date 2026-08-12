import { PrismaClient } from '@prisma/client'
import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeonHttp } from '@prisma/adapter-neon'


const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL || "<ENTFERNT_DATABASE_URL>";
    
    if (process.env.NODE_ENV !== 'production') {
        console.log("[Prisma initialized] DATABASE_URL configured:", !!process.env.DATABASE_URL);
    }

    // In Node 21+, WebSocket is natively available globally.
    // Ensure neonConfig uses the global WebSocket to prevent crashes.
    if (typeof globalThis !== 'undefined' && globalThis.WebSocket) {
        neonConfig.webSocketConstructor = globalThis.WebSocket;
    }

    const adapter = new PrismaNeonHttp(connectionString as string, {
        fetchOptions: {
            cache: 'no-store',
        }
    });
    return new PrismaClient({ adapter });
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
