export interface IPokemon {
  number: number;
  name: string;
  type_one: string;
  type_two: string | null;
  total: number;
  hit_points: number;
  attack: number;
  defense: number;
  special_attack: number;
  special_defense: number;
  speed: number;
  generation: number;
  legendary: boolean;
}

export interface IPokemonListResponse {
  pokemon: IPokemon[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface IPokemonFilters {
  type?: string;
  search?: string;
}

export interface IPokemonPagination {
  page: number;
  page_size: number;
}

export type SortDirection = 'asc' | 'desc';

export interface IPokemonQueryParams extends IPokemonFilters, IPokemonPagination {
  sort?: SortDirection;
}

export interface ICapturedPokemonResponse {
  captured: string[];
}

export interface ICaptureToggleRequest {
  name: string;
  captured: boolean;
}

export interface ICaptureToggleResponse {
  success: boolean;
}

export interface IPokemonTypesResponse {
  types: string[];
}
