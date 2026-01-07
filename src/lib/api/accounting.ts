import axios from "axios";
import { BASE_URL } from "@/utils/const";

export const accountingApi = {
  getLedgers: async (params: { type?: string; search?: string }, token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/accounting/ledgers`,
      {
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  createLedger: async (payload: {
    name: string;
    type: string;
    subType: string;
    category: string;
    openingBalance?: number;
  }, token: string) => {
    const response = await axios.post(
      `${BASE_URL}/api/accounting/ledgers`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  getLedgerById: async (ledgerId: string, token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/accounting/ledgers/${ledgerId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  updateLedger: async (ledgerId: string, payload: {
    name?: string;
    openingBalance?: number;
    closingBalance?: number;
  }, token: string) => {
    const response = await axios.put(
      `${BASE_URL}/api/accounting/ledgers/${ledgerId}`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  deleteLedger: async (ledgerId: string, token: string) => {
    const response = await axios.delete(
      `${BASE_URL}/api/accounting/ledgers/${ledgerId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  getLedgerEntries: async (ledgerId: string, token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/accounting/ledgers/${ledgerId}/entries`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  getVouchers: async (params: {
    startDate?: string;
    endDate?: string;
    ledgerId?: string;
  }, token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/accounting/vouchers`,
      {
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  createVoucher: async (payload: {
    date: string;
    debitLedger: string;
    creditLedger: string;
    amount: number;
    narration?: string;
  }, token: string) => {
    const response = await axios.post(
      `${BASE_URL}/api/accounting/vouchers`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  getVoucherById: async (voucherId: string, token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/accounting/vouchers/${voucherId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  updateVoucher: async (voucherId: string, payload: {
    date?: string;
    debitLedger?: string;
    creditLedger?: string;
    amount?: number;
    narration?: string;
  }, token: string) => {
    const response = await axios.put(
      `${BASE_URL}/api/accounting/vouchers/${voucherId}`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  deleteVoucher: async (voucherId: string, token: string) => {
    const response = await axios.delete(
      `${BASE_URL}/api/accounting/vouchers/${voucherId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  getTrialBalance: async (type: 'opening' | 'closing' = 'closing', token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/accounting/reports/trial-balance`,
      {
        params: { type },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  getBalanceSheet: async (token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/accounting/reports/balance-sheet`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  getTradingAndPL: async (token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/accounting/reports/trading-pl`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  getClosingBalances: async (token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/accounting/reports/closing-balances`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }
};
