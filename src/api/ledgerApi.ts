import { baseApi } from './baseApi';
import { ENV } from '../constants/env';

export interface GLAccountItem {
  account_code: string;
  account_name: string;
  inactive?: string;
}

export interface GetGLAccountsResponse {
  status: string | boolean;
  data: GLAccountItem[];
}

export interface GLTransactionItem {
  account?: string;
  account_name?: string;
  reference?: string;
  doc_date: string;
  person_name?: string;
  memo?: string;
  amount: string | number;
  type?: string | number;
  type_no?: string | number;
}

export interface GLAccountInquiryResponse {
  status: string | boolean;
  opening?: string | number;
  data: GLTransactionItem[];
}

export interface GLAccountInquiryRequest {
  from_date: string;
  to_date: string;
  account: string;
}

export const ledgerApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getGLAccounts: builder.query<GetGLAccountsResponse, void>({
      query: () => ({
        url: ENV.ENDPOINTS.GET_GL_ACCOUNT,
        method: 'GET',
      }),
      providesTags: ['Ledger'],
    }),

    getGLAccountInquiry: builder.mutation<
      GLAccountInquiryResponse,
      GLAccountInquiryRequest
    >({
      query: bodyData => {
        const formData = new FormData();
        formData.append('from_date', String(bodyData.from_date));
        formData.append('to_date', String(bodyData.to_date));
        formData.append('account', String(bodyData.account));

        console.log('=== [GL_ACCOUNT_INQUIRY REQUEST] ===', bodyData);

        return {
          url: ENV.ENDPOINTS.GL_ACCOUNT_INQUIRY,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Ledger'],
    }),
  }),
});

export const { useGetGLAccountsQuery, useGetGLAccountInquiryMutation } =
  ledgerApi;
