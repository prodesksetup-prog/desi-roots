import { Prisma } from '@prisma/client';

export function isPrismaConnectionError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Error &&
      /Authentication failed against database server|Can't reach database server|Environment variable not found: DATABASE_URL/i.test(
        error.message,
      ))
  );
}

export function getDatabaseConfigMessage() {
  return 'Database is not configured correctly. Update DATABASE_URL with a valid PostgreSQL connection string.';
}
