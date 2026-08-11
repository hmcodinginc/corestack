import { ArchiveEntity, Pagination, Sort, Filters, PageResponse } from '@/types';

export class StorageService<T extends ArchiveEntity> {
  protected collectionKey: string;

  constructor(collectionKey: string) {
    this.collectionKey = collectionKey;
    if (!localStorage.getItem(collectionKey)) {
      localStorage.setItem(collectionKey, JSON.stringify([]));
    }
  }

  protected delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected readData(): T[] {
    const data = localStorage.getItem(this.collectionKey);
    return data ? JSON.parse(data) : [];
  }

  protected writeData(data: T[]): void {
    localStorage.setItem(this.collectionKey, JSON.stringify(data));
  }

  public async getAll(includeArchived: boolean = false): Promise<T[]> {
    await this.delay();
    const data = this.readData();
    return includeArchived ? data : data.filter(item => !item.isArchived);
  }

  public async getById(id: string): Promise<T | null> {
    await this.delay();
    const item = this.readData().find(i => i.id === id);
    return item || null;
  }

  public async create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'archivedAt'>): Promise<T> {
    await this.delay();
    const all = this.readData();
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      archivedAt: null,
    } as unknown as T;
    
    all.push(newItem);
    this.writeData(all);
    return newItem;
  }

  public async update(id: string, updates: Partial<T>): Promise<T> {
    await this.delay();
    const all = this.readData();
    const index = all.findIndex(i => i.id === id);
    
    if (index === -1) throw new Error(`Item with id ${id} not found.`);
    
    const updatedItem = {
      ...all[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    all[index] = updatedItem;
    this.writeData(all);
    return updatedItem;
  }

  public async archive(id: string): Promise<T> {
    return this.update(id, { isArchived: true, archivedAt: new Date().toISOString() } as Partial<T>);
  }

  public async restore(id: string): Promise<T> {
    return this.update(id, { isArchived: false, archivedAt: null } as Partial<T>);
  }

  public async search(query: string, fields: (keyof T)[]): Promise<T[]> {
    await this.delay();
    const all = await this.getAll(); // Only searches non-archived by default
    if (!query) return all;
    
    const lowerQuery = query.toLowerCase();
    return all.filter(item => 
      fields.some(field => String(item[field]).toLowerCase().includes(lowerQuery))
    );
  }

  public async filter(filters: Filters): Promise<T[]> {
    await this.delay();
    let all = await this.getAll();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        all = all.filter(item => item[key as keyof T] === value);
      }
    });
    
    return all;
  }

  public async paginate(items: T[], page: number, limit: number, sort?: Sort): Promise<PageResponse<T>> {
    await this.delay(100); // minor delay for sorting/paginating
    
    let result = [...items];
    
    if (sort) {
      result.sort((a, b) => {
        const aVal = a[sort.field as keyof T];
        const bVal = b[sort.field as keyof T];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sort.order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        
        if (aVal < bVal) return sort.order === 'asc' ? -1 : 1;
        if (aVal > bVal) return sort.order === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedData = result.slice(start, start + limit);
    
    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }
}
