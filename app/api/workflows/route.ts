import { NextRequest, NextResponse } from 'next/server';
import { listWorkflows, getDatabaseProvider } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workflows - List all workflows
 * Works with both Convex and PostgreSQL
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await getAuthUser();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const workflows = await listWorkflows(userId);
    const provider = getDatabaseProvider();

    return NextResponse.json({
      workflows: workflows.map((w: any) => ({
        id: w.customId || w._id || w.id, // Support both Convex and Prisma IDs
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
        nodeCount: w.nodes?.length || 0,
        edgeCount: w.edges?.length || 0,
      })),
      total: workflows.length,
      source: provider,
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch workflows',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows - Save a workflow
 * Works with both Convex and PostgreSQL
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await getAuthUser();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let workflow;
    try {
      const body = await request.text();
      if (!body || body.trim() === '') {
        return NextResponse.json(
          { error: 'Request body is empty' },
          { status: 400 }
        );
      }
      workflow = JSON.parse(body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (!workflow.id && !workflow.name) {
      return NextResponse.json(
        { error: 'Workflow must have either id or name' },
        { status: 400 }
      );
    }

    // Validate workflow has required fields
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      return NextResponse.json(
        { error: 'Workflow must have a nodes array' },
        { status: 400 }
      );
    }

    if (!workflow.edges || !Array.isArray(workflow.edges)) {
      return NextResponse.json(
        { error: 'Workflow must have an edges array' },
        { status: 400 }
      );
    }

    // Import saveWorkflow here
    const { saveWorkflow } = await import('@/lib/db');
    
    // Use workflow.id as customId
    const customId = workflow.id || `workflow_${Date.now()}`;

    const savedId = await saveWorkflow({
      userId,
      customId,
      name: workflow.name || 'Untitled Workflow',
      description: workflow.description,
      category: workflow.category,
      tags: workflow.tags,
      difficulty: workflow.difficulty,
      estimatedTime: workflow.estimatedTime,
      nodes: workflow.nodes,
      edges: workflow.edges,
      version: workflow.version,
      isTemplate: workflow.isTemplate,
    });

    const provider = getDatabaseProvider();

    return NextResponse.json({
      success: true,
      workflowId: savedId,
      source: provider,
      message: 'Workflow saved successfully',
    });
  } catch (error) {
    console.error('Error saving workflow:', error);
    return NextResponse.json(
      {
        error: 'Failed to save workflow',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows?id=xxx - Delete a workflow
 * Works with both Convex and PostgreSQL
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await getAuthUser();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('id');

    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    // Import functions here
    const { getWorkflowByCustomId, getWorkflow, deleteWorkflow } = await import('@/lib/db');

    // Look up workflow by customId first
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

    // Delete using the actual ID
    await deleteWorkflow(workflow._id || workflow.id!);

    const provider = getDatabaseProvider();

    return NextResponse.json({
      success: true,
      source: provider,
      message: 'Workflow deleted successfully',
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

