import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { PokemonFilters } from './PokemonFilters';
import { usePokedexTypes } from '@/hooks';
import { MouseEvent } from 'react';

interface IPokedexControlsProps {
  viewMode: 'pagination' | 'infinite';
  onViewModeChange: (mode: 'pagination' | 'infinite') => void;
}

export const PokedexControls = ({ viewMode, onViewModeChange }: IPokedexControlsProps) => {
  const { availableTypes } = usePokedexTypes();

  const handleViewModeChange = (
    _: MouseEvent<HTMLElement>,
    newMode: 'pagination' | 'infinite' | null,
  ) => {
    if (newMode !== null) {
      onViewModeChange(newMode);
    }
  };
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <PokemonFilters availableTypes={availableTypes} />
      <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewModeChange}>
        <ToggleButton value='pagination'>Pages</ToggleButton>
        <ToggleButton value='infinite'>Infinite Scroll</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
