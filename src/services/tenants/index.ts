import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export const tenantsApi = createApi({
  reducerPath: 'tenantsApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Tenant'],
  endpoints: (builder) => ({
    getTenants: builder.query<any, void>({
      query: () => ({ url: '/tenants', method: 'GET' }),
      providesTags: ['Tenant'],
    }),
    getTenantById: builder.query<any, string>({
      query: (id) => ({ url: `/tenants/${id}`, method: 'GET' }),
      providesTags: ['Tenant'],
    }),
    createTenant: builder.mutation<any, any>({
      query: (body) => ({
        url: '/tenants',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tenant'],
    }),
    updateTenant: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/tenants/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Tenant'],
    }),
    deleteTenant: builder.mutation<any, string>({
      query: (id) => ({
        url: `/tenants/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tenant'],
    }),
  }),
});

export const {
  useGetTenantsQuery,
  useGetTenantByIdQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
} = tenantsApi;
