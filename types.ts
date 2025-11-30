export interface UserCredentials {
  apiKey: string;
  appId: string;
  authDomain: string;
  databaseURL: string;
  measurementId?: string;
  messagingSenderId: string;
  projectId: string;
  storageBucket: string;
}

export interface User {
  uid: string;
  email: string;
  credentials?: UserCredentials;
}

export interface AuthResponse {
  ok: boolean;
  token: string;
  clientId: string;
  email: string;
  hasCredentials: boolean;
  erro?: string;
  code?: string;
}

export interface MetricData {
  method: string;
  endpoint: string;
  responseTimeMs: number;
  serverProcessingMs: number;
  requestSizeBytes: number;
  responseSizeBytes: number;
  statusCode: number;
  userAgent: string;
  ip: string;
  timestampMs: number;
  timestampISO: string;
  minuteBucket: string;
  hourBucket: string;
  dayBucket: string;
}

// Firebase returns an object of objects
export interface MetricsResponse {
  [key: string]: MetricData;
}

export interface Order {
  id: number;
  cliente: string;
  valor_total: number;
  status: string;
  itens?: Record<string, any>;
}

export interface OrdersResponse {
  [key: string]: Order;
}
