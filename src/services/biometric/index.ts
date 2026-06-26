import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface GetBiometricsParams {
  page?:  number;
  limit?: number;
}

interface BiometricBody {
  [key: string]: unknown;
}

interface UpdateBiometricArgs extends BiometricBody {
  id: string;
}

/* ─── API ────────────────────────────────────────────────────────────── */

export const biometricApi = createApi({
  reducerPath: 'biometricApi',
  baseQuery:   dynamicBaseQuery,
  tagTypes:    ['Biometric'] as const,
  endpoints:   (builder) => ({
    getBiometrics: builder.query<unknown, GetBiometricsParams>({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url:    `/machines?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['Biometric'],
    }),
    getBiometricById: builder.query<unknown, string>({
      query: (id) => ({
        url:    `/machines/${id}`,
        method: 'GET',
      }),
    }),
    addBiometric: builder.mutation<unknown, BiometricBody>({
      query: (body) => ({
        url:    '/machines',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Biometric'],
    }),
    updateBiometric: builder.mutation<unknown, UpdateBiometricArgs>({
      query: ({ id, ...body }) => ({
        url:    `/machines/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Biometric'],
    }),
    updateBiometricLimited: builder.mutation<unknown, UpdateBiometricArgs>({
      query: ({ id, ...body }) => ({
        url:    `/machines/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Biometric'],
    }),
    deleteBiometric: builder.mutation<unknown, string>({
      query: (id) => ({
        url:    `/machines/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Biometric'],
    }),
    updateBiometricStatus: builder.mutation<unknown, string>({
      query: (id) => ({
        url:    `/machines/toggle-status/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Biometric'],
    }),
    getBranchResources: builder.query<unknown, string | string[]>({
      query: (branchIds) => {
        if (Array.isArray(branchIds) && branchIds.length > 0) {
          return `/branch-resources?branchIds=${branchIds.join(',')}`;
        }
        if (branchIds) {
          return `/branch-resources?branchIds=${branchIds}`;
        }
        return '/branch-resources';
      },
      providesTags: ['Biometric'],
    }),
    pushUserToBranch: builder.mutation<unknown, { userId: string }>({
      query: (body) => ({ url: '/machines/push-user-to-branch', method: 'POST', body }),
    }),
    getUserAccess: builder.query<unknown, string>({
      query: (userId) => ({
        url:    `/machines/user-access/${userId}`,
        method: 'GET',
      }),
      providesTags: ['Biometric'],
    }),
  }),
});

export const {
  useGetBiometricsQuery,
  useGetBiometricByIdQuery,
  useAddBiometricMutation,
  useUpdateBiometricMutation,
  useUpdateBiometricLimitedMutation,
  useDeleteBiometricMutation,
  useUpdateBiometricStatusMutation,
  useGetBranchResourcesQuery,
  usePushUserToBranchMutation,
  useGetUserAccessQuery,
} = biometricApi;