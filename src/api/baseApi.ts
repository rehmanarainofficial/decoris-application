import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENV } from '../constants/env';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: ENV.BASE_URL,
  }),
  tagTypes: ['Dashboard', 'User', 'Orders'],
  endpoints: () => ({}),
});
