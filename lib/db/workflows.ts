/**
 * Workflows Database Module
 * 
 * Provides a unified API for workflows that works with both:
 * - Convex (cloud)
 * - PostgreSQL (self-hosted)
 * 
 * The database provider is determined by lib/db/config.ts
 */

import { getDatabaseProvider } from './config';
import { prisma } from '../prisma';
import { getConvexClient } from '../convex/client';
import { api } from '@/convex/_generated/api';

// Types
export interface Workflow {
  _id?: string; // Convex ID
  id?: string;  // Prisma ID
  userId?: string | null;
  customId?: string | null;
  name: string;
  description?: string | null;
  category?: string | null;
  tags?: string[];
  difficulty?: string | null;
  estimatedTime?: string | null;
  nodes: any;
  edges: any;
  createdAt: string | Date;
  updatedAt: string | Date;
  version?: string | null;
  isTemplate?: boolean;
  isPublic?: boolean;
}

export interface CreateWorkflowInput {
  userId?: string;
  customId?: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  difficulty?: string;
  estimatedTime?: string;
  nodes: any[];
  edges: any[];
  version?: string;
  isTemplate?: boolean;
  isPublic?: boolean;
}

export interface UpdateWorkflowInput extends Partial<CreateWorkflowInput> {
  id: string;
}

/**
 * List all workflows for a user
 */
export async function listWorkflows(userId: string): Promise<Workflow[]> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const workflows = await prisma.workflow.findMany({
      where: {
        userId,
        isTemplate: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return workflows.map(w => ({
      id: w.id,
      _id: w.id, // For compatibility
      userId: w.userId,
      customId: w.customId,
      name: w.name,
      description: w.description,
      category: w.category,
      tags: w.tags,
      difficulty: w.difficulty,
      estimatedTime: w.estimatedTime,
      nodes: w.nodes,
      edges: w.edges,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      version: w.version,
      isTemplate: w.isTemplate || false,
      isPublic: w.isPublic || false,
    }));
  } else {
    // Convex
    const convex = getConvexClient();
    const workflows = await convex.query(api.workflows.list, {});
    return workflows as Workflow[];
  }
}

/**
 * Get workflow by ID
 */
export async function getWorkflow(id: string): Promise<Workflow | null> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const workflow = await prisma.workflow.findUnique({
      where: { id },
    });
    
    if (!workflow) return null;
    
    return {
      id: workflow.id,
      _id: workflow.id,
      userId: workflow.userId,
      customId: workflow.customId,
      name: workflow.name,
      description: workflow.description,
      category: workflow.category,
      tags: workflow.tags,
      difficulty: workflow.difficulty,
      estimatedTime: workflow.estimatedTime,
      nodes: workflow.nodes,
      edges: workflow.edges,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      version: workflow.version,
      isTemplate: workflow.isTemplate || false,
      isPublic: workflow.isPublic || false,
    };
  } else {
    // Convex
    const convex = getConvexClient();
    const workflow = await convex.query(api.workflows.getWorkflow, { id: id as any });
    return workflow as Workflow | null;
  }
}

/**
 * Get workflow by custom ID
 */
export async function getWorkflowByCustomId(customId: string): Promise<Workflow | null> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const workflow = await prisma.workflow.findFirst({
      where: { customId },
    });
    
    if (!workflow) return null;
    
    return {
      id: workflow.id,
      _id: workflow.id,
      userId: workflow.userId,
      customId: workflow.customId,
      name: workflow.name,
      description: workflow.description,
      category: workflow.category,
      tags: workflow.tags,
      difficulty: workflow.difficulty,
      estimatedTime: workflow.estimatedTime,
      nodes: workflow.nodes,
      edges: workflow.edges,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      version: workflow.version,
      isTemplate: workflow.isTemplate || false,
      isPublic: workflow.isPublic || false,
    };
  } else {
    // Convex
    const convex = getConvexClient();
    const workflow = await convex.query(api.workflows.getWorkflowByCustomId, { customId });
    return workflow as Workflow | null;
  }
}

/**
 * Create or update workflow
 */
export async function saveWorkflow(input: CreateWorkflowInput): Promise<string> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    // Check if workflow exists by customId
    if (input.customId) {
      const existing = await prisma.workflow.findFirst({
        where: { customId: input.customId },
      });
      
      if (existing) {
        // Update existing
        await prisma.workflow.update({
          where: { id: existing.id },
          data: {
            name: input.name,
            description: input.description,
            category: input.category,
            tags: input.tags || [],
            difficulty: input.difficulty,
            estimatedTime: input.estimatedTime,
            nodes: input.nodes as any,
            edges: input.edges as any,
            version: input.version,
            isTemplate: input.isTemplate,
            isPublic: input.isPublic,
            updatedAt: new Date(),
          },
        });
        return existing.id;
      }
    }
    
    // Create new
    const workflow = await prisma.workflow.create({
      data: {
        userId: input.userId,
        customId: input.customId,
        name: input.name,
        description: input.description,
        category: input.category,
        tags: input.tags || [],
        difficulty: input.difficulty,
        estimatedTime: input.estimatedTime,
        nodes: input.nodes as any,
        edges: input.edges as any,
        version: input.version,
        isTemplate: input.isTemplate || false,
        isPublic: input.isPublic || false,
      },
    });
    
    return workflow.id;
  } else {
    // Convex
    const convex = getConvexClient();
    const id = await convex.mutation(api.workflows.saveWorkflow, input as any);
    return id as string;
  }
}

/**
 * Delete workflow
 */
export async function deleteWorkflow(id: string): Promise<void> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    await prisma.workflow.delete({
      where: { id },
    });
  } else {
    // Convex
    const convex = getConvexClient();
    await convex.mutation(api.workflows.deleteWorkflow, { id: id as any });
  }
}

/**
 * Duplicate workflow
 */
export async function duplicateWorkflow(id: string, userId: string): Promise<string> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const original = await prisma.workflow.findUnique({
      where: { id },
    });
    
    if (!original) {
      throw new Error('Workflow not found');
    }
    
    // Create duplicate with new customId
    const duplicate = await prisma.workflow.create({
      data: {
        userId,
        customId: `${original.customId || original.id}-copy-${Date.now()}`,
        name: `${original.name} (Copy)`,
        description: original.description,
        category: original.category,
        tags: original.tags,
        difficulty: original.difficulty,
        estimatedTime: original.estimatedTime,
        nodes: original.nodes,
        edges: original.edges,
        version: original.version,
        isTemplate: false,
        isPublic: false,
      },
    });
    
    return duplicate.id;
  } else {
    // Convex
    const convex = getConvexClient();
    const newId = await convex.mutation(api.workflows.duplicateWorkflow, { id: id as any, userId });
    return newId as string;
  }
}

/**
 * List templates (public workflows)
 */
export async function listTemplates(): Promise<Workflow[]> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const templates = await prisma.workflow.findMany({
      where: {
        isTemplate: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return templates.map(t => ({
      id: t.id,
      _id: t.id,
      userId: t.userId,
      customId: t.customId,
      name: t.name,
      description: t.description,
      category: t.category,
      tags: t.tags,
      difficulty: t.difficulty,
      estimatedTime: t.estimatedTime,
      nodes: t.nodes,
      edges: t.edges,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      version: t.version,
      isTemplate: true,
      isPublic: t.isPublic || false,
    }));
  } else {
    // Convex
    const convex = getConvexClient();
    const templates = await convex.query(api.workflows.listTemplates, {});
    return templates as Workflow[];
  }
}

/**
 * Delete workflows without userId (admin/cleanup)
 */
export async function deleteWorkflowsWithoutUserId(): Promise<{ deleted: number }> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const result = await prisma.workflow.deleteMany({
      where: {
        userId: null,
      },
    });
    
    return { deleted: result.count };
  } else {
    // Convex
    const convex = getConvexClient();
    const result = await convex.mutation(api.workflows.deleteWorkflowsWithoutUserId, {});
    return result as { deleted: number };
  }
}

