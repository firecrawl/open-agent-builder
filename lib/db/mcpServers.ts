/**
 * MCP Servers Database Module
 * 
 * Handles MCP server configurations with both Convex and PostgreSQL
 */

import { getDatabaseProvider } from './config';
import { prisma } from '../prisma';
import { getConvexClient } from '../convex/client';
import { api } from '@/convex/_generated/api';

export interface McpServer {
  _id?: string;
  id?: string;
  userId: string;
  name: string;
  url: string;
  description?: string | null;
  category: string;
  authType: string;
  accessToken?: string | null;
  tools?: string[];
  connectionStatus: string;
  lastTested?: string | Date | null;
  lastError?: string | null;
  enabled: boolean;
  isOfficial: boolean;
  headers?: any;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateMcpServerInput {
  userId: string;
  name: string;
  url: string;
  description?: string;
  category: string;
  authType: string;
  accessToken?: string;
  tools?: string[];
  enabled?: boolean;
  isOfficial?: boolean;
  headers?: any;
}

/**
 * List MCP servers for a user
 */
export async function listMcpServers(userId: string): Promise<McpServer[]> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const servers = await prisma.mcpServer.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    return servers.map(s => ({
      id: s.id,
      _id: s.id,
      userId: s.userId,
      name: s.name,
      url: s.url,
      description: s.description,
      category: s.category,
      authType: s.authType,
      accessToken: s.accessToken,
      tools: s.tools,
      connectionStatus: s.connectionStatus,
      lastTested: s.lastTested,
      lastError: s.lastError,
      enabled: s.enabled,
      isOfficial: s.isOfficial,
      headers: s.headers,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  } else {
    // Convex
    const convex = getConvexClient();
    const servers = await convex.query(api.mcpServers.list, { userId });
    return servers as McpServer[];
  }
}

/**
 * Get enabled MCP servers for a user
 */
export async function getEnabledMcpServers(userId: string): Promise<McpServer[]> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const servers = await prisma.mcpServer.findMany({
      where: {
        userId,
        enabled: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return servers.map(s => ({
      id: s.id,
      _id: s.id,
      userId: s.userId,
      name: s.name,
      url: s.url,
      description: s.description,
      category: s.category,
      authType: s.authType,
      accessToken: s.accessToken,
      tools: s.tools,
      connectionStatus: s.connectionStatus,
      lastTested: s.lastTested,
      lastError: s.lastError,
      enabled: s.enabled,
      isOfficial: s.isOfficial,
      headers: s.headers,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  } else {
    // Convex
    const convex = getConvexClient();
    const servers = await convex.query(api.mcpServers.getEnabledMCPs, { userId });
    return servers as McpServer[];
  }
}

/**
 * Get MCP server by ID
 */
export async function getMcpServer(id: string): Promise<McpServer | null> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const server = await prisma.mcpServer.findUnique({
      where: { id },
    });
    
    if (!server) return null;
    
    return {
      id: server.id,
      _id: server.id,
      userId: server.userId,
      name: server.name,
      url: server.url,
      description: server.description,
      category: server.category,
      authType: server.authType,
      accessToken: server.accessToken,
      tools: server.tools,
      connectionStatus: server.connectionStatus,
      lastTested: server.lastTested,
      lastError: server.lastError,
      enabled: server.enabled,
      isOfficial: server.isOfficial,
      headers: server.headers,
      createdAt: server.createdAt,
      updatedAt: server.updatedAt,
    };
  } else {
    // Convex
    const convex = getConvexClient();
    const server = await convex.query(api.mcpServers.get, { id: id as any });
    return server as McpServer | null;
  }
}

/**
 * Create MCP server
 */
export async function createMcpServer(input: CreateMcpServerInput): Promise<string> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    const server = await prisma.mcpServer.create({
      data: {
        userId: input.userId,
        name: input.name,
        url: input.url,
        description: input.description,
        category: input.category,
        authType: input.authType,
        accessToken: input.accessToken,
        tools: input.tools || [],
        connectionStatus: 'untested',
        enabled: input.enabled !== undefined ? input.enabled : true,
        isOfficial: input.isOfficial || false,
        headers: input.headers,
      },
    });
    
    return server.id;
  } else {
    // Convex
    const convex = getConvexClient();
    const id = await convex.mutation(api.mcpServers.create, input as any);
    return id as string;
  }
}

/**
 * Update MCP server
 */
export async function updateMcpServer(
  id: string,
  updates: Partial<Omit<CreateMcpServerInput, 'userId'>>
): Promise<void> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    await prisma.mcpServer.update({
      where: { id },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.url && { url: updates.url }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.category && { category: updates.category }),
        ...(updates.authType && { authType: updates.authType }),
        ...(updates.accessToken !== undefined && { accessToken: updates.accessToken }),
        ...(updates.tools && { tools: updates.tools }),
        ...(updates.enabled !== undefined && { enabled: updates.enabled }),
        ...(updates.isOfficial !== undefined && { isOfficial: updates.isOfficial }),
        ...(updates.headers && { headers: updates.headers }),
        updatedAt: new Date(),
      },
    });
  } else {
    // Convex
    const convex = getConvexClient();
    await convex.mutation(api.mcpServers.update, { id: id as any, ...updates });
  }
}

/**
 * Update connection status
 */
export async function updateMcpConnectionStatus(
  id: string,
  status: string,
  error?: string,
  tools?: string[]
): Promise<void> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    await prisma.mcpServer.update({
      where: { id },
      data: {
        connectionStatus: status,
        lastTested: new Date(),
        lastError: error || null,
        ...(tools && { tools }),
        updatedAt: new Date(),
      },
    });
  } else {
    // Convex
    const convex = getConvexClient();
    await convex.mutation(api.mcpServers.updateConnectionStatus, {
      id: id as any,
      status,
      error,
      tools,
    });
  }
}

/**
 * Delete MCP server
 */
export async function deleteMcpServer(id: string): Promise<void> {
  const provider = getDatabaseProvider();
  
  if (provider === 'postgres') {
    await prisma.mcpServer.delete({
      where: { id },
    });
  } else {
    // Convex
    const convex = getConvexClient();
    await convex.mutation(api.mcpServers.deleteMCP, { id: id as any });
  }
}

