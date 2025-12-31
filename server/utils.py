"""
Utility functions for filtering, sorting, and searching Pokemon.
"""
from typing import List, Dict, Any, Optional


def filter_by_type(pokemon_list: List[Dict[str, Any]], type_filter: Optional[str]) -> List[Dict[str, Any]]:
    """
    Filter Pokemon by type (matches type_one OR type_two).
    
    Args:
        pokemon_list: List of Pokemon dictionaries
        type_filter: Type to filter by (case-insensitive)
        
    Returns:
        Filtered list of Pokemon
    """
    if not type_filter:
        return pokemon_list
    
    type_filter_lower = type_filter.lower()
    return [
        p for p in pokemon_list
        if (p.get('type_one', '').lower() == type_filter_lower or
            p.get('type_two', '').lower() == type_filter_lower)
    ]


def fuzzy_search(pokemon_list: List[Dict[str, Any]], search_query: Optional[str]) -> List[Dict[str, Any]]:
    """
    Fuzzy search across Pokemon properties (name, types, number, generation).
    
    Args:
        pokemon_list: List of Pokemon dictionaries
        search_query: Search query string
        
    Returns:
        List of matching Pokemon
    """
    if not search_query:
        return pokemon_list
    
    search_lower = search_query.lower()
    results = []
    
    for pokemon in pokemon_list:
        # Search in name
        if search_lower in pokemon.get('name', '').lower():
            results.append(pokemon)
            continue
        
        # Search in types
        if (search_lower in pokemon.get('type_one', '').lower() or
            search_lower in pokemon.get('type_two', '').lower()):
            results.append(pokemon)
            continue
        
        # Search in number (as string)
        if search_lower in str(pokemon.get('number', '')):
            results.append(pokemon)
            continue
        
        # Search in generation
        if search_lower in str(pokemon.get('generation', '')).lower():
            results.append(pokemon)
            continue
    
    return results


def sort_pokemon(pokemon_list: List[Dict[str, Any]], sort_direction: str = 'asc') -> List[Dict[str, Any]]:
    """
    Sort Pokemon by number attribute.
    
    Args:
        pokemon_list: List of Pokemon dictionaries
        sort_direction: 'asc' or 'desc'
        
    Returns:
        Sorted list of Pokemon
    """
    sorted_list = sorted(pokemon_list, key=lambda x: x.get('number', 0))
    if sort_direction.lower() == 'desc':
        sorted_list.reverse()
    return sorted_list
