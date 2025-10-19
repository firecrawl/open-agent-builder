/**
 * User LLM Keys Database Module
 * 
 * Handles user-provided LLM API keys with both Convex and PostgreSQL
 */

import { getDatabaseProvider } from './config';
import { prisma } from '../prisma';
import { getConvexClient } from '../convex/client';
import { api } from '@/convex/_generated/api';

export interface UserLLMKey {
  _id?: string;
  id?: string;
  userId: string;
  provider: string; // "anthropic" | "openai" | "groq"
  encryptedKey: string;
  keyPrefix: string;
  label?: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  lastUsedAt?: string | Date | null;
  usageCount: number;
}

export interface CreateUserLLMKeyInput {
  userId: string;
  provider: string;
  encryptedKey: string;
  keyPrefix: string;
  label?: string;
}

/**
 * Get LLM keys for a user
 */
export async function getUserLLMKeys(userId: string): Promise<UserLLMKey[]> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const keys = await prisma.userLLMKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    return keys.map(k => ({
      id: k.id,
      _id: k.id,
      userId: k.userId,
      provider: k.provider,
      encryptedKey: k.encryptedKey,
      keyPrefix: k.keyPrefix,
      label: k.label,
      isActive: k.isActive,
      createdAt: k.createdAt,
      updatedAt: k.updatedAt,
      lastUsedAt: k.lastUsedAt,
      usageCount: k.usageCount,
    }));
  } else {
    // Convex
    const convex = getConvexClient();
    const keys = await convex.query(api.userLLMKeys.getUserLLMKeys, { userId });
    return keys as UserLLMKey[];
  }
}

/**
 * Get active LLM key for a provider
 */
export async function getActiveLLMKey(userId: string, provider: string): Promise<UserLLMKey | null> {
  const dbProvider = getDatabaseProvider();
  
  if (dbProvider === 'postgres') {
    const key = await prisma.userLLMKey.findFirst({
      where: {
        userId,
        provider,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    if (!key) return null;
    
    return {
      id: key.id,
      _id: key.id,
      userId: key.userId,
      provider: key.provider,
      encryptedKey: key.encryptedKey,
      keyPrefix: key.keyPrefix,
      label: key.label,
      isActive: key.isActive,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
      lastUsedAt: key.lastUsedAt,
      usageCount: key.usageCount,
    };
  } else {
    // Convex
    const convex = getConvexClient();
    const key = await convex.query(api.userLLMKeys.getActiveLLMKey, { userId, provider });
    return key as UserLLMKey | null;
  }
}

/**
 * Create or update LLM key
 */
export async function upsertLLMKey(input: CreateUserLLMKeyInput): Promise<string> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    // Check if key exists for this provider
    const existing = await prisma.userLLMKey.findFirst({
      where: {
        userId: input.userId,
        provider: input.provider,
      },
    });
    
    if (existing) {
      // Update existing
      await prisma.userLLMKey.update({
        where: { id: existing.id },
        data: {
          encryptedKey: input.encryptedKey,
          keyPrefix: input.keyPrefix,
          label: input.label,
          isActive: true,
          updatedAt: new Date(),
        },
      });
      return existing.id;
    }
    
    // Create new
    const key = await prisma.userLLMKey.create({
      data: {
        userId: input.userId,
        provider: input.provider,
        encryptedKey: input.encryptedKey,
        keyPrefix: input.keyPrefix,
        label: input.label,
        isActive: true,
      },
    });
    
    return key.id;
  } else {
    // Convex
    const convex = getConvexClient();
    const id = await convex.mutation(api.userLLMKeys.upsertLLMKey, input as any);
    return id as string;
  }
}

/**
 * Delete LLM key
 */
export async function deleteLLMKey(id: string, userId: string): Promise<void> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    await prisma.userLLMKey.delete({
      where: {
        id,
        userId, // Ensure user owns this key
      },
    });
  } else {
    // Convex
    const convex = getConvexClient();
    await convex.mutation(api.userLLMKeys.deleteLLMKey, { id: id as any, userId });
  }
}

/**
 * Update key usage
 */
export async function updateKeyUsage(id: string): Promise<void> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    await prisma.userLLMKey.update({
      where: { id },
      data: {
        lastUsedAt: new Date(),
        usageCount: { increment: 1 },
        updatedAt: new Date(),
      },
    });
  } else {
    // Convex
    const convex = getConvexClient();
    await convex.mutation(api.userLLMKeys.updateKeyUsage, { id: id as any });
  }
}

