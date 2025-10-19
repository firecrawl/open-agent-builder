/**
 * Executions Database Module
 * 
 * Handles workflow execution tracking with both Convex and PostgreSQL
 */

import { getDatabaseProvider } from './config';
import { prisma } from '../prisma';
import { getConvexClient } from '../convex/client';
import { api } from '@/convex/_generated/api';

export interface Execution {
  _id?: string;
  id?: string;
  workflowId: string;
  status: string; // "running" | "completed" | "failed"
  currentNodeId?: string | null;
  nodeResults: any;
  variables: any;
  input?: any;
  output?: any;
  error?: string | null;
  startedAt: string | Date;
  completedAt?: string | Date | null;
  threadId?: string | null;
}

export interface CreateExecutionInput {
  workflowId: string;
  status?: string;
  input?: any;
  variables?: any;
  threadId?: string;
}

/**
 * Create new execution
 */
export async function createExecution(input: CreateExecutionInput): Promise<string> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const execution = await prisma.execution.create({
      data: {
        workflowId: input.workflowId,
        status: input.status || 'running',
        currentNodeId: null,
        nodeResults: input.variables || {},
        variables: input.variables || {},
        input: input.input || {},
        startedAt: new Date(),
        threadId: input.threadId,
      },
    });
    
    return execution.id;
  } else {
    // Convex
    const convex = getConvexClient();
    const id = await convex.mutation(api.executions.create, {
      workflowId: input.workflowId as any,
      status: input.status || 'running',
      input: input.input,
      variables: input.variables || {},
      threadId: input.threadId,
    });
    return id as string;
  }
}

/**
 * Get execution by ID
 */
export async function getExecution(id: string): Promise<Execution | null> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const execution = await prisma.execution.findUnique({
      where: { id },
    });
    
    if (!execution) return null;
    
    return {
      id: execution.id,
      _id: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      currentNodeId: execution.currentNodeId,
      nodeResults: execution.nodeResults,
      variables: execution.variables,
      input: execution.input,
      output: execution.output,
      error: execution.error,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      threadId: execution.threadId,
    };
  } else {
    // Convex
    const convex = getConvexClient();
    const execution = await convex.query(api.executions.get, { id: id as any });
    return execution as Execution | null;
  }
}

/**
 * Update execution
 */
export async function updateExecution(
  id: string,
  updates: {
    status?: string;
    currentNodeId?: string;
    nodeResults?: any;
    variables?: any;
    output?: any;
    error?: string;
    completedAt?: Date;
  }
): Promise<void> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    await prisma.execution.update({
      where: { id },
      data: {
        ...(updates.status && { status: updates.status }),
        ...(updates.currentNodeId !== undefined && { currentNodeId: updates.currentNodeId }),
        ...(updates.nodeResults && { nodeResults: updates.nodeResults }),
        ...(updates.variables && { variables: updates.variables }),
        ...(updates.output && { output: updates.output }),
        ...(updates.error !== undefined && { error: updates.error }),
        ...(updates.completedAt && { completedAt: updates.completedAt }),
      },
    });
  } else {
    // Convex
    const convex = getConvexClient();
    await convex.mutation(api.executions.update, {
      id: id as any,
      ...updates,
      completedAt: updates.completedAt?.toISOString(),
    });
  }
}

/**
 * List executions for a workflow
 */
export async function listExecutions(workflowId: string, limit: number = 50): Promise<Execution[]> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const executions = await prisma.execution.findMany({
      where: { workflowId },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
    
    return executions.map(e => ({
      id: e.id,
      _id: e.id,
      workflowId: e.workflowId,
      status: e.status,
      currentNodeId: e.currentNodeId,
      nodeResults: e.nodeResults,
      variables: e.variables,
      input: e.input,
      output: e.output,
      error: e.error,
      startedAt: e.startedAt,
      completedAt: e.completedAt,
      threadId: e.threadId,
    }));
  } else {
    // Convex
    const convex = getConvexClient();
    const executions = await convex.query(api.executions.listByWorkflow, {
      workflowId: workflowId as any,
      limit,
    });
    return executions as Execution[];
  }
}

/**
 * Delete execution
 */
export async function deleteExecution(id: string): Promise<void> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    await prisma.execution.delete({
      where: { id },
    });
  } else {
    // Convex
    const convex = getConvexClient();
    await convex.mutation(api.executions.deleteExecution, { id: id as any });
  }
}

