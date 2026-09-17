import { baseApi } from './baseApi';
import { ENV } from '../constants/env';

export interface SalesmanItem {
  salesman_code: string;
  salesman_name: string;
  salesman_phone: string;
  salesman_fax: string;
  salesman_email: string;
  user_id: string;
  provision: string;
  break_pt: string;
  provision2: string;
  report_to: string | null;
  ship_via: string | null;
  designation: string | null;
  inactive: string;
}

export interface SalesmanResponse {
  status: string;
  data: SalesmanItem[];
}

export const salesmanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesmen: builder.query<SalesmanResponse, void>({
      query: () => ({
        url: ENV.ENDPOINTS.SALESMAN,
        method: 'GET',
      }),
      providesTags: ['Salesman'],
    }),
  }),
});

export const { useGetSalesmenQuery } = salesmanApi;
