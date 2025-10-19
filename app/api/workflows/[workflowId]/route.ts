import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowByCustomId, getWorkflow, getDatabaseProvider } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workflows/[workflowId] - Get a specific workflow
 * Works with both Convex and PostgreSQL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { workflowId } = await params;

    // Look up by customId first
    let workflow = await getWorkflowByCustomId(workflowId);

    // If not found, try direct ID lookup
    if (!workflow) {
      workflow = await getWorkflow(workflowId);
    }

    if (!workflow) {
      return NextResponse.json(
        { error: `Workflow ${workflowId} not found` },
        { status: 404 }
      );
    }

    const provider = getDatabaseProvider();

    return NextResponse.json({
      success: true,
      workflow: {
        ...workflow,
        id: workflow.customId || workflow._id || workflow.id,
      },
      source: provider,
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch workflow',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows/[workflowId] - Delete a workflow
 * Works with both Convex and PostgreSQL
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { userId } = await getAuthUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflowId } = await params;

    const { deleteWorkflow } = await import('@/lib/db');

    // Look up by customId first
    let workflow = await getWorkflowByCustomId(workflowId);

    // If not found, try direct ID lookup
    if (!workflow) {
      workflow = await getWorkflow(workflowId);
    }

    if (!workflow) {
      return NextResponse.json(
        { error: `Workflow ${workflowId} not found` },
        { status: 404 }
      );
    }

    // Verify ownership
    if (workflow.userId && workflow.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this workflow' },
        { status: 403 }
      );
    }

    // Delete using actual ID
    await deleteWorkflow(workflow._id || workflow.id!);

    const provider = getDatabaseProvider();

    return NextResponse.json({
      success: true,
      source: provider,
      message: `Workflow ${workflowId} deleted`,
    });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete workflow',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
