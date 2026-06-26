// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import {dynamicBaseQuery} from "../badRequestHandler"

export interface Role {
  _id: string
  name: string
  status: string
  permissions?: Record<string, any>
  level?: number
  [key: string]: any
}

export interface RolesResponse {
  data: Role[]
  message?: string
  success?: boolean
}

// Define a service using a base URL and expected endpoints
export const roles = createApi({
  reducerPath: 'roles',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Roles'] as const,
  endpoints: (builder) => ({
    getRoles: builder.query<RolesResponse, void>({
      query: () => ({
        url: `/roles`,
        method: "GET",

      }),
      providesTags: ['Roles']
    }),
    getRolesByLevel: builder.query<RolesResponse, void>({
      query: () => ({
        url: `/roles/public`,
        method: "GET",

      }),
      providesTags: ['Roles']
    }),
    addRole: builder.mutation({
      query: (payload) => ({
        url: `/roles`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ['Roles'],
    }),
    updateRole: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/roles/permissions/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ['Roles'],
    }),
    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Roles'],
    }),
    getRoleById: builder.query({
      query: (id) => ({
        url: `/roles/permissions/${id}`,
        method: "GET",
      }),
      providesTags: ['Roles'],
    }),
    updateRoleStatus: builder.mutation({
      query: (id) => ({
        url: `/roles/toggle-status/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ['Roles'],
    }),
  
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetRolesByLevelQuery,useUpdateRoleStatusMutation,useGetRolesQuery,useGetRoleByIdQuery, useAddRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } = roles