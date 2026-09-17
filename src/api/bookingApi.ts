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
  order_no?: string | number;
  function_date: string;
  f_time: string;
  time?: string;
  party_name: string;
  contact_no: string;
  guest: string | number;
  venue: string;
  user_id: string | number;
  total: string | number;
  discount1: string | number;
  so_advance: string | number;
  sales_order_details: string;
  comments: string;
  salesman: string | number;
  status?: string | number;
}

export interface PostEventQuotationResponse {
  status: string | boolean;
  message?: string;
  data?: any;
}

export interface EventQuotationHeaderItem {
  order_no: string;
  person_id: string;
  reference: string;
  ord_date: string;
  function_date: string;
  total: string;
  advance: string;
  name: string;
  contact_no: string;
  function_code: string;
  salesman_name: string;
  director_name: string;
  venue: string;
  guest: string;
  time: string;
  comments: string;
  bank_id: string;
  sales_type: string;
  director_id: string;
  event_type: string;
  discount1: string;
  salesman: string;
  event_status: string;
  event_status_name: string;
  payment_terms: string;
  payment_terms_name: string;
}

export interface GetEventQuotationHeaderResponse {
  status: string | boolean;
  data: EventQuotationHeaderItem[];
}

export interface ViewDataHeaderItem {
  trans_no: string;
  reference?: string;
  trans_date?: string;
  due_date?: string | null;
  order_no: string;
  person_id?: string;
  ord_date?: string;
  function_date?: string;
  total: string;
  advance: string;
  name: string;
  contact_no: string;
  function_code: string;
  salesman_name: string;
  director_name?: string;
  venue: string;
  guest: string;
  time: string;
  comments?: string | null;
  bank_id?: string | null;
  sales_type?: string | null;
  director_id?: string;
  event_type?: string;
  discount1?: string | null;
  salesman?: string;
  event_status?: string;
  event_status_name?: string;
  payment_terms?: string;
  customer_ref?: string;
  discount?: string | null;
}

export interface ViewDataDetailItem {
  id: string;
  trans_no: string;
  stock_id: string;
  qty_done?: string;
  quantity: string;
  description: string;
  long_description?: string;
  unit_price: string;
  discount_percent?: string;
}

export interface ViewDataResponse {
  status_header: string | boolean;
  data_header: ViewDataHeaderItem[];
  status_detail: string | boolean;
  data_detail: ViewDataDetailItem[];
}

export interface ViewDataRequest {
  trans_no: string | number;
  type?: string | number;
}

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEventQuotationHeaders: builder.query<GetEventQuotationHeaderResponse, void>({
      query: () => ({
        url: ENV.ENDPOINTS.GET_EVENT_QUOTATION_HEADER,
        method: 'GET',
      }),
      providesTags: ['Orders'],
    }),

    getViewData: builder.query<ViewDataResponse, ViewDataRequest | string | number>({
      query: (arg) => {
        let orderNo = '';
        let typeVal = '32';
        if (typeof arg === 'object' && arg !== null) {
          orderNo = String(arg.trans_no || '');
          if (arg.type !== undefined) typeVal = String(arg.type);
        } else {
          orderNo = String(arg || '');
        }

        const formData = new FormData();
        formData.append('trans_no', orderNo);
        formData.append('type', typeVal);

        console.log(`=== [VIEW_DATA POST FORM-DATA: trans_no=${orderNo}, type=${typeVal}] ===`);

        return {
          url: ENV.ENDPOINTS.VIEW_DATA,
          method: 'POST',
          body: formData,
        };
      },
      providesTags: ['Orders'],
    }),

    postEventQuotation: builder.mutation<PostEventQuotationResponse, PostEventQuotationRequest>({
      query: (bodyData) => {
        const formData = new FormData();
        formData.append('update_id', String(bodyData.update_id));
        if (bodyData.order_no) {
          formData.append('order_no', String(bodyData.order_no));
        }
        formData.append('function_date', String(bodyData.function_date));
        const timeVal = bodyData.f_time || bodyData.time || '';
        formData.append('f_time', String(timeVal));
        formData.append('time', String(timeVal));
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
          formData.append('event_status', String(bodyData.status));
        }

        console.log('=== [POST_EVENT_QUOTATION API REQUEST BODY] ===');
        console.log(bodyData);
        console.log('=== [POST_EVENT_QUOTATION FORM DATA SENT TO SERVER] ===');
        console.log(formData);

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

export const {
  useGetEventQuotationHeadersQuery,
  useGetViewDataQuery,
  useLazyGetViewDataQuery,
  usePostEventQuotationMutation,
} = bookingApi;
