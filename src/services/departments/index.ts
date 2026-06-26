import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export const departments = createApi({
  reducerPath: 'departments',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Departments'],
  endpoints: (builder) => ({
    getDepartments: builder.query({
      query: (status = 'active') => ({
        url: `/feedbacks/departments/list?status=${status}`,
        method: 'GET',
      }),
      providesTags: ['Departments'],
    }),
    addDepartment: builder.mutation({
      query: (body) => ({
        url: '/feedbacks/departments/add',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Departments'],
    }),
    toggleDepartmentStatus: builder.mutation({
      query: ({ id }) => ({
        url: `/feedbacks/departments/toggle-status/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Departments'],
    }),
  }),
});

export const { useGetDepartmentsQuery, useAddDepartmentMutation, useToggleDepartmentStatusMutation } = departments;
