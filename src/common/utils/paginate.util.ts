import {
  PaginatedOptions,
  PaginatedResult,
} from '../interfaces/paginated.interface';

export function paginatedResult<T>(
  rows: T[],
  totalItems: number,
  options: PaginatedOptions,
): PaginatedResult<T> {
  const limit = options.limit > 0 ? options.limit : 10;
  const page = options.page > 0 ? options.page : 1;

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    data: rows,
    meta: {
      totalItems,
      itemCount: rows.length,
      itemsPerPage: limit,
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
