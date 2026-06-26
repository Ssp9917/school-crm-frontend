import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export const feedbacks = createApi({
  reducerPath: 'feedbacks',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Feedbacks', 'Employees'] as const,
  endpoints: (builder) => ({
    getAllFeedbacks: builder.query({
      query: (params) => ({
        url: `/feedbacks?status=${params.status || ''}&departmentId=${params.departmentId || ''}`,
        method: 'GET',
        params,
      }),
      providesTags: ['Feedbacks'],
    }),
    getEmployeesByBranch: builder.query({
      query: (branchId) => ({
        url: `/feedbacks/employees/list?branchId=${branchId}`,
        method: 'GET',
      }),
      providesTags: ['Employees'],
    }),
    assignTo: builder.mutation({
      query: ({ assignTo, feedbackId }) => ({
        url: `/feedbacks/assign/${feedbackId}`,
        method: 'PUT',
        body: { assignTo },
      }),
      invalidatesTags: ['Employees', 'Feedbacks'],
    }),

    updateFeedbackStatus: builder.mutation({
      query: ({ feedbackId, status }) => ({
        url: `/feedbacks/${feedbackId}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Feedbacks'],
    }),

    getFeedbacksByPhone: builder.query({
      query: (mobileNumber) => ({
        url: `/feedbacks/by-phone?mobileNumber=${mobileNumber}`,
        method: 'GET',
      }),
      providesTags: ['Feedbacks'],
    }),
})
});

export const { useGetAllFeedbacksQuery,useGetFeedbacksByPhoneQuery, useGetEmployeesByBranchQuery,useAssignToMutation,useUpdateFeedbackStatusMutation } = feedbacks;