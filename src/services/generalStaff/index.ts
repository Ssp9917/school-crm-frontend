import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export const generalStaffApi = createApi({
  reducerPath: 'generalStaffApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['GeneralStaff', 'StaffTypes'],
  endpoints: (builder) => ({
    getGeneralStaff: builder.query<any, any>({
      query: ({ page = 1, limit = 10, search, status, branchId } = {}) => {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(limit));
        if (search)                         params.append('search', search);
        if (status)                         params.append('status', status);
        if (branchId && branchId !== 'all') params.append('branchId', branchId);
        return { url: `/general-staff?${params.toString()}`, method: 'GET' };
      },
      providesTags: ['GeneralStaff'],
    }),
    getGeneralStaffDetail: builder.query({
      query: (id) => ({
        url: `/general-staff/${id}`,
        method: 'GET',
      }),
    }),
    addGeneralStaff: builder.mutation({
      query: (body) => ({
        url: '/general-staff',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['GeneralStaff'],
    }),
    updateGeneralStaff: builder.mutation({
      query: ({ id, body }) => ({
        url: `/general-staff/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['GeneralStaff'],
    }),
    updateGeneralStaffStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/general-staff/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['GeneralStaff'],
    }),
    verifyGeneralStaff: builder.mutation({
      query: (id) => ({
        url: `/general-staff/${id}/verify`,
        method: 'PATCH',
      }),
      invalidatesTags: ['GeneralStaff'],
    }),
    unverifyGeneralStaff: builder.mutation({
      query: (id) => ({
        url: `/general-staff/${id}/unverify`,
        method: 'PATCH',
      }),
      invalidatesTags: ['GeneralStaff'],
    }),
    getStaffTypes: builder.query<any, void>({
      query: () => ({
        url: '/general-staff/staff-types',
        method: 'GET',
      }),
      providesTags: ['StaffTypes'],
    }),
    addStaffType: builder.mutation({
      query: (body) => ({
        url: '/general-staff/staff-types',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['StaffTypes'],
    }),
  }),
});

export const {
  useGetGeneralStaffQuery,
  useAddGeneralStaffMutation,
  useGetStaffTypesQuery,
  useAddStaffTypeMutation,
  useGetGeneralStaffDetailQuery,
  useUpdateGeneralStaffMutation,
  useUpdateGeneralStaffStatusMutation,
  useVerifyGeneralStaffMutation,
  useUnverifyGeneralStaffMutation,
} = generalStaffApi;
