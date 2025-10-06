export interface ApiResponse<T> {
  success: boolean;
  status: number;
  path: string;
  data: T;
  timestamp: string;
}
