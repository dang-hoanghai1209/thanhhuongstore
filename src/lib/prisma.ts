import { PrismaClient } from '@prisma/client';

const directDatabaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!directDatabaseUrl) {
  throw new Error('DIRECT_URL or DATABASE_URL must be configured.');
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: directDatabaseUrl,
      },
    },
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
