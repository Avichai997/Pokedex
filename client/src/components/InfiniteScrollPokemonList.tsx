import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useEffect, useRef } from 'react';

import { PokemonCard } from './PokemonCard';
import { useInfinitePokemonQuery, usePokedexSearchParams } from '@/hooks';
import { IPokemonFilters } from '@/types';

export const InfiniteScrollPokemonList = () => {
  const { pageSize, sort, typeFilter, searchQuery } = usePokedexSearchParams();

  const filters: IPokemonFilters = {
    type: typeFilter,
    search: searchQuery,
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfinitePokemonQuery(
    filters,
    sort,
    pageSize,
  );

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPokemon = data?.pages.flatMap((page) => page.pokemon) ?? [];

  if (status === 'pending') {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'error') {
    return <Alert severity='error'>Failed to load Pokemon. Please try again later.</Alert>;
  }

  if (allPokemon.length === 0) {
    return <Alert severity='info'>No Pokemon found matching your criteria.</Alert>;
  }

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}
      >
        {allPokemon.map((pokemon) => (
          <Box key={pokemon.name}>
            <PokemonCard pokemon={pokemon} />
          </Box>
        ))}
      </Box>

      <Box
        ref={sentinelRef}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100px',
          mt: 2,
          gap: 2,
        }}
      >
        {isFetchingNextPage && (
          <>
            <CircularProgress size={40} />
            <Typography variant='body2' color='text.secondary'>
              Loading more Pokemon...
            </Typography>
          </>
        )}
        {!hasNextPage && allPokemon.length > 0 && !isFetchingNextPage && (
          <Typography variant='body2' color='text.secondary'>
            You've reached the end of the list!
          </Typography>
        )}
      </Box>
    </>
  );
};
