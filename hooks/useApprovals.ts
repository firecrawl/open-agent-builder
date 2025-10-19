/**
 * useApprovals Hook
 * 
 * React hook for fetching approvals.
 * Replaces Convex useQuery hook with SWR.
 */

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function usePendingApprovals() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/approval/pending',
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds for pending approvals
      revalidateOnFocus: true,
    }
  );

  return {
    approvals: data?.approvals || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useApproval(approvalId: string | undefined | null) {
  const { data, error, isLoading, mutate } = useSWR(
    approvalId ? `/api/approval/${approvalId}` : null,
    fetcher,
    {
      refreshInterval: 2000, // Poll every 2 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    approval: data?.record,
    isLoading,
    error,
    refresh: mutate,
  };
}

