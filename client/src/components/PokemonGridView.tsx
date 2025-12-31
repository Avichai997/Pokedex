import { Box, Alert } from '@mui/material';
import { PokemonCard } from './PokemonCard';
import { PokemonPagination } from './PokemonPagination';
import { IPokemon, IPokemonFilters } from '@/types';
import { usePokedexSearchParams, usePokemonQuery } from '@/hooks';

export const PokemonGridView = () => {
  const { page, pageSize, sort, typeFilter, searchQuery } =
    usePokedexSearchParams();

  const filters: IPokemonFilters = {
    type: typeFilter,
    search: searchQuery,
  };

  const { data } = usePokemonQuery(filters, { page, page_size: pageSize }, sort);

  if (!data || data.pokemon.length === 0) {
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
        {data.pokemon.map((pokemon: IPokemon) => (
          <Box key={pokemon.name}>
            <PokemonCard pokemon={pokemon} />
          </Box>
        ))}
      </Box>

      <PokemonPagination totalPages={data.total_pages} total={data.total} />
    </>
  );
};
