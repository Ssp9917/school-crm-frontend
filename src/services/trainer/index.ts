// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import {dynamicBaseQuery} from "../badRequestHandler"

// ── Types ────────────────────────────────────────────────────────────────────

export interface TrainerRecord {
  _id?: string
  name?: string
  email?: string
  phoneNumber?: string
  status?: string
  branchId?: string
  specialization?: string
  experience?: number
  photo?: string
  [key: string]: unknown
}

// ── Request arg types ────────────────────────────────────────────────────────

export interface GetTrainersParams {
  page?:     number
  limit?:    number
  branchId?: string
  search?:   string
  status?:   string
}

export interface UpdateTrainerArgs {
  id: string
  body: Partial<TrainerRecord>
}

export interface UpdateTrainerStatusArgs {
  id: string
  status: string
}

// ── Response types ───────────────────────────────────────────────────────────

export interface TrainersListResponse {
  trainers: TrainerRecord[]
  total?: number
  page?: number
}

export interface TrainerDetailResponse {
  trainer: TrainerRecord
}

// Define a service using a base URL and expected endpoints
export const trainer = createApi({
  reducerPath: 'trainer',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Trainers'] as const,
  endpoints: (builder) => ({
    getTrainers: builder.query<TrainersListResponse, GetTrainersParams | undefined>({
      query: ({ page = 1, limit = 10, branchId, search, status } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (branchId && branchId !== 'all') params.append('branchId', branchId);
        if (search)  params.append('search', search);
        if (status)  params.append('status', status);
        return { url: `/teachers?${params.toString()}`, method: 'GET' };
      },
      providesTags: ['Trainers'],
    }),
    getTrainersDetail: builder.query<TrainerDetailResponse, string>({
      query: (id) => ({
        url: `/teachers/${id}`,
        method: "GET",
      }),
      providesTags: ['Trainers'],
    }),
    addTrainers: builder.mutation<TrainerRecord, Partial<TrainerRecord>>({
      query: (newTrainer) => ({
        url: `/teachers`,
        method: "POST",
        body: newTrainer,
      }),
      invalidatesTags: ['Trainers'],
    }),
    updateTrainer: builder.mutation<TrainerRecord, UpdateTrainerArgs>({
      query: ({ id, body }) => ({
        url: `/teachers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ['Trainers'],
    }),
    updateTrainerStatus: builder.mutation<TrainerRecord, UpdateTrainerStatusArgs>({
      query: ({ id, status }) => ({
        url: `/teachers/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ['Trainers'],
    }),
    verifyTrainer: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/teachers/${id}/verify`,
        method: "PATCH",
      }),
      invalidatesTags: ['Trainers'],
    }),
    unverifyTrainer: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/teachers/${id}/unverify`,
        method: "PATCH",
      }),
      invalidatesTags: ['Trainers'],
    }),
    getOpenTrainers: builder.query<TrainersListResponse, GetTrainersParams | undefined>({
      query: ({ page = 1, limit = 100, branchId } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (branchId) params.append('branchId', branchId);
        return {
          url: `/teachers/open?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ['Trainers'],
    }),
  }),
})

export const { useGetTrainersQuery, useAddTrainersMutation, useGetTrainersDetailQuery, useUpdateTrainerMutation, useUpdateTrainerStatusMutation, useVerifyTrainerMutation, useUnverifyTrainerMutation, useGetOpenTrainersQuery } = trainer
