import api from './axios';
import {
  IPokemonListResponse,
  IPokemonQueryParams,
  ICapturedPokemonResponse,
  ICaptureToggleRequest,
  ICaptureToggleResponse,
  IPokemonTypesResponse,
} from '@/types';

export const getPokemon = async (params: IPokemonQueryParams): Promise<IPokemonListResponse> => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.page_size) queryParams.append('page_size', params.page_size.toString());
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.type) queryParams.append('type', params.type);
  if (params.search) queryParams.append('search', params.search);

  const response = await api.get<IPokemonListResponse>(`/pokemon?${queryParams.toString()}`);
  return response.data;
};

export const getCapturedPokemon = async (): Promise<ICapturedPokemonResponse> => {
  const response = await api.get<ICapturedPokemonResponse>('/pokemon/captured');
  return response.data;
};

export const toggleCapture = async (
  data: ICaptureToggleRequest,
): Promise<ICaptureToggleResponse> => {
  const response = await api.post<ICaptureToggleResponse>('/pokemon/capture', data);
  return response.data;
};

export const getPokemonTypes = async (): Promise<IPokemonTypesResponse> => {
  const response = await api.get<IPokemonTypesResponse>('/pokemon/types');
  return response.data;
};

export const getPokemonIconUrl = (name: string): string => {
  return `https://img.pokemondb.net/sprites/silver/normal/${name.toLowerCase()}.png`;
};
