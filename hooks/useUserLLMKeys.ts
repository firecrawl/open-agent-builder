/**
 * useUserLLMKeys Hook
 * 
 * React hook for fetching user LLM API keys.
 * Replaces Convex useQuery hook with SWR.
 */

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useUserLLMKeys() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/llm-keys',
    fetcher,
    {
      revalidateOnFocus: true,
    }
  );

  return {
    keys: data?.keys || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

