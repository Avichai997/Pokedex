import { useSearchParams } from 'react-router-dom';
import { SortDirection } from '@/types';

export const usePokedexSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('page_size') || '10', 10);
  const sort = (searchParams.get('sort') || 'asc') as SortDirection;
  const typeFilter = searchParams.get('type') || undefined;
  const searchQuery = searchParams.get('search') || undefined;

  const updateSearchParams = (updates: Record<string, string | number | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });
    if (updates.type !== undefined || updates.search !== undefined || updates.sort !== undefined) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  return {
    page,
    pageSize,
    sort,
    typeFilter,
    searchQuery,
    updateSearchParams,
  };
};
