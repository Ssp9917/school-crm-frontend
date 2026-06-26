import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export interface ClassRecord {
  _id?: string;
  name: string;
  classTeacher?: string; // Teacher ID
  status?: 'active' | 'inactive';
}

export const classApi = createApi({
  reducerPath: 'classApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Class'] as const,
  endpoints: (builder) => ({
    getClasses: builder.query<any, any>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', String(params.page));
        if (params.limit) queryParams.append('limit', String(params.limit));
        if (params.search) queryParams.append('search', params.search);
        if (params.status && params.status !== 'all') queryParams.append('status', params.status);
        const qStr = queryParams.toString();
        return { url: `/classes${qStr ? `?${qStr}` : ''}`, method: 'GET' };
      },
      providesTags: ['Class'],
    }),
    getClassDetail: builder.query<any, string>({
      query: (id) => ({ url: `/classes/${id}`, method: 'GET' }),
      providesTags: ['Class'],
    }),
    addClass: builder.mutation<any, Partial<ClassRecord>>({
      query: (body) => ({ url: '/classes', method: 'POST', body }),
      invalidatesTags: ['Class'],
    }),
    updateClass: builder.mutation<any, { id: string; body: Partial<ClassRecord> }>({
      query: ({ id, body }) => ({ url: `/classes/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Class'],
    }),
    deleteClass: builder.mutation<any, string>({
      query: (id) => ({ url: `/classes/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Class'],
    }),
  }),
});

export const {
  useGetClassesQuery,
  useGetClassDetailQuery,
  useAddClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
} = classApi;
