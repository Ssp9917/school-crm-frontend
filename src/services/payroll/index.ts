import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export const payrollApi = createApi({
  reducerPath: 'payrollApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Payroll'],
  endpoints: (builder) => ({
    getPayroll: builder.query<any, { page?: number; limit?: number; month?: string; paymentStatus?: string; search?: string }>({
      query: ({ page = 1, limit = 10, month, paymentStatus, search } = {}) => {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(limit));
        if (month) params.append('month', month);
        if (paymentStatus) params.append('paymentStatus', paymentStatus);
        if (search) params.append('search', search);
        return { url: `/payroll?${params.toString()}`, method: 'GET' };
      },
      providesTags: ['Payroll'],
    }),
    getPayrollById: builder.query<any, string>({
      query: (id) => ({ url: `/payroll/${id}`, method: 'GET' }),
      providesTags: ['Payroll'],
    }),
    generatePayroll: builder.mutation<any, { month: string }>({
      query: (body) => ({
        url: '/payroll/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payroll'],
    }),
    updatePayrollStatus: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/payroll/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Payroll'],
    }),
  }),
});

export const {
  useGetPayrollQuery,
  useGetPayrollByIdQuery,
  useGeneratePayrollMutation,
  useUpdatePayrollStatusMutation,
} = payrollApi;
