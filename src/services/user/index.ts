// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import {dynamicBaseQuery} from "../badRequestHandler"

// ── Types ────────────────────────────────────────────────────────────────────

export interface UserMember {
  countryCode?: string
  alternativePhoneNumber?: string
  address?: string
  age?: number
  dob?: string
  idNumber?: string
  idFront?: string
  idBack?: string
  photo?: string
  gender?: string
  work?: string
  stateName?: string
  zipCode?: string
  nationality?: string
  emergencyContactNumber?: string
  emergencyContactName?: string
  healthInfo?: {
    emergencyContact?: { relation?: string }
    bloodGroup?: string
  }
  hearAbout?: string
  referred?: string
  height?: number
  weight?: number
  bmiMeasurement?: string
  bmi?: string
  medicalHistory?: string
  maritalStatus?: string
  anniversaryDate?: string
}

export interface BranchRef {
  _id?: string
  branchId?: string
  name?: string
}

export interface UserRecord {
  _id?: string
  name?: string
  email?: string
  phoneNumber?: string
  userType?: string
  status?: string
  isAttached?: boolean
  attachedToPhoneNumber?: string
  branchIds?: BranchRef[]
  member?: UserMember
  currentMembership?: Record<string, unknown>
  addonMembership?: { planName?: string }
  salesPerson?: Array<{ _id?: string; name?: string }>
  planGymKit?: unknown
  deliveredSummary?: unknown
}

export interface SimpleUser {
  _id?: string
  name: string
  phoneNumber: string
}

// ── Request arg types ────────────────────────────────────────────────────────

export interface GetAllUserParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  branchIds?: string
  membershipType?: string
  salesPerson?: string
}

export interface GetUsersByRoleParams {
  role: string
  branchId?: string
  userId?: string
}

export interface AssignGymKitArgs {
  userId: string
  products: unknown[]
}

export interface UpdateUserArgs {
  id: string
  body: Partial<UserRecord>
}

// ── Response types ───────────────────────────────────────────────────────────

export interface UserDetailResponse {
  user: UserRecord
}

export interface UsersListResponse {
  users: UserRecord[]
  total?: number
  page?: number
}

export interface SimpleUserListResponse {
  users: SimpleUser[]
}

export interface UsersByRoleResponse {
  data: UserRecord[]
}

// Define a service using a base URL and expected endpoints
export const user = createApi({
  reducerPath: 'user',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['user', 'UserDetail'] as const,
  endpoints: (builder) => ({
    adduser: builder.mutation<UserRecord, Partial<UserRecord>>({
      query: (body) => ({
        url: `/users`,
        method: "POST",
        body,
      }),
      invalidatesTags:["user"]
    }),
    userDetailData: builder.query<UserDetailResponse, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
      providesTags: ['UserDetail'],
    }),
    getAllUser: builder.query<UsersListResponse, GetAllUserParams | undefined>({
      query: (params) => {
        let url = `/users`;
        if (params) {
          const search = [];
          if (params.page) search.push(`page=${params.page}`);
          if (params.limit) search.push(`limit=${params.limit}`);
          if (params.search) search.push(`search=${params.search}`);
          if (params.status && params.status !== 'all') search.push(`status=${params.status}`);
          if (params.branchIds) search.push(`branchId=${params.branchIds}`);
          if (params.membershipType) search.push(`membershipType=${params.membershipType}`);
          if (params.salesPerson && params.salesPerson !== 'all') search.push(`salesPerson=${encodeURIComponent(params.salesPerson)}`);
          if (search.length) url += `?${search.join('&')}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags:["user"]
    }),
    getAttachUserList: builder.query<SimpleUserListResponse, void>({
      query: () => ({
        url: `/users/simple-list`,
        method: "GET",
      }),
    }),
    assignGymKit: builder.mutation<UserRecord, AssignGymKitArgs>({
      query: ({ userId, products }) => ({
        url: `/users/${userId}/assign-gym-kit`,
        method: "POST",
        body: { products },
      }),
      invalidatesTags: ["user"]
    }),

    updateUser: builder.mutation<UserRecord, UpdateUserArgs>({
      query: ({ id, body }) => ({
        url: `/users/${id}/member`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["user"]
    }),

    updateUserPhoto: builder.mutation<unknown, { id: string; photo: string }>({
      query: ({ id, photo }) => ({
        url: `/users/${id}/photo`,
        method: "PATCH",
        body: { photo },
      }),
      invalidatesTags: ["user", "UserDetail"]
    }),

    getUsersByRole: builder.query<UsersByRoleResponse, GetUsersByRoleParams>({
      query: ({ role, branchId, userId }) => {
        let url = `/users/by-role-open?role=${role}`;
        if (branchId) {
          url += `&branchId=${branchId}`;
        }
        if (userId) {
          url += `&userId=${userId}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["user"]
    }),


    verifyUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}/verify`, method: 'PATCH' }),
      invalidatesTags: ['user'],
    }),
    unverifyUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}/unverify`, method: 'PATCH' }),
      invalidatesTags: ['user'],
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useUserDetailDataQuery, useAdduserMutation, useGetAttachUserListQuery, useGetAllUserQuery, useAssignGymKitMutation, useUpdateUserMutation, useUpdateUserPhotoMutation, useGetUsersByRoleQuery, useVerifyUserMutation, useUnverifyUserMutation } = user