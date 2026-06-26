// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import {dynamicBaseQuery} from "../badRequestHandler"
// Define a service using a base URL and expected endpoints
export const imageService = createApi({
  reducerPath: 'imageService',
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    imageUpload: builder.mutation({
      query: (body) => ({
        url: `/images/upload`,
        method: "POST",
        body,
      }),
    }),
    deleteImage: builder.mutation({
      query: (image) => ({
        url: `/images/delete/`,
        method: "DELETE",
        body: { image: image },
      }),
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useImageUploadMutation, useDeleteImageMutation } = imageService