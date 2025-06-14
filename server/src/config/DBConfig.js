import {PrismaClient} from '../../prisma/generated/prisma/index.js';
import logger from '../logger/index.js';

const globalForPrisma = globalThis;
// prevents multiple clients being created during hot-reloads (especially useful with tools like nodemon
const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

async function testConnection() {
    try {
        await prisma.$connect();
        logger.info('✅ Prisma connected to the database successfully.');
    } catch (err) {
        logger.error('❌ Prisma failed to connect to the database:', err);
        process.exit(1); 
    }
}

testConnection();

export default prisma;
