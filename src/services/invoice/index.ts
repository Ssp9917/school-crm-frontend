import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

interface GetInvoicesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  invoiceType?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  branchId?: string;
  salesPerson?: string;
  trainer?: string;
}

interface GetPartialInvoicesParams {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
  startDate?: string;
  endDate?: string;
  sortOrder?: string;
  serviceType?: string;
}

export const invoiceApi = createApi({
  reducerPath: 'invoiceApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Invoice', 'UserDetail', 'Membership'] as const,
  endpoints: (builder) => ({
    getInvoices: builder.query<unknown, GetInvoicesParams>({
      query: ({ page = 1, limit = 10, search = '', status = '', invoiceType = '', startDate = '', endDate = '', userId = '', branchId = '', salesPerson = '', trainer = '' } = {}) => {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(limit));
        if (search) params.append('search', search);
        if (status && status !== 'all') params.append('status', status);
        if (invoiceType && invoiceType !== 'all') params.append('invoiceType', invoiceType);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (userId) params.append('userId', userId);
        if (branchId && branchId !== 'all') params.append('branchId', branchId);
        if (salesPerson && salesPerson !== 'all') params.append('salesPerson', salesPerson);
        if (trainer && trainer !== 'all') params.append('trainer', trainer);
        return {
          url: `/invoices?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Invoice'],
    }),
    getPartialInvoices: builder.query<unknown, GetPartialInvoicesParams>({
      query: ({ page = 1, limit = 10, search, branchId, startDate, endDate, sortOrder = 'desc', serviceType } = {}) => {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(limit));
        params.append('sortOrder', sortOrder);
        if (search) params.append('search', search);
        if (branchId) params.append('branchId', branchId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (serviceType) params.append('serviceType', serviceType);
        const queryString = params.toString();
        return {
          url: `/invoices/partial${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['Invoice'],
    }),
    getInvoiceById: builder.query({
      query: (id) => ({
        url: `/invoices/${id}`,
        method: 'GET',
      }),
    }),
    addInvoice: builder.mutation({
      query: (body) => ({
        url: '/invoices/add',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Invoice', 'Membership', 'UserDetail'],
    }),
    updateInvoice: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/invoices/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Invoice'],
    }),
    deleteInvoice: builder.mutation({
      query: (id) => ({
        url: `/invoices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Invoice'],
    }),
    updateSalesPerson: builder.mutation({
      query: ({ userId, salesPersonId }) => ({
        url: `/invoices/user/${userId}/update-salesperson`,
        method: 'PATCH',
        body: { salesPersonId },
      }),
      invalidatesTags: ['Invoice'],
    }),
    verifyInvoice: builder.mutation<void, string>({
      query: (id) => ({ url: `/invoices/${id}/verify`, method: 'PATCH' }),
      invalidatesTags: ['Invoice'],
    }),
    unverifyInvoice: builder.mutation<void, string>({
      query: (id) => ({ url: `/invoices/${id}/unverify`, method: 'PATCH' }),
      invalidatesTags: ['Invoice'],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetPartialInvoicesQuery,
  useGetInvoiceByIdQuery,
  useAddInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useUpdateSalesPersonMutation,
  useVerifyInvoiceMutation,
  useUnverifyInvoiceMutation,
} = invoiceApi;