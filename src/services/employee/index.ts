// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import {dynamicBaseQuery} from "../badRequestHandler"
// Define a service using a base URL and expected endpoints
export const employee = createApi({
  reducerPath: 'employee',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Employee'] as const,
  endpoints: (builder) => ({
    addEmployee: builder.mutation({
      query: (body) => ({
        url: `/employees`,
        method: "POST",
        body,
      }),
      invalidatesTags: ['Employee'],
    }),
    getEmployee: builder.query({
      query: (params) => ({
        url: `/employees`,
        method: "GET",
        params,
      }),
      providesTags: ['Employee'],
    }),
    getEmployeeDetail: builder.query({
      query: (id) => ({
        url: `/employees/${id}`,
        method: "GET",
      }),
      providesTags: ['Employee'],
    }),
    getEmployeeByCustomer: builder.query({
      query: (id) => ({
        url: `/employees/by-customer?userId=${id}`,
        method: "GET",
      }),
      providesTags: ['Employee'],
    }),
    updateEmployee: builder.mutation({
      query: ({ id, body }) => ({
        url: `/employees/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ['Employee'],
    }),
    updateEmployeeStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/employees/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ['Employee'],
    }),
    verifyEmployee: builder.mutation({
      query: (id) => ({
        url: `/employees/${id}/verify`,
        method: "PATCH",
      }),
      invalidatesTags: ['Employee'],
    }),
    unverifyEmployee: builder.mutation({
      query: (id) => ({
        url: `/employees/${id}/unverify`,
        method: "PATCH",
      }),
      invalidatesTags: ['Employee'],
    }),
  
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useAddEmployeeMutation,useGetEmployeeQuery,useGetEmployeeDetailQuery,useGetEmployeeByCustomerQuery,useUpdateEmployeeMutation, useUpdateEmployeeStatusMutation, useVerifyEmployeeMutation, useUnverifyEmployeeMutation } = employee