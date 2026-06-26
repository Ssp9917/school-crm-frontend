import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export interface SectionRecord {
  _id?: string;
  name: string;
  classId: string;
  classTeacher?: string;
  status?: 'active' | 'inactive';
}

export const sectionApi = createApi({
  reducerPath: 'sectionApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Section'] as const,
  endpoints: (builder) => ({
    getSections: builder.query<any, any>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', String(params.page));
        if (params.limit) queryParams.append('limit', String(params.limit));
        if (params.search) queryParams.append('search', params.search);
        if (params.classId) queryParams.append('classId', params.classId);
        if (params.status && params.status !== 'all') queryParams.append('status', params.status);
        const qStr = queryParams.toString();
        return { url: `/sections${qStr ? `?${qStr}` : ''}`, method: 'GET' };
      },
      providesTags: ['Section'],
    }),
    addSection: builder.mutation<any, Partial<SectionRecord>>({
      query: (body) => ({ url: '/sections', method: 'POST', body }),
      invalidatesTags: ['Section'],
    }),
    updateSection: builder.mutation<any, { id: string; body: Partial<SectionRecord> }>({
      query: ({ id, body }) => ({ url: `/sections/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Section'],
    }),
    deleteSection: builder.mutation<any, string>({
      query: (id) => ({ url: `/sections/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Section'],
    }),
  }),
});

export const {
  useGetSectionsQuery,
  useAddSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
} = sectionApi;
