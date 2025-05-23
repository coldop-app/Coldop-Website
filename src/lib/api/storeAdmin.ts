import axios from "axios";
import { BASE_URL } from "@/utils/const";

interface LoginCredentials {
  mobileNumber: string;
  password: string;
  isMobile: boolean;
}

interface SignupCredentials {
  name: string;
  personalAddress: string;
  mobileNumber: string;
  coldStorageName: string;
  coldStorageAddress: string;
  coldStorageContactNumber: string;
  capacity?: number;
  password: string;
  imageUrl: string;
  isVerified: boolean;
  isMobile: boolean;
  preferences: {
    bagSizes: string[];
  };
}

interface DaybookOrdersParams {
  type: 'all' | 'incoming' | 'outgoing';
  sortBy: 'latest' | 'oldest';
  page: number;
  limit: number;
}

interface SearchReceiptParams {
  receiptNumber: number;
}

export const storeAdminApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await axios.post(
      `${BASE_URL}/api/store-admin/login`,
      credentials,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  register: async (credentials: SignupCredentials) => {
    const response = await axios.post(
      `${BASE_URL}/api/store-admin/register`,
      credentials,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  sendOtp: async (mobileNumber: string) => {
    const formData = new URLSearchParams();
    formData.append('mobileNumber', mobileNumber);

    const response = await axios.post(
      `${BASE_URL}/api/store-admin/send-otp`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  },

  verifyOtp: async (mobileNumber: string, enteredOtp: string) => {
    const formData = new URLSearchParams();
    formData.append('mobileNumber', mobileNumber);
    formData.append('enteredOtp', enteredOtp);

    const response = await axios.post(
      `${BASE_URL}/api/store-admin/verify-mobile`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  },

  resendOtp: async (mobileNumber: string) => {
    const formData = new URLSearchParams();
    formData.append('mobileNumber', mobileNumber);

    const response = await axios.post(
      `${BASE_URL}/api/store-admin/resend-otp`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  },

  editMobile: async (mobileNumber: string) => {
    const formData = new URLSearchParams();
    formData.append('mobileNumber', mobileNumber);

    const response = await axios.post(
      `${BASE_URL}/api/store-admin/edit-mobile`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  },

  getDaybookOrders: async (params: DaybookOrdersParams, token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/store-admin/daybook/orders`,
      {
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  searchReceipt: async (params: SearchReceiptParams, token: string) => {
    const response = await axios.post(
      `${BASE_URL}/api/store-admin/daybook/search-receipt`,
      params,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  getFarmers: async (token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/store-admin/farmers`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  getFarmerStockSummary: async (farmerId: string, token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/store-admin/farmers/${farmerId}/stock-summary`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
};
