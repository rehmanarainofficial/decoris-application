import { baseApi } from './baseApi';
import { ENV } from '../constants/env';

export interface LocationItem {
  loc_code: string;
  location_name: string;
}

export interface GetLocationsResponse {
  status: string | boolean;
  data: LocationItem[];
}

export interface LocalPurchaseAccountItem {
  account_code: string;
  account_name: string;
}

export interface GetLocalPurchaseAccountsResponse {
  status: string | boolean;
  data: LocalPurchaseAccountItem[];
}

export interface PostReceiptRequest {
  trans_date: string;
  amount: string | number;
  user_id: string | number;
  receipt_detail: string;
}

export interface PostPaymentRequest {
  trans_date: string;
  amount: string | number;
  user_id: string | number;
  expense_detail: string;
}

export interface ExpenseApiResponse {
  status: string | boolean;
  message?: string;
  data?: any;
}

export const expenseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLocations: builder.query<GetLocationsResponse, void>({
      query: () => ({
        url: ENV.ENDPOINTS.LOCATIONS,
        method: 'GET',
      }),
      providesTags: ['Expense'],
    }),

    getLocalPurchaseAccounts: builder.query<GetLocalPurchaseAccountsResponse, void>({
      query: () => ({
        url: ENV.ENDPOINTS.LOCAL_PURCHASE_ACCOUNT,
        method: 'GET',
      }),
      providesTags: ['Expense'],
    }),

    getLocalPurchasePaymentAccounts: builder.query<GetLocalPurchaseAccountsResponse, void>({
      query: () => ({
        url: ENV.ENDPOINTS.LOCAL_PURCHASE_PAYMENT_ACCOUNT,
        method: 'GET',
      }),
      providesTags: ['Expense'],
    }),

    postLocalPurchaseReceipt: builder.mutation<ExpenseApiResponse, PostReceiptRequest>({
      query: (bodyData) => {
        const formData = new FormData();
        formData.append('trans_date', String(bodyData.trans_date));
        formData.append('amount', String(bodyData.amount));
        formData.append('user_id', String(bodyData.user_id));
        formData.append('receipt_detail', String(bodyData.receipt_detail));

        console.log('=== [POST_LOCAL_PURCHASE_RECEIPT REQUEST] ===', bodyData);

        return {
          url: ENV.ENDPOINTS.POST_LOCAL_PURCHASE_RECEIPT,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Expense', 'Dashboard'],
    }),

    postLocalPurchasePayment: builder.mutation<ExpenseApiResponse, PostPaymentRequest>({
      query: (bodyData) => {
        const formData = new FormData();
        formData.append('trans_date', String(bodyData.trans_date));
        formData.append('amount', String(bodyData.amount));
        formData.append('user_id', String(bodyData.user_id));
        formData.append('expense_detail', String(bodyData.expense_detail));

        console.log('=== [POST_LOCAL_PURCHASE_PAYMENT REQUEST] ===', bodyData);

        return {
          url: ENV.ENDPOINTS.POST_LOCAL_PURCHASE_PAYMENT,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Expense', 'Dashboard'],
    }),

    postLocalPurchaseMaterial: builder.mutation<ExpenseApiResponse, PostPaymentRequest>({
      query: (bodyData) => {
        const formData = new FormData();
        formData.append('trans_date', String(bodyData.trans_date));
        formData.append('amount', String(bodyData.amount));
        formData.append('user_id', String(bodyData.user_id));
        formData.append('expense_detail', String(bodyData.expense_detail));

        console.log('=== [POST_LOCAL_PURCHASE_MATERIAL REQUEST] ===', bodyData);

        return {
          url: ENV.ENDPOINTS.POST_LOCAL_PURCHASE_MATERIAL,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Expense', 'Dashboard'],
    }),
  }),
});

export const {
  useGetLocationsQuery,
  useGetLocalPurchaseAccountsQuery,
  useGetLocalPurchasePaymentAccountsQuery,
  usePostLocalPurchaseReceiptMutation,
  usePostLocalPurchasePaymentMutation,
  usePostLocalPurchaseMaterialMutation,
} = expenseApi;
