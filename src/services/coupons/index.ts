import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export const coupons = createApi({
  reducerPath: 'coupons',
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    addCoupon: builder.mutation({
      query: (body) => ({
        url: '/coupons/add',
        method: 'POST',
        body,
      }),
    }),
    getAllCoupon: builder.query({
      query: (params) => {
        return {
          url: '/coupons',
          method: 'GET',
          params,
        };
      },
    }),
    getOpenCoupons: builder.query({
      query: () => ({
        url: '/coupons/open',
        method: 'GET',
      }),
    }),
  }),
});

export const { useAddCouponMutation, useGetAllCouponQuery, useGetOpenCouponsQuery } = coupons;
