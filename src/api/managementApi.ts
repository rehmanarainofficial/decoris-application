import { baseApi } from './baseApi';

export interface SliderFinancialData {
  cur_m_bank?: string;
  pre_m_bank?: string;
  cur_m_receivable?: string;
  pre_m_receivable?: string;
  cur_m_payable?: string;
  pre_m_payable?: string;
  cur_m_inventory_val?: string;
  pre_m_inventory_val?: string;
  cur_m_income?: string;
  pre_m_income?: string;
  cur_m_expense?: string;
  pre_m_expense?: string;
  cur_m_revenue?: string;
  pre_m_revenue?: string;
  cur_m_equity?: string;
  pre_m_equity?: string;
}

export interface FinancialOverviewResponse {
  status?: string | boolean;
  slider_data?: SliderFinancialData;
  message?: string;
}

export interface IncomeExpenseItem {
  name: string;
  total: string;
  account_type: string;
}

export interface IncomeExpenseResponse {
  status_income_det?: string | boolean;
  data_income_det?: IncomeExpenseItem[];
  status_exp_det?: string | boolean;
  data_exp_det?: IncomeExpenseItem[];
}

export interface CustomerBalanceItem {
  debtor_no?: string;
  name?: string;
  Balance?: string | number;
  [key: string]: any;
}

export interface SupplierBalanceItem {
  supplier_id?: string;
  supp_name?: string;
  name?: string;
  Balance?: string | number;
  [key: string]: any;
}

export interface BankBalanceItem {
  bank_act?: string;
  bank_account_name?: string;
  bank_name?: string;
  name?: string;
  bank_balance?: string | number;
  Balance?: string | number;
  [key: string]: any;
}

export interface DashReceivableResponse {
  status_cust_bal?: string | boolean;
  data_cust_bal?: CustomerBalanceItem[];
  data_view_cust_bal?: CustomerBalanceItem[];
}

export interface DashPayableResponse {
  status_supp_bal?: string | boolean;
  status_supp_bal_view_all?: string | boolean;
  data_supp_bal?: SupplierBalanceItem[];
  data_supp_bal_view_all?: SupplierBalanceItem[];
}

export interface DashBanksResponse {
  status_cash_bank?: string | boolean;
  data_bank_bal?: BankBalanceItem[];
  data_bank_bal_view_all?: BankBalanceItem[];
}

export interface ParentAccountDetailItem {
  account_code?: string;
  account_name?: string;
  trans_date?: string;
  memo?: string;
  amount?: string | number;
  reference?: string;
  type?: string | number;
  [key: string]: any;
}

export interface ParentAccountDetailResponse {
  status?: string | boolean;
  data?: ParentAccountDetailItem[];
}

export interface CategoryValuationItem {
  category_id?: string;
  description?: string;
  valution?: string | number;
  valuation?: string | number;
  [key: string]: any;
}

export interface LocationValuationItem {
  loc_code?: string;
  location_name?: string;
  valution?: string | number;
  valuation?: string | number;
  [key: string]: any;
}

export interface ItemValuationItem {
  stock_id?: string;
  description?: string;
  category?: string;
  loc_code?: string;
  quantity?: string | number;
  unit_cost?: string | number;
  valution?: string | number;
  valuation?: string | number;
  [key: string]: any;
}

export interface CategoryValuationResponse {
  status_cate_wise_valutions?: string | boolean;
  data_cate_wise_valutions?: CategoryValuationItem[];
}

export interface LocationValuationResponse {
  status_loc_wise_valutions?: string | boolean;
  data_loc_wise_valutions?: LocationValuationItem[];
}

export interface ItemValuationResponse {
  status_item_wise_valutions?: string | boolean;
  data_item_wise_valutions?: ItemValuationItem[];
}

// Helper to execute query with automatic fallback between 'dashboard/filename.php' and 'filename.php'
const executeWithFallback = async (
  baseQuery: any,
  subPath: string,
  formData: FormData
) => {
  const primaryUrl = `dashboard/${subPath}`;
  const fallbackUrl = subPath;

  const res = await baseQuery({
    url: primaryUrl,
    method: 'POST',
    body: formData,
  });

  if (res.error && (res.error.status === 404 || res.error.status === 400 || res.error.status === 'FETCH_ERROR')) {
    const fallbackRes = await baseQuery({
      url: fallbackUrl,
      method: 'POST',
      body: formData,
    });
    if (!fallbackRes.error) {
      return fallbackRes;
    }
  }

  return res;
};

export const managementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinancialOverview: builder.mutation<
      FinancialOverviewResponse,
      { company?: string; dimension_id?: string | number }
    >({
      async queryFn(body, _queryApi, _extraOptions, baseQuery) {
        const formData = new FormData();
        formData.append('company', body?.company || '1');
        formData.append('dimension_id', String(body?.dimension_id || ''));

        const res = await executeWithFallback(baseQuery, 'financial_overview.php', formData);
        return res.data
          ? { data: res.data as FinancialOverviewResponse }
          : { error: res.error };
      },
      invalidatesTags: ['Dashboard'],
    }),

    getIncomeExpense: builder.mutation<
      IncomeExpenseResponse,
      {
        from_date: string;
        to_date: string;
        company?: string;
        dimension_id?: string | number;
      }
    >({
      async queryFn(body, _queryApi, _extraOptions, baseQuery) {
        const formData = new FormData();
        formData.append('from_date', body.from_date);
        formData.append('to_date', body.to_date);
        formData.append('company', body?.company || '1');
        formData.append('dimension_id', String(body?.dimension_id || ''));

        const res = await executeWithFallback(baseQuery, 'income_and_expense.php', formData);
        return res.data
          ? { data: res.data as IncomeExpenseResponse }
          : { error: res.error };
      },
    }),

    getDashReceivable: builder.mutation<
      DashReceivableResponse,
      { company?: string; dimension_id?: string | number }
    >({
      async queryFn(body, _queryApi, _extraOptions, baseQuery) {
        const formData = new FormData();
        formData.append('company', body?.company || '1');
        formData.append('dimension_id', String(body?.dimension_id || ''));

        const res = await executeWithFallback(baseQuery, 'dash_receivable.php', formData);
        return res.data
          ? { data: res.data as DashReceivableResponse }
          : { error: res.error };
      },
    }),

    getDashPayable: builder.mutation<
      DashPayableResponse,
      { company?: string; dimension_id?: string | number }
    >({
      async queryFn(body, _queryApi, _extraOptions, baseQuery) {
        const formData = new FormData();
        formData.append('company', body?.company || '1');
        formData.append('dimension_id', String(body?.dimension_id || ''));

        const res = await executeWithFallback(baseQuery, 'dash_payable.php', formData);
        return res.data
          ? { data: res.data as DashPayableResponse }
          : { error: res.error };
      },
    }),

    getDashBanks: builder.mutation<
      DashBanksResponse,
      { company?: string; dimension_id?: string | number }
    >({
      async queryFn(body, _queryApi, _extraOptions, baseQuery) {
        const formData = new FormData();
        formData.append('company', body?.company || '1');
        formData.append('dimension_id', String(body?.dimension_id || ''));

        const res = await executeWithFallback(baseQuery, 'dash_banks.php', formData);
        return res.data
          ? { data: res.data as DashBanksResponse }
          : { error: res.error };
      },
    }),

    getParentAccountDetail: builder.mutation<
      ParentAccountDetailResponse,
      {
        from_date: string;
        to_date: string;
        account_type: string;
        company?: string;
        dimension_id?: string | number;
      }
    >({
      async queryFn(body, _queryApi, _extraOptions, baseQuery) {
        const formData = new FormData();
        formData.append('from_date', body.from_date);
        formData.append('to_date', body.to_date);
        formData.append('account_type', body.account_type);
        formData.append('company', body?.company || '1');
        formData.append('dimension_id', String(body?.dimension_id || ''));

        console.log('[managementApi] calling parent_account_detail.php with:', {
          from_date: body.from_date,
          to_date: body.to_date,
          account_type: body.account_type,
          company: body?.company || '1',
          dimension_id: String(body?.dimension_id || ''),
        });

        const res = await executeWithFallback(baseQuery, 'parent_account_detail.php', formData);
        console.log('[managementApi] parent_account_detail.php raw response:', res);

        return res.data
          ? { data: res.data as ParentAccountDetailItem[] | any }
          : { error: res.error };
      },
    }),

    getDashCategoryWiseValuation: builder.mutation<
      CategoryValuationResponse,
      { company?: string; dimension_id?: string | number }
    >({
      async queryFn(body, _queryApi, _extraOptions, baseQuery) {
        const formData = new FormData();
        formData.append('company', body?.company || '1');
        formData.append('dimension_id', String(body?.dimension_id || ''));

        const res = await executeWithFallback(baseQuery, 'dash_category_wise_valution.php', formData);
        return res.data
          ? { data: res.data as CategoryValuationResponse }
          : { error: res.error };
      },
    }),

    getDashLocationWiseValuation: builder.mutation<
      LocationValuationResponse,
      { company?: string; dimension_id?: string | number }
    >({
      async queryFn(body, _queryApi, _extraOptions, baseQuery) {
        const formData = new FormData();
        formData.append('company', body?.company || '1');
        formData.append('dimension_id', String(body?.dimension_id || ''));

        const res = await executeWithFallback(baseQuery, 'dash_location_wise_valution.php', formData);
        return res.data
          ? { data: res.data as LocationValuationResponse }
          : { error: res.error };
      },
    }),

    getDashItemWiseValuation: builder.mutation<
      ItemValuationResponse,
      { company?: string; dimension_id?: string | number }
    >({
      async queryFn(body, _queryApi, _extraOptions, baseQuery) {
        const formData = new FormData();
        formData.append('company', body?.company || '1');
        formData.append('dimension_id', String(body?.dimension_id || ''));

        const res = await executeWithFallback(baseQuery, 'dash_item_wise_valution.php', formData);
        return res.data
          ? { data: res.data as ItemValuationResponse }
          : { error: res.error };
      },
    }),
  }),
});

export const {
  useGetFinancialOverviewMutation,
  useGetIncomeExpenseMutation,
  useGetDashReceivableMutation,
  useGetDashPayableMutation,
  useGetDashBanksMutation,
  useGetParentAccountDetailMutation,
  useGetDashCategoryWiseValuationMutation,
  useGetDashLocationWiseValuationMutation,
  useGetDashItemWiseValuationMutation,
} = managementApi;
