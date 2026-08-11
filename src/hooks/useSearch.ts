import { useState, useCallback } from 'react';

export function useSearch(initialQuery = '') {
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    searchQuery,
    handleSearch,
  };
}
