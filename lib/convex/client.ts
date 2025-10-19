/**
 * Convex Client for Server-Side Operations
 *
 * NOTE: This is temporary while Convex is still used.
 * Phase 1 will replace Convex entirely with PostgreSQL + Prisma.
 * For now, Convex auth is disabled - auth is handled by NextAuth in API routes.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

let convexClient: ConvexHttpClient | null = null;

/**
 * Get an unauthenticated Convex client
 * Use getAuthenticatedConvexClient() when user auth is needed
 */
export function getConvexClient(): ConvexHttpClient {
  if (!convexClient) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!url) {
      throw new Error(
        'Convex URL not configured. ' +
        'Please add NEXT_PUBLIC_CONVEX_URL to .env.local'
      );
    }

    try {
      convexClient = new ConvexHttpClient(url);
    } catch (error) {
      console.error('Failed to initialize Convex client:', error);
      throw new Error(`Convex client initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return convexClient;
}

/**
 * Get a Convex client (no auth needed - handled by NextAuth in API routes)
 * 
 * NOTE: Convex auth is disabled during NextAuth migration.
 * Use NextAuth's getAuthUser() in your API route to check auth,
 * then pass userId explicitly to Convex queries/mutations.
 * 
 * Migration in progress:
 * - Phase 2: Using NextAuth for auth (current)
 * - Phase 1: Will replace Convex entirely with PostgreSQL
 */
export async function getAuthenticatedConvexClient(): Promise<ConvexHttpClient> {
  // For now, just return unauthenticated client
  // Auth checks should be done in API routes using NextAuth
  return getConvexClient();
}

/**
 * Check if Convex is configured
 */
export function isConvexConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_CONVEX_URL;
}

// Export API for convenience
export { api };
export type { ConvexHttpClient };
