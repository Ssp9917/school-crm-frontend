import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export interface ParentRecord {
  _id?: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  roleId?: string;
  branchIds?: string[];
  students?: string[];
  occupation?: string;
  relation?: 'Father' | 'Mother' | 'Guardian' | 'Other';
  status?: string;
}

export const parentApi = createApi({
  reducerPath: 'parentApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Parent'] as const,
  endpoints: (builder) => ({
    getParents: builder.query<any, any>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', String(params.page));
        if (params.limit) queryParams.append('limit', String(params.limit));
        if (params.search) queryParams.append('search', params.search);
        if (params.status && params.status !== 'all') queryParams.append('status', params.status);
        const qStr = queryParams.toString();
        return { url: `/parents${qStr ? `?${qStr}` : ''}`, method: 'GET' };
      },
      providesTags: ['Parent'],
    }),
    getParentDetail: builder.query<any, string>({
      query: (id) => ({ url: `/parents/${id}`, method: 'GET' }),
      providesTags: ['Parent'],
    }),
    addParent: builder.mutation<any, Partial<ParentRecord>>({
      query: (body) => ({ url: '/parents', method: 'POST', body }),
      invalidatesTags: ['Parent'],
    }),
    updateParent: builder.mutation<any, { id: string; body: Partial<ParentRecord> }>({
      query: ({ id, body }) => ({ url: `/parents/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Parent'],
    }),
    deleteParent: builder.mutation<any, string>({
      query: (id) => ({ url: `/parents/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Parent'],
    }),
  }),
});

export const {
  useGetParentsQuery,
  useGetParentDetailQuery,
  useAddParentMutation,
  useUpdateParentMutation,
  useDeleteParentMutation,
} = parentApi;
