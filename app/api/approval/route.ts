import { NextRequest, NextResponse } from 'next/server';
import { createApproval, getDatabaseProvider } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/approval - Create a new approval request
 * Works with both Convex and PostgreSQL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { approvalId, executionId, workflowId, nodeId, message, userId } = body;

    if (!approvalId || !workflowId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (approvalId, workflowId)' },
        { status: 400 }
      );
    }

    const id = await createApproval({
      approvalId,
      workflowId,
      executionId,
      nodeId,
      message: message || 'Approval required',
      userId,
    });

    const provider = getDatabaseProvider();

    return NextResponse.json({ 
      success: true, 
      id,
      source: provider,
    });
  } catch (error) {
    console.error('Failed to create approval record:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create approval',
      },
      { status: 500 }
    );
  }
}
