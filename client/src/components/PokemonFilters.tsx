import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  SelectChangeEvent,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { SortDirection } from '@/types';
import { useEffect, useState } from 'react';
import { usePokedexSearchParams } from '@/hooks';

interface IPokemonFiltersProps {
  availableTypes: string[];
}

export const PokemonFilters = ({ availableTypes }: IPokemonFiltersProps) => {
  const { sort, typeFilter, searchQuery, updateSearchParams } = usePokedexSearchParams();
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      updateSearchParams({ search: localSearch || undefined });
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, updateSearchParams]);

  useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

  const handleClearSearch = () => {
    setLocalSearch('');
    updateSearchParams({ search: undefined });
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
      <FormControl size='small' sx={{ minWidth: 150 }}>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sort}
          label='Sort By'
          onChange={(e: SelectChangeEvent) =>
            updateSearchParams({ sort: e.target.value as SortDirection })
          }
        >
          <MenuItem value='asc'>Number: Ascending</MenuItem>
          <MenuItem value='desc'>Number: Descending</MenuItem>
        </Select>
      </FormControl>

      <FormControl size='small' sx={{ minWidth: 150 }}>
        <InputLabel>Filter by Type</InputLabel>
        <Select
          value={typeFilter || ''}
          label='Filter by Type'
          onChange={(e: SelectChangeEvent) =>
            updateSearchParams({ type: e.target.value || undefined })
          }
        >
          <MenuItem value=''>All Types</MenuItem>
          {availableTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        size='small'
        placeholder='Search Pokemon...'
        value={localSearch}
        autoFocus
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <Search />
            </InputAdornment>
          ),
          endAdornment: localSearch ? (
            <InputAdornment position='end'>
              <IconButton size='small' onClick={handleClearSearch} edge='end'>
                <Clear fontSize='small' />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        sx={{ flexGrow: 1, minWidth: 200 }}
      />
    </Box>
  );
};
