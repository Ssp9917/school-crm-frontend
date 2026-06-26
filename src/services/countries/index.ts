import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import countriesData from '../../data/countries.json'

// Countries data is bundled locally (src/data/countries.json) because the
// public restcountries.com API was deprecated (every version now 301-redirects
// to an error payload). Flag images load from the flagcdn.com static CDN.
// The response shape matches the old restcountries v3.1 payload, so
// useCountries and every consumer keep working unchanged.
export const countries = createApi({
  reducerPath: 'countries',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    getAll: builder.query({
      queryFn: () => ({ data: countriesData }),
    }),
  }),
})

export const { useGetAllQuery: useGetCountriesQuery } = countries
