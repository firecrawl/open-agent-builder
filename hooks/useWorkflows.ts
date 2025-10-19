/**
 * useWorkflows Hook
 * 
 * React hook for fetching workflows list.
 * Replaces Convex useQuery hook with SWR.
 */

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useWorkflows() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/workflows',
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds (replaces Convex real-time)
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    workflows: data?.workflows || [],
    total: data?.total || 0,
    source: data?.source,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useWorkflow(id: string | undefined | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/workflows/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
    }
  );

  return {
    workflow: data?.workflow,
    isLoading,
    error,
    refresh: mutate,
  };
}

