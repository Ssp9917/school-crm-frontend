import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export const studentAttendanceApi = createApi({
  reducerPath: 'studentAttendanceApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['StudentAttendance'],
  endpoints: (builder) => ({
    getStudentAttendance: builder.query<any, { date: string; classId: string; sectionId: string }>({
      query: ({ date, classId, sectionId }) => ({
        url: `/student-attendance?date=${date}&classId=${classId}&sectionId=${sectionId}`,
        method: 'GET',
      }),
      providesTags: ['StudentAttendance'],
    }),
    submitStudentAttendance: builder.mutation<any, { date: string; classId: string; sectionId: string; attendanceList: any[] }>({
      query: (body) => ({
        url: '/student-attendance',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['StudentAttendance'],
    }),
    getStudentAttendanceSummary: builder.query<any, { studentId: string; month: string; year: string }>({
      query: ({ studentId, month, year }) => ({
        url: `/student-attendance/summary/${studentId}?month=${month}&year=${year}`,
        method: 'GET',
      }),
      providesTags: ['StudentAttendance'],
    }),
  }),
});

export const {
  useGetStudentAttendanceQuery,
  useSubmitStudentAttendanceMutation,
  useGetStudentAttendanceSummaryQuery,
} = studentAttendanceApi;
