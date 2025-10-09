import { HttpException, UnauthorizedException } from '@nestjs/common';

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

// export function createErrorResponse<T extends HttpException>(
//   error: T,
// ): ErrorResponse {
//   const { status, path, message, error } = error;
//   return {
//     success: false,
//     status,
//     path,
//     message,
//     error,
//     timestamp: new Date().toISOString(),
//   };
// }
