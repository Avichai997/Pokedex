import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
} from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { useState } from 'react';

import { IPokemon } from '@/types';
import { getPokemonIconUrl } from '@/api';
import { usePokemonStore } from '@/store';
import { useToggleCaptureMutation } from '@/hooks';

interface IPokemonCardProps {
  pokemon: IPokemon;
}

export const PokemonCard = ({ pokemon }: IPokemonCardProps) => {
  const { isCaptured } = usePokemonStore();
  const toggleCaptureMutation = useToggleCaptureMutation();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const captured = isCaptured(pokemon.name);

  const handleCaptureToggle = () => {
    toggleCaptureMutation.mutate({
      name: pokemon.name,
      captured: !captured,
    });
  };

  const getTypeColor = (type: string): string => {
    const typeColors: Record<string, string> = {
      Normal: '#A8A878',
      Fire: '#F08030',
      Water: '#6890F0',
      Electric: '#F8D030',
      Grass: '#78C850',
      Ice: '#98D8D8',
      Fighting: '#C03028',
      Poison: '#A040A0',
      Ground: '#E0C068',
      Flying: '#A890F0',
      Psychic: '#F85888',
      Bug: '#A8B820',
      Rock: '#B8A038',
      Ghost: '#705898',
      Dragon: '#7038F8',
      Dark: '#705848',
      Steel: '#B8B8D0',
      Fairy: '#EE99AC',
    };
    return typeColors[type] || '#68A090';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: captured ? '2px solid' : 'none',
        borderColor: captured ? 'primary.main' : 'transparent',
      }}
    >
      <Tooltip title={captured ? 'Release Pokemon' : 'Capture Pokemon'}>
        <IconButton
          onClick={handleCaptureToggle}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: 'background.paper',
            '&:hover': {
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'action.hover',
            },
          }}
          disabled={toggleCaptureMutation.isPending}
        >
          {captured ? <Star color='primary' /> : <StarBorder color='action' />}
        </IconButton>
      </Tooltip>

      <Box sx={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
        {imageLoading && (
          <Skeleton
            variant='rectangular'
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />
        )}
        <CardMedia
          component='img'
          image={getPokemonIconUrl(pokemon.name)}
          alt={pokemon.name}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: 2,
            display: imageError ? 'none' : 'block',
          }}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
        {imageError && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'action.hover',
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              No Image
            </Typography>
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant='h6' component='div' sx={{ fontWeight: 'bold' }}>
            {pokemon.name}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            #{String(pokemon.number).padStart(3, '0')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={pokemon.type_one}
            size='small'
            sx={{
              backgroundColor: getTypeColor(pokemon.type_one),
              color: 'white',
              fontWeight: 'bold',
            }}
          />
          {pokemon.type_two && (
            <Chip
              label={pokemon.type_two}
              size='small'
              sx={{
                backgroundColor: getTypeColor(pokemon.type_two),
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant='caption' color='text.secondary'>
            Total: <strong>{pokemon.total}</strong>
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant='caption' color='text.secondary'>
              HP: {pokemon.hit_points}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              ATK: {pokemon.attack}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              DEF: {pokemon.defense}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              SPD: {pokemon.speed}
            </Typography>
          </Box>
          {pokemon.legendary && (
            <Chip
              label='Legendary'
              size='small'
              color='warning'
              sx={{ mt: 0.5, alignSelf: 'flex-start' }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
