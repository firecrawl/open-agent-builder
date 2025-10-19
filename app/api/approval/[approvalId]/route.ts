import { NextRequest, NextResponse } from 'next/server';
import { getApproval, updateApprovalStatus, getDatabaseProvider } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/approval/[approvalId] - Get approval status
 * Works with both Convex and PostgreSQL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ approvalId: string }> }
) {
  const { approvalId } = await params;

  if (!approvalId) {
    return NextResponse.json(
      { success: false, error: 'Approval ID is required' },
      { status: 400 }
    );
  }

  const record = await getApproval(approvalId);
  if (!record) {
    return NextResponse.json(
      { success: false, error: 'Approval record not found' },
      { status: 404 }
    );
  }

  const provider = getDatabaseProvider();

  return NextResponse.json({
    success: true,
    record,
    source: provider,
  });
}

/**
 * POST /api/approval/[approvalId] - Approve or reject
 * Works with both Convex and PostgreSQL
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ approvalId: string }> }
) {
  const { approvalId } = await params;

  if (!approvalId) {
    return NextResponse.json(
      { success: false, error: 'Approval ID is required' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { action, userId } = body;

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { success: false, error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const status = action === 'approve' ? 'approved' : 'rejected';
    await updateApprovalStatus(approvalId, status, userId);

    const record = await getApproval(approvalId);
    const provider = getDatabaseProvider();

    return NextResponse.json({
      success: true,
      record,
      source: provider,
    });
  } catch (error) {
    console.error('Failed to update approval:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update approval',
      },
      { status: 500 }
    );
  }
}
