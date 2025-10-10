export interface ApiResponse<T> {
  success: boolean;
  status: number;
  path: string;
  data: T;
  timestamp: string;
}

export interface ErrorResponse {
  success: boolean;
  status: number;
  path: string;
  message?: string;
  error?: string | Record<string, any>;
  timestamp: string;
  [key: string]: any;
}
