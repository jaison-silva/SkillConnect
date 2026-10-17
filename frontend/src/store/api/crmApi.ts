import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type {
  ApiResponse,
  CrmQueryParams,
  CrmUsersResponse,
  ToggleBlockResponse,
} from '../../types';

export const crmApi = createApi({
  reducerPath: 'crmApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['CrmUsers'],
  endpoints: (builder) => ({
    getUsers: builder.query<ApiResponse<CrmUsersResponse>, CrmQueryParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.search) searchParams.set('search', params.search);
        if (params?.role) searchParams.set('role', params.role);
        if (params?.isVerified !== undefined && params?.isVerified !== '') {
          searchParams.set('isVerified', params.isVerified);
        }
        if (params?.isBlocked !== undefined && params?.isBlocked !== '') {
          searchParams.set('isBlocked', params.isBlocked);
        }
        if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
        const qs = searchParams.toString();
        return { url: `/admin/crm/users${qs ? `?${qs}` : ''}` };
      },
      providesTags: ['CrmUsers'],
    }),
    toggleBlockUser: builder.mutation<ApiResponse<ToggleBlockResponse>, string>({
      query: (userId) => ({
        url: `/admin/crm/users/${userId}/block`,
        method: 'PATCH',
      }),
      invalidatesTags: ['CrmUsers'],
    }),
  }),
});

export const { useGetUsersQuery, useToggleBlockUserMutation } = crmApi;
