import { usePokemonTypesQuery } from './pokemon.queries';

export const usePokedexTypes = () => {
  const { data, isLoading } = usePokemonTypesQuery();

  return {
    availableTypes: data?.types ?? [],
    isLoading,
  };
};
