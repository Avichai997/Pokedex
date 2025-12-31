import { useEffect, useState } from 'react';

import { Layout } from '@/components';
import {
  PokedexHeader,
  PokedexControls,
  PokemonGridView,
  PokedexLoadingState,
  PokedexErrorState,
  InfiniteScrollPokemonList,
} from '@/components';
import { usePokemonQuery, useCapturedPokemonQuery, usePokedexSearchParams } from '@/hooks';
import { usePokemonStore } from '@/store';
import { IPokemonFilters } from '@/types';

export const PokedexPage = () => {
  const [viewMode, setViewMode] = useState<'pagination' | 'infinite'>('pagination');
  const { page, pageSize, sort, typeFilter, searchQuery, updateSearchParams } =
    usePokedexSearchParams();

  const filters: IPokemonFilters = {
    type: typeFilter,
    search: searchQuery,
  };

  const { setCapturedPokemon } = usePokemonStore();
  const { data: capturedData } = useCapturedPokemonQuery();
  const { isLoading, error } = usePokemonQuery(filters, { page, page_size: pageSize }, sort);

  useEffect(() => {
    if (capturedData?.captured) {
      setCapturedPokemon(capturedData.captured);
    }
  }, [capturedData, setCapturedPokemon]);

  const handleViewModeChange = (mode: 'pagination' | 'infinite') => {
    setViewMode(mode);
    updateSearchParams({ page: 1 });
  };

  if (isLoading) {
    return <PokedexLoadingState />;
  }

  if (error) {
    return <PokedexErrorState />;
  }

  return (
    <Layout>
      <PokedexHeader />

      <PokedexControls viewMode={viewMode} onViewModeChange={handleViewModeChange} />

      {viewMode === 'pagination' ? (
        <PokemonGridView />
      ) : (
        <InfiniteScrollPokemonList />
      )}
    </Layout>
  );
};
