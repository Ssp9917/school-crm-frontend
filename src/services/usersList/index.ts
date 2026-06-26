import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export const usersListApi = createApi({
  reducerPath: 'usersListApi',
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    getUsersSimpleList: builder.query({
      query: () => ({
        url: '/users/public-list',
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetUsersSimpleListQuery } = usersListApi;
