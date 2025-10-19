import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the base URL for your API
const API_BASE_URL = 'http://localhost:3001/api';

// Define types for your API requests and responses
export interface AnalyzeRequest {
  tankDescription: string;
}

export interface AnalysisBreakdown {
  equipment?: string;
  waterParams?: string;
  livestock?: string;
  recommendations?: string;
}

export interface AnalyzeResponse {
  score: number;
  breakdown: AnalysisBreakdown;
  summary: string;
  result: string; // Keep for backward compatibility
}

export interface ApiError {
  error: string;
}

// Create the API slice
export const aquariumApi = createApi({
  reducerPath: 'aquariumApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Analysis'],
  endpoints: (builder) => ({
    // Analyze tank endpoint
    analyzeTank: builder.mutation<AnalyzeResponse, AnalyzeRequest>({
      query: (body) => ({
        url: '/analyze',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Analysis'],
    }),
    
    // Health check endpoint (example of a query)
    getHealthStatus: builder.query<{ status: string; uptime: number; timestamp: string }, void>({
      query: () => '/health',
    }),
  }),
});

// Export hooks for use in components
export const {
  useAnalyzeTankMutation,
  useGetHealthStatusQuery,
} = aquariumApi;