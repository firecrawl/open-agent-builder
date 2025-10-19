import { NextResponse } from 'next/server';
import { deleteWorkflowsWithoutUserId, getDatabaseProvider } from '@/lib/db';

/**
 * DELETE /api/workflows/cleanup
 * Clean up workflows without userId (development/admin only)
 * Works with both Convex and PostgreSQL
 */
export async function DELETE() {
  try {
    const result = await deleteWorkflowsWithoutUserId();
    const provider = getDatabaseProvider();

    return NextResponse.json({
      ...result,
      source: provider,
    });
  } catch (error) {
    console.error('Error cleaning up workflows:', error);
    return NextResponse.json(
      {
        error: 'Failed to clean up workflows',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
