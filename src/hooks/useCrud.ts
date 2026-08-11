import { useState, useCallback, useEffect } from 'react';
import { StorageService } from '@/services/StorageService';
import { ArchiveEntity, Pagination, Sort, Filters } from '@/types';
import toast from 'react-hot-toast';

export function useCrud<T extends ArchiveEntity>(
  service: StorageService<T>, 
  options: { includeArchived?: boolean } = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const result = await service.getAll(options.includeArchived);
      setData(result);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const create = async (item: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'archivedAt'>) => {
    try {
      setLoading(true);
      await service.create(item);
      await fetchAll();
      toast.success('Created successfully');
    } catch (err) {
      toast.error('Failed to create');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      setLoading(true);
      await service.update(id, updates);
      await fetchAll();
      toast.success('Updated successfully');
    } catch (err) {
      toast.error('Failed to update');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const archive = async (id: string) => {
    try {
      setLoading(true);
      await service.archive(id);
      await fetchAll();
      toast.success('Archived successfully');
    } catch (err) {
      toast.error('Failed to archive');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    create,
    update,
    archive,
    refresh: fetchAll,
  };
}
