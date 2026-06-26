import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export const leadsApi = createApi({
  reducerPath: 'leadsApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Leads'],
  endpoints: (builder) => ({
    addLead: builder.mutation({
      query: (body) => ({
        url: '/leads',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leads'],
    }),
    getLeads: builder.query({
      query: (params) => ({
        url: '/leads',
        method: 'GET',
        params,
      }),
      providesTags: ['Leads'],
    }),
    getLeadById: builder.query({
      query: (id) => ({
        url: `/leads/${id}`,
        method: 'GET',
      }),
      providesTags: ['Leads'],
    }),
    deleteLead: builder.mutation({
      query: (id) => ({
        url: `/leads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Leads'],
    }),
    updateLead: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/leads/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Leads'],
    }),
    assignLead: builder.mutation({
      query: ({ id, salesPersonId }) => ({
        url: `/leads/${id}/assign`,
        method: 'PATCH',
        body: { salesPersonId },
      }),
      invalidatesTags: ['Leads'],
    }),
    updateLeadStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/leads/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Leads'],
    }),
    updateLeadNotes: builder.mutation({
      query: ({ id, noteId, notes }) => ({
        url: `/leads/${id}/notes`,
        method: 'PATCH',
        body: { noteId, notes },
      }),
      invalidatesTags: ['Leads'],
    }),
    getLeadConvertData: builder.query({
      query: (id) => ({
        url: `/leads/${id}/convert-data`,
        method: 'GET',
      }),
    }),
    convertLead: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/leads/${id}/convert`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leads'],
    }),
    getLeadActivities: builder.query({
      query: (id) => ({
        url: `/leads/${id}/activities`,
        method: 'GET',
      }),
      providesTags: ['Leads'],
    }),
    addLeadActivity: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/leads/${id}/activities`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leads'],
    }),
  }),
});

export const { useAddLeadMutation, useUpdateLeadMutation, useDeleteLeadMutation, useGetLeadsQuery, useGetLeadByIdQuery, useAssignLeadMutation, useUpdateLeadStatusMutation, useUpdateLeadNotesMutation, useGetLeadConvertDataQuery, useConvertLeadMutation, useGetLeadActivitiesQuery, useAddLeadActivityMutation } = leadsApi;
