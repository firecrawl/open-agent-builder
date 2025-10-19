/**
 * useMcpServers Hook
 * 
 * React hook for fetching MCP servers.
 * Replaces Convex useQuery hook with SWR.
 */

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useMcpServers() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/mcp/registry',
    fetcher,
    {
      refreshInterval: 10000, // Poll every 10 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    servers: data?.servers || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useEnabledMcpServers() {
  const { servers, isLoading, error, refresh } = useMcpServers();

  return {
    servers: servers.filter((s: any) => s.enabled),
    isLoading,
    error,
    refresh,
  };
}

