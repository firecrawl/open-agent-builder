/**
 * API Keys Database Module
 * 
 * Handles user-generated API keys for API access with both Convex and PostgreSQL
 */

import { getDatabaseProvider } from './config';
import { prisma } from '../prisma';
import { getConvexClient } from '../convex/client';
import { api } from '@/convex/_generated/api';

export interface ApiKey {
  _id?: string;
  id?: string;
  key: string; // Hashed
  keyPrefix: string; // For display
  userId: string;
  name: string;
  usageCount: number;
  lastUsedAt?: string | Date | null;
  createdAt: string | Date;
  expiresAt?: string | Date | null;
  revokedAt?: string | Date | null;
}

export interface CreateApiKeyInput {
  key: string; // Hashed
  keyPrefix: string;
  userId: string;
  name: string;
  expiresAt?: Date;
}

/**
 * Create API key
 */
export async function createApiKey(input: CreateApiKeyInput): Promise<string> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const apiKey = await prisma.apiKey.create({
      data: {
        key: input.key,
        keyPrefix: input.keyPrefix,
        userId: input.userId,
        name: input.name,
        usageCount: 0,
        expiresAt: input.expiresAt,
      },
    });
    
    return apiKey.id;
  } else {
    // Convex
    const convex = getConvexClient();
    const id = await convex.mutation(api.apiKeys.create, input as any);
    return id as string;
  }
}

/**
 * Get API key by hashed key
 */
export async function getApiKeyByKey(key: string): Promise<ApiKey | null> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const apiKey = await prisma.apiKey.findUnique({
      where: { key },
    });
    
    if (!apiKey) return null;
    
    return {
      id: apiKey.id,
      _id: apiKey.id,
      key: apiKey.key,
      keyPrefix: apiKey.keyPrefix,
      userId: apiKey.userId,
      name: apiKey.name,
      usageCount: apiKey.usageCount,
      lastUsedAt: apiKey.lastUsedAt,
      createdAt: apiKey.createdAt,
      expiresAt: apiKey.expiresAt,
      revokedAt: apiKey.revokedAt,
    };
  } else {
    // Convex
    const convex = getConvexClient();
    const apiKey = await convex.query(api.apiKeys.getByKey, { key });
    return apiKey as ApiKey | null;
  }
}

/**
 * List API keys for a user
 */
export async function listApiKeys(userId: string): Promise<ApiKey[]> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId,
        revokedAt: null, // Only active keys
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return apiKeys.map(k => ({
      id: k.id,
      _id: k.id,
      key: k.key,
      keyPrefix: k.keyPrefix,
      userId: k.userId,
      name: k.name,
      usageCount: k.usageCount,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
      expiresAt: k.expiresAt,
      revokedAt: k.revokedAt,
    }));
  } else {
    // Convex
    const convex = getConvexClient();
    const apiKeys = await convex.query(api.apiKeys.list, { userId });
    return apiKeys as ApiKey[];
  }
}

/**
 * Revoke API key
 */
export async function revokeApiKey(id: string, userId: string): Promise<void> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    await prisma.apiKey.update({
      where: {
        id,
        userId, // Ensure user owns this key
      },
      data: {
        revokedAt: new Date(),
      },
    });
  } else {
    // Convex
    const convex = getConvexClient();
    await convex.mutation(api.apiKeys.revoke, { id: id as any, userId });
  }
}

/**
 * Update API key usage
 */
export async function updateApiKeyUsage(id: string): Promise<void> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    await prisma.apiKey.update({
      where: { id },
      data: {
        lastUsedAt: new Date(),
        usageCount: { increment: 1 },
      },
    });
  } else {
    // Convex
    const convex = getConvexClient();
    await convex.mutation(api.apiKeys.updateUsage, { id: id as any });
  }
}

