/**
 * Auth Helper Functions
 * Replaces Clerk's auth() with NextAuth getServerSession()
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get the current authenticated user
 * Replacement for: const { userId } = await auth()
 */
export async function getAuthUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { userId: null, user: null };
  }

  return {
    userId: session.user.id,
    user: session.user,
  };
}

/**
 * Require authentication - throws if not authenticated
 * Use this at the start of API routes that require auth
 */
export async function requireAuth() {
  const { userId, user } = await getAuthUser();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  return { userId, user };
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await getAuthUser();
  return !!userId;
}

