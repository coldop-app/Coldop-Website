import axios from "axios";
import { BASE_URL } from "@/utils/const";

interface LoginCredentials {
  mobileNumber: string;
  password: string;
  isMobile: boolean;
}

interface QuickRegisterCredentials {
  name: string;
  address: string;
  mobileNumber: string;
  password: string;
  imageUrl: string;
  farmerId: string;
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

interface SearchByVarietyParams {
  variety: string;
  storeAdminId: string;
}

interface CreateOrderPayload {
  coldStorageId: string;
  farmerId: string;
  voucherNumber: number;
  dateOfSubmission: string;
  remarks: string;
  orderDetails: {
    variety: string;
    bagSizes: {
      size: string;
      quantity: {
        initialQuantity: number;
        currentQuantity: number;
      };
    }[];
    location: string;
  }[];
}

interface BagUpdate {
  size: string;
  quantityToRemove: number;
}

interface OutgoingOrderDetail {
  orderId: string;
  variety: string;
  bagUpdates: BagUpdate[];
}

interface CreateOutgoingOrderPayload {
  orders: OutgoingOrderDetail[];
  remarks: string;
}

interface CreateFarmerPayload {
  accNo: string;
  name: string;
  address: string;
  mobileNumber: string;
  coldStorageId: string;
}

interface UpdateProfilePayload {
  name: string;
  personalAddress: string;
  mobileNumber: string;
  coldStorageName: string;
  coldStorageAddress: string;
  coldStorageContactNumber: string;
  capacity?: number;
  imageUrl: string;
  preferences: {
    bagSizes: string[];
  };
  isMobile: boolean;
  password?: string | undefined;
}

interface UpdateIncomingOrderPayload {
  remarks: string;
  dateOfSubmission: string;
  fulfilled: boolean;
  orderDetails: {
    variety: string;
    location: string;
    bagSizes: {
      size: string;
      quantity: {
        initialQuantity: number;
        currentQuantity: number;
      };
    }[];
  }[];
}

interface UploadProfilePhotoResponse {
  status: string;
  data: {
    url: string;
  };
  message?: string;
}

interface DeleteProfilePhotoPayload {
  publicId: string;
}

interface DeleteProfilePhotoResponse {
  status: string;
  message?: string;
}

interface TopFarmer {
  farmerId: string;
  farmerName: string;
  totalBags: number;
  bagSummary: {
    [key: string]: number;
  };
}

interface CountResponse {
  success: boolean;
  currentCount: number;
  message?: string;
  error?: string;
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

  searchByVariety: async (params: SearchByVarietyParams, token: string) => {
    const response = await axios.post(
      `${BASE_URL}/api/store-admin/orders/search-by-variety`,
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
  },

  getColdStorageSummary: async (token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/store-admin/cold-storage-summary`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  createIncomingOrder: async (payload: CreateOrderPayload, token: string) => {
    const response = await axios.post(
      `${BASE_URL}/api/store-admin/orders`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  searchFarmers: async (coldStorageId: string, query: string, token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/store-admin/${coldStorageId}/farmers/search`,
      {
        params: { query },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  getVarieties: async (token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/store-admin/varieties`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  createOutgoingOrder: async (farmerId: string, payload: CreateOutgoingOrderPayload, token: string) => {
    const response = await axios.post(
      `${BASE_URL}/api/store-admin/farmers/${farmerId}/outgoing`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  getFarmerIncomingOrders: async (farmerId: string, token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/store-admin/farmers/${farmerId}/orders/incoming`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  quickRegister: async (credentials: QuickRegisterCredentials, token?: string) => {
    const formData = new URLSearchParams();
    formData.append('name', credentials.name);
    formData.append('address', credentials.address);
    formData.append('mobileNumber', credentials.mobileNumber);
    formData.append('password', credentials.password);
    formData.append('imageUrl', credentials.imageUrl);
    formData.append('farmerId', credentials.farmerId);

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(
      `${BASE_URL}/api/store-admin/quick-register`,
      formData,
      { headers }
    );
    return response.data;
  },

  createFarmer: async (payload: CreateFarmerPayload, token: string) => {
    const response = await axios.post(
      `${BASE_URL}/api/store-admin/farmers`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  checkFarmerId: async (token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/store-admin/farmerid/check`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  getFarmerOrders: async (farmerId: string, token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/store-admin/farmers/${farmerId}/orders`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  updateProfile: async (payload: UpdateProfilePayload, token: string) => {
    const response = await axios.put(
      `${BASE_URL}/api/store-admin/profile`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  updateIncomingOrder: async (orderId: string, payload: UpdateIncomingOrderPayload, token: string) => {
    const response = await axios.put(
      `${BASE_URL}/api/store-admin/incoming-orders/${orderId}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  uploadProfilePhoto: async (image: File) => {
    const formData = new FormData();
    formData.append('image', image);

    const response = await axios.post<UploadProfilePhotoResponse>(
      `${BASE_URL}/api/store-admin/upload-profile-photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    return response.data;
  },

  deleteProfilePhoto: async (payload: DeleteProfilePhotoPayload) => {
    const response = await axios.delete<DeleteProfilePhotoResponse>(
      `${BASE_URL}/api/store-admin/delete-profile-photo`,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        data: payload
      }
    );
    return response.data;
  },

  getTopFarmers: async (token: string) => {
    const response = await axios.get<{
      status: string;
      message: string;
      data: TopFarmer[];
    }>(
      `${BASE_URL}/api/store-admin/top-farmers`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  incrementCount: async () => {
    const response = await axios.post<CountResponse>(
      `${BASE_URL}/api/count/increment`,
      {},
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  getCount: async () => {
    const response = await axios.get<CountResponse>(
      `${BASE_URL}/api/count`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }
};