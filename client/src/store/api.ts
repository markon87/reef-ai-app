import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../lib/supabase';

// Define the base URL for your API - using Supabase Edge Functions
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const API_BASE_URL = `${SUPABASE_URL}/functions/v1`;

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
  generalAssessment: string; // New field for general assessment (max 400 words)
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
    prepareHeaders: async (headers) => {
      headers.set('Content-Type', 'application/json');
      
      // Add Supabase authentication headers
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (supabaseAnonKey) {
        headers.set('apikey', supabaseAnonKey);
      }
      
      // Add user JWT token if authenticated, otherwise use anon key
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`);
      } else {
        // Fallback to anon key for unauthenticated requests
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (supabaseAnonKey) {
          headers.set('Authorization', `Bearer ${supabaseAnonKey}`);
        }
      }
      
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