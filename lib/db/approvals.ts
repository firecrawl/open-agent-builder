/**
 * Approvals Database Module
 * 
 * Handles human-in-the-loop approval requests with both Convex and PostgreSQL
 */

import { getDatabaseProvider } from './config';
import { prisma } from '../prisma';
import { getConvexClient } from '../convex/client';
import { api } from '@/convex/_generated/api';

export interface Approval {
  _id?: string;
  id?: string;
  approvalId: string;
  workflowId: string;
  executionId?: string | null;
  nodeId?: string | null;
  message: string;
  status: string; // "pending" | "approved" | "rejected"
  userId?: string | null;
  createdBy?: string | null;
  respondedAt?: string | Date | null;
  respondedBy?: string | null;
  createdAt: string | Date;
}

export interface CreateApprovalInput {
  approvalId: string;
  workflowId: string;
  executionId?: string;
  nodeId?: string;
  message: string;
  userId?: string;
  createdBy?: string;
}

/**
 * Create approval request
 */
export async function createApproval(input: CreateApprovalInput): Promise<string> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const approval = await prisma.approval.create({
      data: {
        approvalId: input.approvalId,
        workflowId: input.workflowId,
        executionId: input.executionId,
        nodeId: input.nodeId,
        message: input.message,
        status: 'pending',
        userId: input.userId,
        createdBy: input.createdBy,
      },
    });
    
    return approval.id;
  } else {
    // Convex
    const convex = getConvexClient();
    const id = await convex.mutation(api.approvals.create, input as any);
    return id as string;
  }
}

/**
 * Get approval by approval ID
 */
export async function getApproval(approvalId: string): Promise<Approval | null> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const approval = await prisma.approval.findUnique({
      where: { approvalId },
    });
    
    if (!approval) return null;
    
    return {
      id: approval.id,
      _id: approval.id,
      approvalId: approval.approvalId,
      workflowId: approval.workflowId,
      executionId: approval.executionId,
      nodeId: approval.nodeId,
      message: approval.message,
      status: approval.status,
      userId: approval.userId,
      createdBy: approval.createdBy,
      respondedAt: approval.respondedAt,
      respondedBy: approval.respondedBy,
      createdAt: approval.createdAt,
    };
  } else {
    // Convex
    const convex = getConvexClient();
    const approval = await convex.query(api.approvals.getByApprovalId, { approvalId });
    return approval as Approval | null;
  }
}

/**
 * Update approval status
 */
export async function updateApprovalStatus(
  approvalId: string,
  status: 'approved' | 'rejected',
  respondedBy: string
): Promise<void> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    await prisma.approval.update({
      where: { approvalId },
      data: {
        status,
        respondedAt: new Date(),
        respondedBy,
      },
    });
  } else {
    // Convex
    const convex = getConvexClient();
    await convex.mutation(api.approvals.updateStatus, {
      approvalId,
      status,
      respondedBy,
    });
  }
}

/**
 * List pending approvals for a user
 */
export async function listPendingApprovals(userId: string): Promise<Approval[]> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const approvals = await prisma.approval.findMany({
      where: {
        userId,
        status: 'pending',
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return approvals.map(a => ({
      id: a.id,
      _id: a.id,
      approvalId: a.approvalId,
      workflowId: a.workflowId,
      executionId: a.executionId,
      nodeId: a.nodeId,
      message: a.message,
      status: a.status,
      userId: a.userId,
      createdBy: a.createdBy,
      respondedAt: a.respondedAt,
      respondedBy: a.respondedBy,
      createdAt: a.createdAt,
    }));
  } else {
    // Convex
    const convex = getConvexClient();
    const approvals = await convex.query(api.approvals.listPending, { userId });
    return approvals as Approval[];
  }
}

/**
 * List approvals for a workflow
 */
export async function listWorkflowApprovals(workflowId: string): Promise<Approval[]> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const approvals = await prisma.approval.findMany({
      where: { workflowId },
      orderBy: { createdAt: 'desc' },
    });
    
    return approvals.map(a => ({
      id: a.id,
      _id: a.id,
      approvalId: a.approvalId,
      workflowId: a.workflowId,
      executionId: a.executionId,
      nodeId: a.nodeId,
      message: a.message,
      status: a.status,
      userId: a.userId,
      createdBy: a.createdBy,
      respondedAt: a.respondedAt,
      respondedBy: a.respondedBy,
      createdAt: a.createdAt,
    }));
  } else {
    // Convex
    const convex = getConvexClient();
    const approvals = await convex.query(api.approvals.listByWorkflow, { workflowId: workflowId as any });
    return approvals as Approval[];
  }
}

