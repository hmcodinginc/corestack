import { useState, useMemo } from 'react';
import { Sort } from '@/types';

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export function usePagination(initialPageSize = 10) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);

  // Adapter for the service layer
  const sortAdapter = useMemo<Sort | undefined>(() => {
    if (sorting.length === 0) return undefined;
    return {
      field: sorting[0].id,
      order: sorting[0].desc ? 'desc' : 'asc'
    };
  }, [sorting]);

  return {
    pagination,
    setPagination,
    sorting,
    setSorting,
    sortAdapter,
    page: pagination.pageIndex + 1, // 1-indexed for backend
    limit: pagination.pageSize,
  };
}
