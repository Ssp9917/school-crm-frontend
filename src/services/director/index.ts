// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import { dynamicBaseQuery } from "../badRequestHandler"

// Define a service using a base URL and expected endpoints
export const director = createApi({
  reducerPath: 'director',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Directors'] as const,
  endpoints: (builder) => ({
    getDirectors: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/directors?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ['Directors'],
    }),
    addDirector: builder.mutation({
      query: (payload) => ({
        url: `/directors`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ['Directors'],
    }),
    updateDirector: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/directors/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ['Directors'],
    }),
    deleteDirector: builder.mutation({
      query: (id) => ({
        url: `/directors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Directors'],
    }),
    updateDirectorStatus: builder.mutation({
      query: (id) => ({
        url: `/directors/toggle-status/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ['Directors'],
    }),
    getDirectorDetail: builder.query({
      query: (id) => ({
        url: `/directors/${id}`,
        method: "GET",
      }),
      providesTags: ['Directors'],
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { 
  useGetDirectorsQuery, 
  useAddDirectorMutation, 
  useUpdateDirectorMutation, 
  useDeleteDirectorMutation,
  useUpdateDirectorStatusMutation,
  useGetDirectorDetailQuery,
} = director
