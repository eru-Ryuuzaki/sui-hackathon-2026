import { useQuery } from '@tanstack/react-query';
import { EngramApi } from '../services/api';

export const useConstruct = (id?: string) => {
  return useQuery({
    queryKey: ['construct', id],
    queryFn: () => EngramApi.getConstruct(id!),
    enabled: !!id,
    retry: 1,
  });
};

export const useConstructByOwner = (address?: string) => {
  return useQuery({
    queryKey: ['construct', 'owner', address],
    queryFn: () => EngramApi.getConstructByOwner(address!),
    enabled: !!address,
    retry: 1,
  });
};

export const useMemories = (constructId?: string) => {
  return useQuery({
    queryKey: ['memories', constructId],
    queryFn: () => EngramApi.getMemoriesByConstruct(constructId!),
    enabled: !!constructId,
  });
};

export const useSearchMemories = (query: string) => {
  return useQuery({
    queryKey: ['memories', 'search', query],
    queryFn: () => EngramApi.searchMemories(query),
    enabled: query.length > 2, // Only search if query is long enough
  });
};
