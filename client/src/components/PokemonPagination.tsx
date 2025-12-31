import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  IconButton,
  SelectChangeEvent,
} from '@mui/material';
import { FirstPage, LastPage, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { usePokedexSearchParams } from '@/hooks';

interface IPokemonPaginationProps {
  totalPages: number;
  total: number;
}

export const PokemonPagination = ({ totalPages, total }: IPokemonPaginationProps) => {
  const { page, pageSize, updateSearchParams } = usePokedexSearchParams();

  const handleFirstPage = () => updateSearchParams({ page: 1 });
  const handlePrevPage = () => updateSearchParams({ page: Math.max(1, page - 1) });
  const handleNextPage = () => updateSearchParams({ page: Math.min(totalPages, page + 1) });
  const handleLastPage = () => updateSearchParams({ page: totalPages });

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 3,
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant='body2' color='text.secondary'>
          Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControl size='small' sx={{ minWidth: 120 }}>
          <InputLabel>Page Size</InputLabel>
          <Select
            value={String(pageSize)}
            label='Page Size'
            onChange={(e: SelectChangeEvent) =>
              updateSearchParams({ page_size: Number(e.target.value), page: 1 })
            }
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>
        </FormControl>

        <IconButton onClick={handleFirstPage} disabled={page === 1}>
          <FirstPage />
        </IconButton>
        <IconButton onClick={handlePrevPage} disabled={page === 1}>
          <ChevronLeft />
        </IconButton>

        <Typography variant='body2' sx={{ mx: 1 }}>
          Page {page} of {totalPages}
        </Typography>

        <IconButton onClick={handleNextPage} disabled={page >= totalPages}>
          <ChevronRight />
        </IconButton>
        <IconButton onClick={handleLastPage} disabled={page >= totalPages}>
          <LastPage />
        </IconButton>
      </Box>
    </Box>
  );
};
