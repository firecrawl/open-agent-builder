import { NextRequest } from 'next/server';
import { LangGraphExecutor } from '@/lib/workflow/langgraph';
import { Workflow } from '@/lib/workflow/types';
import { createExecution, updateExecutionStatus } from '@/lib/db';

/**
 * POST /api/workflow/execute
 * Execute a workflow and stream results via SSE
 * Works with both Convex and PostgreSQL
 */
export async function POST(req: NextRequest) {
  let executionId: string | undefined;

  try {
    const body = await req.json();
    const { workflow, input } = body as { workflow: Workflow; input?: string };

    if (!workflow) {
      return new Response(
        JSON.stringify({ error: 'Workflow is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create execution record
    executionId = await createExecution({
      workflowId: workflow.id || 'temp-workflow',
      input: input || '',
      variables: {},
    });

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial event with execution ID
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'start',
            executionId,
            workflow: workflow.name,
            input
          })}\n\n`)
        );

        const apiKeys = {
          anthropic: process.env.ANTHROPIC_API_KEY,
          groq: process.env.GROQ_API_KEY,
          openai: process.env.OPENAI_API_KEY,
          firecrawl: process.env.FIRECRAWL_API_KEY,
          arcade: process.env.ARCADE_API_KEY,
        };

        // Create executor with update callback
        const executor = new LangGraphExecutor(
          workflow,
          (nodeId, result) => {
            // Stream node updates
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'node_update',
                nodeId,
                result
              })}\n\n`)
            );
          },
          apiKeys
        );

        try {
          // Execute workflow
          const execution = await executor.execute(input || '');

          // Update execution record
          await updateExecutionStatus(
            executionId!,
            execution.status,
            execution.nodeResults,
            execution.output,
            execution.error
          );

          // Send completion event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'complete',
              execution: {
                ...execution,
                id: executionId,
              }
            })}\n\n`)
          );
        } catch (error) {
          // Update execution as failed
          if (executionId) {
            try {
              await updateExecutionStatus(
                executionId,
                'failed',
                {},
                null,
                error instanceof Error ? error.message : 'Unknown error'
              );
            } catch (updateError) {
              console.error('Failed to update execution status:', updateError);
            }
          }

          // Send error event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Workflow execution error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
