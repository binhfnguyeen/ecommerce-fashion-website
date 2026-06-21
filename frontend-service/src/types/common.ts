export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // 0-based page number
  last: boolean;
  first: boolean;
  empty: boolean;
}
