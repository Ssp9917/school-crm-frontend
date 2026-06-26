import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export const qrCodes = createApi({
  reducerPath: 'qrCodes',
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    generateQrCode: builder.mutation({
      query: (branchId) => ({
        url: '/qr-codes/generate',
        method: 'POST',
        body: { branchId },
      }),
    }),
    // ── Registration QR (used by the "Add User via QR" modal) ──
    generateRegistrationQr: builder.mutation({
      query: (branchId) => ({
        url: '/qr-codes/generate',
        method: 'POST',
        body: { branchId, type: 'registration' },
      }),
    }),
    getBranchRegistrationQr: builder.query({
      query: (branchId) => ({
        url: `/qr-codes/branch/${branchId}`,
        method: 'GET',
        params: { type: 'registration' },
      }),
    }),
  }),
});

export const {
  useGenerateQrCodeMutation,
  useGenerateRegistrationQrMutation,
  useGetBranchRegistrationQrQuery,
} = qrCodes;
