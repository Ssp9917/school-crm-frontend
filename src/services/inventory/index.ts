import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export interface InventoryItem {
  _id: string;
  productName: string;
  branchId: { _id: string; name: string } | string;
  quantity: number;
  quantityAvailable?: number;
  warehouseName: string;
  productImage?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'out_of_order' | 'retired';
}

export interface InventoryResponse {
  success: boolean;
  data: InventoryItem[];
  message?: string;
}

export interface CreateInventoryPayload {
  productName: string;
  branchId: string;
  quantity: number;
  warehouseName: string;
  productImage?: string;
}

export interface UpdateInventoryPayload {
  id: string;
  productName?: string;
  branchId?: string;
  quantity?: number;
  warehouseName?: string;
  productImage?: string;
  status?: string;
}

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery:dynamicBaseQuery,
  tagTypes: ['Inventory'] as const,
  endpoints: (builder) => ({
    createInventory: builder.mutation<InventoryResponse, CreateInventoryPayload>({
      query: (inventoryData) => ({
        url: '/inventory',
        method: 'POST',
        body: inventoryData,
      }),
      invalidatesTags: ['Inventory'],
    }),
    getInventory: builder.query<InventoryResponse, void>({
      query: () => '/inventory',
      providesTags: ['Inventory'],
    }),
    getGymKitInventory: builder.query<InventoryResponse, string[] | undefined>({
      query: (branchIds) => {
        if (Array.isArray(branchIds) && branchIds.length > 0) {
          const branchIdString = branchIds.join(',');
          return `/inventory/by-branches?branchIds=${branchIdString}`;
        } else if (branchIds) {
          return `/inventory/by-branches?branchIds=${branchIds}`;
        }
        return '/inventory/by-branches?branchIds';
      },
      providesTags: ['Inventory'],
    }),
    updateInventory: builder.mutation<InventoryResponse, UpdateInventoryPayload>({
      query: ({ id, ...inventoryData }) => ({
        url: `/inventory/${id}`,
        method: 'PUT',
        body: inventoryData,
      }),
      invalidatesTags: ['Inventory'],
    }),
    deleteInventory: builder.mutation<InventoryResponse, string>({
      query: (id) => ({
        url: `/inventory/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Inventory'],
    }),
    toggleInventoryStatus: builder.mutation<InventoryResponse, { id: string; status: 'active' | 'inactive' }>({
      query: ({ id, status }) => ({
        url: `/inventory/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Inventory'],
    }),
  }),
});

export const {
  useCreateInventoryMutation,
  useGetInventoryQuery,
  useGetGymKitInventoryQuery,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
  useToggleInventoryStatusMutation,
} = inventoryApi;