// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import {dynamicBaseQuery} from "../badRequestHandler"
// Define a service using a base URL and expected endpoints
export const branches = createApi({
  reducerPath: 'branches',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Branches'] as const,
  endpoints: (builder) => ({
    getBranches: builder.query<any, void>({
      query: () => ({
        url: `/branches`,
        method: "GET",
      }),
      providesTags: ['Branches'],
    }),
    getBranchesById: builder.query({
      query: (id) => ({
        url: `/branches/${id}`,
        method: "GET",
      }),
      providesTags: ['Branches'],
    }),
    addBranch: builder.mutation({
      query: (body) => ({
        url: `/branches`,
        method: "POST",
        body,
      }),
      invalidatesTags: ['Branches'],
    }),
    updateBranch: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/branches/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ['Branches'],
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetBranchesQuery, useGetBranchesByIdQuery, useAddBranchMutation, useUpdateBranchMutation } = branches