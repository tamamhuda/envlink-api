export interface PaginatedMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedLinks {
  first: string | null;
  prev: string | null;
  next: string | null;
  last: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginatedMeta;
  links: PaginatedLinks;
}

export interface PaginatedOptions {
  page: number;
  limit: number;
  url: string;
}
