/**
 * Database Configuration
 * 
 * Allows switching between Convex (cloud) and PostgreSQL (self-hosted)
 * via environment variable: USE_POSTGRES=true
 */

export type DatabaseProvider = 'convex' | 'postgres';

/**
 * Get the current database provider
 */
export function getDatabaseProvider(): DatabaseProvider {
  // Check if PostgreSQL should be used
  const usePostgres = process.env.USE_POSTGRES === 'true';
  
  // Check if PostgreSQL is configured
  const hasPostgresUrl = !!process.env.DATABASE_URL;
  
  // Check if Convex is configured
  const hasConvexUrl = !!process.env.NEXT_PUBLIC_CONVEX_URL;
  
  // Decision logic
  if (usePostgres && hasPostgresUrl) {
    return 'postgres';
  }
  
  if (hasConvexUrl) {
    return 'convex';
  }
  
  // Default to Convex if both are configured but USE_POSTGRES is not set
  if (hasConvexUrl && hasPostgresUrl) {
    console.warn('Both Convex and PostgreSQL are configured. Using Convex. Set USE_POSTGRES=true to use PostgreSQL.');
    return 'convex';
  }
  
  // If nothing is configured, throw error
  throw new Error(
    'No database configured. Please set either:\n' +
    '  - DATABASE_URL (for PostgreSQL)\n' +
    '  - NEXT_PUBLIC_CONVEX_URL (for Convex)\n' +
    'And optionally set USE_POSTGRES=true to prefer PostgreSQL.'
  );
}

/**
 * Check if using PostgreSQL
 */
export function isUsingPostgres(): boolean {
  return getDatabaseProvider() === 'postgres';
}

/**
 * Check if using Convex
 */
export function isUsingConvex(): boolean {
  return getDatabaseProvider() === 'convex';
}

