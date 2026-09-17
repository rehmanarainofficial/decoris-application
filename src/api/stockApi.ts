import { baseApi } from './baseApi';
import { ENV } from '../constants/env';

export interface StockMasterItem {
  category_id: string;
  tax_type_id: string;
  long_description: string;
  units: string;
  mb_flag: string;
  inactive: string;
  stock_id: string;
  description: string;
  price: string | null;
  cat_name: string;
  tax_type_name: string;
  item_type_name: string;
  unit_name: string;
  qoh: string | null;
}

export interface StockMasterResponse {
  status: string;
  data: StockMasterItem[];
}

export const stockApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockMaster: builder.query<StockMasterResponse, void>({
      query: () => ({
        url: ENV.ENDPOINTS.STOCK_MASTER,
        method: 'GET',
      }),
      providesTags: ['Stock'],
    }),
  }),
});

export const { useGetStockMasterQuery } = stockApi;
