import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export interface SubjectRecord {
  _id?: string;
  name: string;
  code?: string;
  classId: string;
  teacherId?: string;
  status?: 'active' | 'inactive';
}

export const subjectApi = createApi({
  reducerPath: 'subjectApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Subject'] as const,
  endpoints: (builder) => ({
    getSubjects: builder.query<any, any>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', String(params.page));
        if (params.limit) queryParams.append('limit', String(params.limit));
        if (params.search) queryParams.append('search', params.search);
        if (params.classId) queryParams.append('classId', params.classId);
        if (params.status && params.status !== 'all') queryParams.append('status', params.status);
        const qStr = queryParams.toString();
        return { url: `/subjects${qStr ? `?${qStr}` : ''}`, method: 'GET' };
      },
      providesTags: ['Subject'],
    }),
    addSubject: builder.mutation<any, Partial<SubjectRecord>>({
      query: (body) => ({ url: '/subjects', method: 'POST', body }),
      invalidatesTags: ['Subject'],
    }),
    updateSubject: builder.mutation<any, { id: string; body: Partial<SubjectRecord> }>({
      query: ({ id, body }) => ({ url: `/subjects/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Subject'],
    }),
    deleteSubject: builder.mutation<any, string>({
      query: (id) => ({ url: `/subjects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Subject'],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useAddSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = subjectApi;
