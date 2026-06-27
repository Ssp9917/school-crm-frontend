import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export const examsApi = createApi({
  reducerPath: 'examsApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Exam', 'Mark'],
  endpoints: (builder) => ({
    getExams: builder.query<any, { page?: number; limit?: number; search?: string; classId?: string }>({
      query: ({ page = 1, limit = 10, search, classId } = {}) => {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(limit));
        if (search) params.append('search', search);
        if (classId) params.append('classId', classId);
        return { url: `/exams?${params.toString()}`, method: 'GET' };
      },
      providesTags: ['Exam'],
    }),
    getExamById: builder.query<any, string>({
      query: (id) => ({ url: `/exams/${id}`, method: 'GET' }),
      providesTags: ['Exam'],
    }),
    createExam: builder.mutation<any, any>({
      query: (body) => ({
        url: '/exams',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Exam'],
    }),
    updateExam: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/exams/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Exam'],
    }),
    deleteExam: builder.mutation<any, string>({
      query: (id) => ({
        url: `/exams/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Exam'],
    }),
    // Marks
    submitMarks: builder.mutation<any, any>({
      query: (body) => ({
        url: '/exams/marks',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Mark'],
    }),
    getMarksList: builder.query<any, { examId: string; subjectId: string }>({
      query: ({ examId, subjectId }) => ({
        url: `/exams/marks/list?examId=${examId}&subjectId=${subjectId}`,
        method: 'GET',
      }),
      providesTags: ['Mark'],
    }),
    getReportCard: builder.query<any, { studentId: string; examId: string }>({
      query: ({ studentId, examId }) => ({
        url: `/exams/report-card/${studentId}/${examId}`,
        method: 'GET',
      }),
      providesTags: ['Mark'],
    }),
  }),
});

export const {
  useGetExamsQuery,
  useGetExamByIdQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
  useSubmitMarksMutation,
  useGetMarksListQuery,
  useGetReportCardQuery,
} = examsApi;
