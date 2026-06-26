import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export interface StudentRecord {
  _id?: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  roleId?: string;
  branchIds?: string[];
  rollNumber?: string;
  classId?: string;
  sectionId?: string;
  parentIds?: string[];
  classTeacher?: string;
  dob?: string;
  gender?: string;
  address?: string;
  status?: string;
}

export const studentApi = createApi({
  reducerPath: 'studentApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Student'] as const,
  endpoints: (builder) => ({
    getStudents: builder.query<any, any>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', String(params.page));
        if (params.limit) queryParams.append('limit', String(params.limit));
        if (params.search) queryParams.append('search', params.search);
        if (params.classId) queryParams.append('classId', params.classId);
        if (params.sectionId) queryParams.append('sectionId', params.sectionId);
        if (params.status && params.status !== 'all') queryParams.append('status', params.status);
        const qStr = queryParams.toString();
        return { url: `/students${qStr ? `?${qStr}` : ''}`, method: 'GET' };
      },
      providesTags: ['Student'],
    }),
    getStudentDetail: builder.query<any, string>({
      query: (id) => ({ url: `/students/${id}`, method: 'GET' }),
      providesTags: ['Student'],
    }),
    addStudent: builder.mutation<any, Partial<StudentRecord>>({
      query: (body) => ({ url: '/students', method: 'POST', body }),
      invalidatesTags: ['Student'],
    }),
    updateStudent: builder.mutation<any, { id: string; body: Partial<StudentRecord> }>({
      query: ({ id, body }) => ({ url: `/students/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Student'],
    }),
    deleteStudent: builder.mutation<any, string>({
      query: (id) => ({ url: `/students/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Student'],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentDetailQuery,
  useAddStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} = studentApi;
