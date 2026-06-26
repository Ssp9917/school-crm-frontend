import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface GetAttendanceParams {
  userType:   string;
  userId?:    string;
  startDate?: string;
  endDate?:   string;
  branchId?:  string;
  page?:      number;
  limit?:     number;
  search?:    string;
}

/* ─── API ────────────────────────────────────────────────────────────── */

export const attendanceApi = createApi({
  reducerPath: 'attendanceApi',
  baseQuery:   dynamicBaseQuery,
  tagTypes:    ['Attendance'] as const,
  endpoints:   (builder) => ({
    getAttendance: builder.query<unknown, GetAttendanceParams>({
      query: ({ userType, userId, startDate, endDate, branchId, page = 1, limit = 10, search }) => {
        const params = new URLSearchParams();
        params.append('userType', userType);
        params.append('page', String(page));
        params.append('limit', String(limit));
        if (userId)                         params.append('userId', userId);
        if (startDate)                      params.append('startDate', startDate);
        if (endDate)                        params.append('endDate', endDate);
        if (branchId && branchId !== 'all') params.append('branchId', branchId);
        if (search)                         params.append('search', search);
        return { url: `/attendance?${params.toString()}`, method: 'GET' };
      },
      providesTags: ['Attendance'],
    }),
  }),
});

export const { useGetAttendanceQuery } = attendanceApi;
