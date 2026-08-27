import { baseApi } from './baseApi';
import { ENV } from '../constants/env';

export interface ApiUserRecord {
  id: string;
  user_id: string;
  password?: string;
  real_name: string;
  role_id: string;
  saleman_id: string | null;
  phone: string;
  email: string | null;
  language: string;
  date_format: string;
  date_sep: string;
  tho_sep: string;
  dec_sep: string;
  theme: string;
  page_size: string;
  prices_dec: string;
  qty_dec: string;
  rates_dec: string;
  percent_dec: string;
  show_gl: string;
  show_codes: string;
  show_hints: string;
  last_visit_date: string | null;
  query_size: string;
  graphic_links: string;
  pos: string;
  print_profile: string;
  rep_popup: string;
  sticky_doc_date: string;
  startup_tab: string;
  inactive: string;
}

export interface LoginResponse {
  status: string;
  data: ApiUserRecord[];
}

export interface LoginRequest {
  user_id: string;
  password?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => {
        const formData = new FormData();
        formData.append('user_id', credentials.user_id);
        if (credentials.password) {
          formData.append('password', credentials.password);
        }
        return {
          url: ENV.ENDPOINTS.LOGIN,
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

export const { useLoginMutation } = authApi;
