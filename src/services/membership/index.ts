
// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import { dynamicBaseQuery } from "../badRequestHandler"

interface AddonSessionsParams {
  status?: string
  serviceType?: string
  type?: string
  trainerId?: string
  fromDate?: string
  toDate?: string
  page?: string | number
  limit?: string | number
}

interface AddonsUsersParams {
  page?: string | number
  limit?: string | number
  search?: string
  status?: string
  addonType?: string
  branchId?: string
  coachId?: string
  trainerName?: string
  sessionStatus?: string
  startDate?: string
  endDate?: string
}

// Define a service using a base URL and expected endpoints
export const membership = createApi({
  reducerPath: 'membership',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Membership'] as const,
  endpoints: (builder) => ({
    getUserMembership: builder.query({
      query: (userId) => ({
        url: `/memberships/user/${userId}`,
        method: "GET",
      }),
      providesTags: ['Membership'],
    }),
    getUserAddOns: builder.query({
      query: (userId) => ({
        url: `/memberships/user/${userId}/addons`,
        method: "GET",
      }),
      providesTags: ['Membership'],
    }),
    getAddonSessions: builder.query({
      query: (membershipId) => ({
        url: `/addon-sessions/membership/${membershipId}`,
        method: "GET",
      }),
      providesTags: ['Membership'],
    }),
    getAllAddonSessions: builder.query<unknown, AddonSessionsParams>({
      query: ({ status, serviceType, type, trainerId, fromDate, toDate, page, limit } = {}) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (serviceType) params.append('serviceType', serviceType);
        if (type) params.append('type', type);
        if (trainerId) params.append('trainerId', trainerId);
        if (fromDate) params.append('fromDate', fromDate);
        if (toDate) params.append('toDate', toDate);
        if (page) params.append('page', String(page));
        if (limit) params.append('limit', String(limit));
        const queryString = params.toString();
        return {
          url: `/addon-sessions/all${queryString ? `?${queryString}` : ''}`,
          method: "GET",
        };
      },
      providesTags: ['Membership'],
    }),
    getAllAddonsUsers: builder.query<unknown, AddonsUsersParams>({
      query: ({ page, limit, search, status, addonType, branchId, coachId, trainerName, sessionStatus, startDate, endDate } = {}) => {
        const params = new URLSearchParams();
        if (addonType)     params.append('addonType', addonType);
        if (status)        params.append('status', status);
        if (branchId)      params.append('branchId', branchId);
        if (coachId)       params.append('coachId', coachId);
        if (trainerName)   params.append('trainerName', trainerName);
        if (sessionStatus) params.append('sessionStatus', sessionStatus);
        if (startDate)     params.append('startDate', startDate);
        if (endDate)       params.append('endDate', endDate);
        if (search)        params.append('search', search);
        if (page)          params.append('page', String(page));
        if (limit)         params.append('limit', String(limit));
        const queryString = params.toString();
        return {
          url: `/memberships/all/addons${queryString ? `?${queryString}` : ''}`,
          method: "GET",
        };
      },
      providesTags: ['Membership'],
    }),
    startAddonSession: builder.mutation({
      query: (data) => ({
        url: `/addon-sessions/start`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Membership'],
    }),
    pauseAddonSession: builder.mutation({
      query: (sessionId) => ({
        url: `/addon-sessions/${sessionId}/pause`,
        method: "PATCH",
      }),
      invalidatesTags: ['Membership'],
    }),
    resumeAddonSession: builder.mutation({
      query: (sessionId) => ({
        url: `/addon-sessions/${sessionId}/resume`,
        method: "PATCH",
      }),
      invalidatesTags: ['Membership'],
    }),
    addComplementarySession: builder.mutation({
      query: ({ membershipId, serviceType, sessions }) => ({
        url: `/memberships/${membershipId}/add-complementary`,
        method: "PATCH",
        body: { serviceType, sessions },
      }),
      invalidatesTags: ['Membership'],
    }),
    updateCouponServices: builder.mutation({
      query: ({ membershipId, totalCoupons, couponServices }) => ({
        url: `/memberships/${membershipId}/coupon-services`,
        method: "PATCH",
        body: { totalCoupons, couponServices },
      }),
      invalidatesTags: ['Membership'],
    }),
    extendMembershipExpiry: builder.mutation({
      query: ({ membershipId, days }) => ({
        url: `/memberships/${membershipId}/extend-expiry`,
        method: "PATCH",
        body: { days },
      }),
      invalidatesTags: ['Membership'],
    }),
    freezeMembership: builder.mutation({
      query: ({ membershipId, startDate, endDate, reason }) => ({
        url: `/memberships/${membershipId}/freeze`,
        method: "PATCH",
        body: { startDate, endDate, reason },
      }),
      invalidatesTags: ['Membership'],
    }),
    freezeAddon: builder.mutation({
      query: (membershipId) => ({
        url: `/memberships/addon/${membershipId}/freeze`,
        method: "PATCH",
      }),
      invalidatesTags: ['Membership'],
    }),
    unfreezeAddon: builder.mutation({
      query: (membershipId) => ({
        url: `/memberships/addon/${membershipId}/unfreeze`,
        method: "PATCH",
      }),
      invalidatesTags: ['Membership'],
    }),
    changeTrainer: builder.mutation({
      query: ({ membershipId, coachId }) => ({
        url: `/memberships/${membershipId}/trainer`,
        method: "PATCH",
        body: { coachId },
      }),
      invalidatesTags: ['Membership'],
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetUserMembershipQuery,
  useGetUserAddOnsQuery,
  useGetAddonSessionsQuery,
  useGetAllAddonSessionsQuery,
  useGetAllAddonsUsersQuery,
  useStartAddonSessionMutation,
  usePauseAddonSessionMutation,
  useResumeAddonSessionMutation,
  useAddComplementarySessionMutation,
  useUpdateCouponServicesMutation,
  useExtendMembershipExpiryMutation,
  useFreezeMembershipMutation,
  useFreezeAddonMutation,
  useUnfreezeAddonMutation,
  useChangeTrainerMutation,
} = membership
