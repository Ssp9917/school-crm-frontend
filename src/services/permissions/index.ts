// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import {dynamicBaseQuery} from "../badRequestHandler"

// Define a service using a base URL and expected endpoints
export const permissions = createApi({
  reducerPath: 'permissions',
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    getPermissions: builder.query({
      query: () => ({
        url: `/permissions/grouped`,
        method: "GET",
      }),
    }),
    siderMenu: builder.query<unknown, void>({
      query: () => ({
        url: `/sidebar-menu`,
        method: "GET",
      }),
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetPermissionsQuery, useSiderMenuQuery } = permissions
