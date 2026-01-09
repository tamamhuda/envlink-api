import {
  PaginatedOptions,
  PaginatedResult,
} from '../interfaces/paginated.interface';

export function paginatedResult<T>(
  rows: T[],
  totalItems: number,
  options: PaginatedOptions,
): PaginatedResult<T> {
  const { page = 1, limit = 10 } = options;

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    data: rows,
    meta: {
      totalItems,
      itemCount: rows.length,
      itemsPerPage: Number(limit),
      totalPages,
      currentPage: Math.min(page, totalPages),
    },
    links: {
      first: `${options.url}?limit=${limit}&page=1`,
      last: `${options.url}?limit=${limit}&page=${totalPages}`,
      next:
        page < totalPages
          ? `${options.url}?limit=${limit}&page=${page + 1}`
          : null,
      prev: page > 1 ? `${options.url}?limit=${limit}&page=${page - 1}` : null,
    },
  };
}
