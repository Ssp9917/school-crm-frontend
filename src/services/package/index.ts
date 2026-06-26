import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface GetPlansParams {
  page?:     number;
  limit?:    number;
  search?:   string;
  status?:   string;
  type?:     string;
  userId?:   string;
  branchId?: string;
}

interface UpdatePlanArgs {
  id:   string;
  body: Record<string, unknown>;
}

interface GetUpgradablePlansParams {
  userId:    string;
  branchId?: string;
}

interface GetAddOnPackagesParams {
  type?:         string;
  addonType?:    string;
  branchId?:     string;
  membershipId?: string;
}

interface GetOpenAddonPlansParams {
  type?:         string;
  membershipId?: string;
}

/* ─── API ────────────────────────────────────────────────────────────── */

export const plans = createApi({
  reducerPath: 'plans',
  baseQuery:   dynamicBaseQuery,
  tagTypes:    ['Plans'] as const,
  endpoints:   (builder) => ({
    addPlan: builder.mutation<unknown, Record<string, unknown>>({
      query: (body) => ({ url: '/fee-structures', method: 'POST', body }),
      invalidatesTags: ['Plans'],
    }),
    getPlans: builder.query<unknown, GetPlansParams>({
      query: ({ page = 1, limit = 10, search = '', status = '', type = '', userId = '', branchId = '' } = {}) => {
        const params = new URLSearchParams();
        params.append('page',  String(page));
        params.append('limit', String(limit));
        if (search)                    params.append('search',   search);
        if (status && status !== 'all') params.append('status',   status);
        if (type   && type   !== 'all') params.append('type',     type);
        if (userId)                    params.append('userId',   userId);
        if (branchId)                  params.append('branchId', branchId);
        return { url: `/fee-structures?${params.toString()}`, method: 'GET' };
      },
      providesTags: ['Plans'],
    }),
    getPlanDetail: builder.query<unknown, string>({
      query: (id) => ({ url: `/fee-structures/${id}`, method: 'GET' }),
      providesTags: ['Plans'],
    }),
    updatePlan: builder.mutation<unknown, UpdatePlanArgs>({
      query: ({ id, body }) => ({ url: `/fee-structures/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Plans'],
    }),
    deletePlan: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/fee-structures/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Plans'],
    }),
    togglePlanStatus: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/fee-structures/${id}`, method: 'PUT', body: { status: 'toggle' } }),
      invalidatesTags: ['Plans'],
    }),
    activatePlan: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/fee-structures/${id}`, method: 'PUT', body: { status: 'active' } }),
      invalidatesTags: ['Plans'],
    }),
    deactivatePlan: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/fee-structures/${id}`, method: 'PUT', body: { status: 'inactive' } }),
      invalidatesTags: ['Plans'],
    }),
    getUpgradablePlans: builder.query<unknown, GetUpgradablePlansParams>({
      query: ({ userId, branchId }) => {
        const params = new URLSearchParams();
        if (branchId) params.append('branchId', branchId);
        return { url: `/fee-structures/upgradable/${userId}?${params.toString()}`, method: 'GET' };
      },
      providesTags: ['Plans'],
    }),
    getAddOnPackages: builder.query<unknown, GetAddOnPackagesParams>({
      query: ({ type, addonType, branchId, membershipId }) => {
        const params = new URLSearchParams();
        if (type)         params.append('type',         type);
        if (addonType)    params.append('addonType',    addonType);
        if (branchId)     params.append('branchId',     branchId);
        if (membershipId) params.append('membershipId', membershipId);
        return { url: `/fee-structures?${params.toString()}`, method: 'GET' };
      },
      providesTags: ['Plans'],
    }),
    getOpenAddonPlans: builder.query<unknown, GetOpenAddonPlansParams>({
      query: ({ type = 'addon', membershipId } = {}) => {
        const params = new URLSearchParams();
        if (type)         params.append('type',         type);
        if (membershipId) params.append('membershipId', membershipId);
        return { url: `/fee-structures/open?${params.toString()}`, method: 'GET' };
      },
      providesTags: ['Plans'],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useAddPlanMutation,useGetPlansQuery,useGetPlanDetailQuery,useUpdatePlanMutation,useDeletePlanMutation,useTogglePlanStatusMutation,useActivatePlanMutation,useDeactivatePlanMutation,useGetUpgradablePlansQuery,useGetAddOnPackagesQuery,useGetOpenAddonPlansQuery } = plans