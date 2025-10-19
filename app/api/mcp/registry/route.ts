import { NextRequest, NextResponse } from 'next/server';
import { listMcpServers, saveMcpServer, deleteMcpServer, getDatabaseProvider } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mcp/registry - List all MCP servers for the user
 * Works with both Convex and PostgreSQL
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuthUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const servers = await listMcpServers(userId);
    const provider = getDatabaseProvider();

    return NextResponse.json({
      success: true,
      servers,
      source: provider,
    });
  } catch (error) {
    console.error('Error listing MCP servers:', error);
    return NextResponse.json(
      {
        error: 'Failed to list MCP servers',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mcp/registry - Create or update an MCP server
 * Works with both Convex and PostgreSQL
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuthUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      name,
      url,
      description,
      category,
      authType,
      accessToken,
      tools,
      enabled,
      isOfficial,
      headers,
    } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    const serverId = await saveMcpServer({
      id,
      userId,
      name,
      url,
      description,
      category: category || 'custom',
      authType: authType || 'none',
      accessToken,
      tools: tools || [],
      enabled: enabled !== false,
      isOfficial: isOfficial || false,
      headers,
    });

    const provider = getDatabaseProvider();

    return NextResponse.json({
      success: true,
      id: serverId,
      source: provider,
    });
  } catch (error) {
    console.error('Error saving MCP server:', error);
    return NextResponse.json(
      {
        error: 'Failed to save MCP server',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/mcp/registry - Delete an MCP server
 * Works with both Convex and PostgreSQL
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await getAuthUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Server ID is required' },
        { status: 400 }
      );
    }

    await deleteMcpServer(id, userId);
    const provider = getDatabaseProvider();

    return NextResponse.json({
      success: true,
      source: provider,
    });
  } catch (error) {
    console.error('Error deleting MCP server:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete MCP server',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
