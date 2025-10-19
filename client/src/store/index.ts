import { configureStore } from '@reduxjs/toolkit';
import { aquariumApi } from './api';

export const store = configureStore({
  reducer: {
    // Add the RTK Query API reducer
    [aquariumApi.reducerPath]: aquariumApi.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling, and other features of RTK Query
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(aquariumApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;