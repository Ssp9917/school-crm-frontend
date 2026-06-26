import { createApi } from '@reduxjs/toolkit/query/react'
import { dynamicBaseQuery } from '../badRequestHandler'

interface AssessmentsParams {
  page?:             string | number
  limit?:            string | number
  search?:           string
  status?:           string
  assessmentStatus?: string
  trainerId?:        string
  branchId?:         string
  startDate?:        string
  endDate?:          string
}

export const assessment = createApi({
  reducerPath: 'assessment',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Assessment'] as const,
  endpoints: (builder) => ({
    getAllAssessments: builder.query<unknown, AssessmentsParams>({
      query: ({ page, limit, search, status, assessmentStatus, trainerId, branchId, startDate, endDate } = {}) => {
        const params = new URLSearchParams()
        params.append('hasAssessment', 'true')
        if (status && status !== 'all') params.append('status', status)
        if (assessmentStatus) params.append('assessmentStatus', assessmentStatus)
        if (trainerId) params.append('trainerId', trainerId)
        if (branchId)  params.append('branchId', branchId)
        if (startDate) params.append('startDate', startDate)
        if (endDate)   params.append('endDate', endDate)
        if (search)    params.append('search', search)
        if (page)      params.append('page', String(page))
        if (limit)     params.append('limit', String(limit))
        return {
          url: `/users?${params.toString()}`,
          method: 'GET',
        }
      },
      providesTags: ['Assessment'],
    }),
    assignAssessment: builder.mutation<unknown, { userId: string; trainerId: string }>({
      query: ({ userId, trainerId }) => ({
        url: `/users/${userId}/assign-assessment`,
        method: 'PATCH',
        body: { trainerId },
      }),
      invalidatesTags: ['Assessment'],
    }),
  }),
})

export const { useGetAllAssessmentsQuery, useAssignAssessmentMutation } = assessment
