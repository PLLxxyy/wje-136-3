export type AppErrorCode =
  | 'MOCK_DATA_LOAD_FAILED'
  | 'INDEXEDDB_FAILED'
  | 'CHART_RENDER_FAILED'
  | 'ROUTE_RENDER_FAILED';

export interface AppError {
  code: AppErrorCode;
  message: string;
  cause?: unknown;
}
