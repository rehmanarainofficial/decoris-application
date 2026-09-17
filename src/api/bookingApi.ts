import { baseApi } from './baseApi';
import { ENV } from '../constants/env';

export interface SalesOrderDetailItem {
  description: string;
  quantity: number | string;
  unit_price: number | string;
  text1: string;
}

export interface PostEventQuotationRequest {
  update_id: string | number;
  function_date: string;
  f_time: string;
  party_name: string;
  contact_no: string;
  guest: string | number;
  venue: string;
  user_id: string | number;
  total: string | number;
  discount1: string | number;
  so_advance: string | number;
  sales_order_details: string; // JSON string representation
  comments: string;
  salesman: string | number;
  status?: string | number;
}

export interface PostEventQuotationResponse {
  status: string | boolean;
  message?: string;
  data?: any;
}

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    postEventQuotation: builder.mutation<PostEventQuotationResponse, PostEventQuotationRequest>({
      query: (bodyData) => {
        const formData = new FormData();
        formData.append('update_id', String(bodyData.update_id));
        formData.append('function_date', String(bodyData.function_date));
        formData.append('f_time', String(bodyData.f_time));
        formData.append('party_name', String(bodyData.party_name));
        formData.append('contact_no', String(bodyData.contact_no));
        formData.append('guest', String(bodyData.guest));
        formData.append('venue', String(bodyData.venue));
        formData.append('user_id', String(bodyData.user_id));
        formData.append('total', String(bodyData.total));
        formData.append('discount1', String(bodyData.discount1));
        formData.append('so_advance', String(bodyData.so_advance));
        formData.append('sales_order_details', String(bodyData.sales_order_details));
        formData.append('comments', String(bodyData.comments));
        formData.append('salesman', String(bodyData.salesman));
        if (bodyData.status !== undefined) {
          formData.append('status', String(bodyData.status));
        }

        return {
          url: ENV.ENDPOINTS.POST_EVENT_QUOTATION,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Orders', 'Dashboard'],
    }),
  }),
});

export const { usePostEventQuotationMutation } = bookingApi;
