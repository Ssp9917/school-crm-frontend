import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';


export const uplineApi = createApi({
  reducerPath: 'uplineApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Upline'],
  endpoints: (builder) => ({
    getPossibleParents: builder.query({
      query: (params) => ({
        url: '/upline/possible-parents',
        method: 'GET',
        params,
      }),
      providesTags: ['Upline'],
    }),
    getUplineRevenue: builder.query({
      query: (params) => ({
        url: '/upline/revenue',
        method: 'GET',
        params,
      }),
      providesTags: ['Upline'],
    }),

    getSalesToday: builder.query({
      query: (params) => ({
        url: '/sales/today',
        method: 'GET',
        params,
      }),
      providesTags: ['Upline'],
    }),
    getSalesMonthly: builder.query({
      query: (params) => ({
        url: '/sales/monthly',
        method: 'GET',
        params,
      }),
      providesTags: ['Upline'],
    }),
 
  }),
});

export const {
  useGetPossibleParentsQuery,
  useGetUplineRevenueQuery,

  useGetSalesTodayQuery,
  useGetSalesMonthlyQuery,

} = uplineApi;