import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

interface BlacklistRequestArgs {
  userId: string;
  reason: string;
}

export interface BlacklistRequest {
  _id:         string;
  userId:      { _id: string; name: string; email?: string; phoneNumber?: string; userType?: string; branchName?: string };
  requestedBy: { _id: string; name: string; email?: string; userType?: string; branchName?: string } | null;
  branchId:    { _id: string; name: string } | string | null;
  reason:      string;
  status:      string;
  requestType: string;
  reviewedBy:        null | { _id: string; name: string };
  reviewedAt:        string | null;
  rejectionReason:   string | null;
  cancelledBy:       null | { _id: string; name: string };
  cancelledAt:       string | null;
  cancellationReason: string | null;
  createdAt:   string;
  updatedAt:   string;
}

interface GetBlacklistRequestsParams {
  page?:   number;
  limit?:  number;
  type?:   string;
  status?: string;
}

interface GetBlacklistRequestsResponse {
  data:       BlacklistRequest[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const blacklistApi = createApi({
  reducerPath: 'blacklist',
  baseQuery:   dynamicBaseQuery,
  tagTypes:    ['Blacklist'] as const,
  endpoints:   (builder) => ({
    requestBlacklist: builder.mutation<void, BlacklistRequestArgs>({
      query: (body) => ({
        url:    '/blacklist/request',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Blacklist'],
    }),
    approveBlacklistRequest: builder.mutation<void, string>({
      query: (id) => ({
        url:    `/blacklist/requests/${id}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Blacklist'],
    }),
    cancelBlacklistRequest: builder.mutation<void, string>({
      query: (id) => ({
        url:    `/blacklist/requests/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Blacklist'],
    }),
    rejectBlacklistRequest: builder.mutation<void, { id: string; rejectionReason: string }>({
      query: ({ id, rejectionReason }) => ({
        url:    `/blacklist/requests/${id}/reject`,
        method: 'PATCH',
        body:   { rejectionReason },
      }),
      invalidatesTags: ['Blacklist'],
    }),
    getBlacklistRequests: builder.query<GetBlacklistRequestsResponse, GetBlacklistRequestsParams>({
      query: ({ type = 'blacklist', status, page, limit }) => ({
        url:    '/requests',
        method: 'GET',
        params: {
          type,
          ...(status && status !== 'all' ? { status } : {}),
          page,
          limit,
        },
      }),
      providesTags: ['Blacklist'],
    }),
  }),
});

export const {
  useRequestBlacklistMutation,
  useCancelBlacklistRequestMutation,
  useApproveBlacklistRequestMutation,
  useRejectBlacklistRequestMutation,
  useGetBlacklistRequestsQuery,
} = blacklistApi;
