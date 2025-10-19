/**
 * useExecutions Hook
 * 
 * React hook for fetching workflow executions.
 * Replaces Convex useQuery hook with SWR.
 */

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useExecutions(workflowId: string | undefined | null, limit: number = 50) {
  const { data, error, isLoading, mutate } = useSWR(
    workflowId ? `/api/workflows/${workflowId}/executions?limit=${limit}` : null,
    fetcher,
    {
      refreshInterval: 3000, // Poll every 3 seconds for execution updates
      revalidateOnFocus: true,
    }
  );

  return {
    executions: data?.executions || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useExecution(executionId: string | undefined | null) {
  const { data, error, isLoading, mutate } = useSWR(
    executionId ? `/api/executions/${executionId}` : null,
    fetcher,
    {
      refreshInterval: 2000, // Poll every 2 seconds for active executions
      revalidateOnFocus: true,
    }
  );

  return {
    execution: data?.execution,
    isLoading,
    error,
    refresh: mutate,
  };
}

