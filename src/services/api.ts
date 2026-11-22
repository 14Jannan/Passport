import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Reserved example host. Set the project API URL here when endpoints are added.
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.passport.example/' }),
  endpoints: () => ({}),
});
