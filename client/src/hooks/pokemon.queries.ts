import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import { getPokemon, getCapturedPokemon, toggleCapture, getPokemonTypes } from '@/api';
import { IPokemonFilters, SortDirection, ICaptureToggleRequest } from '@/types';

export const usePokemonQuery = (
  filters: IPokemonFilters,
  pagination: { page: number; page_size: number },
  sort: SortDirection = 'asc',
) => {
  return useQuery({
    queryKey: ['pokemon', filters, pagination, sort],
    queryFn: () =>
      getPokemon({
        ...filters,
        ...pagination,
        sort,
      }),
    staleTime: 5 * 60 * 1000,
  });
};

export const useInfinitePokemonQuery = (
  filters: IPokemonFilters,
  sort: SortDirection,
  pageSize: number,
) => {
  return useInfiniteQuery({
    queryKey: ['pokemon', 'infinite', filters, sort, pageSize],
    queryFn: ({ pageParam = 1 }) =>
      getPokemon({
        ...filters,
        page: pageParam as number,
        page_size: pageSize,
        sort,
      }),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage <= lastPage.total_pages ? nextPage : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCapturedPokemonQuery = () => {
  return useQuery({
    queryKey: ['pokemon', 'captured'],
    queryFn: getCapturedPokemon,
    staleTime: 2 * 60 * 1000,
  });
};

export const usePokemonTypesQuery = () => {
  return useQuery({
    queryKey: ['pokemon', 'types'],
    queryFn: getPokemonTypes,
    staleTime: 5 * 60 * 1000,
  });
};

export const useToggleCaptureMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICaptureToggleRequest) => toggleCapture(data),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<{ captured: string[] }>(['pokemon', 'captured'], (old) => {
        if (!old) return { captured: [] };

        const capturedSet = new Set(old.captured);
        if (variables.captured) {
          capturedSet.add(variables.name);
        } else {
          capturedSet.delete(variables.name);
        }
        return { captured: Array.from(capturedSet) };
      });
    },
  });
};
