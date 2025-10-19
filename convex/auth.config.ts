/**
 * Convex Authentication Configuration
 *
 * NOTE: This is temporarily disabled while migrating from Clerk to NextAuth
 * Phase 1 will replace Convex entirely with PostgreSQL + Prisma
 * For now, Convex will work without authentication (use API routes for auth checks)
 */

export default {
  providers: [
    // Temporarily empty - NextAuth handles all authentication
    // Phase 1 will migrate away from Convex entirely
  ],
};
