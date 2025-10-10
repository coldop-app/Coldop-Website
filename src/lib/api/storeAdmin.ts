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
    defaults?: {
      generation?: string;
      rouging?: string;
      tuberType?: string;
      grader?: string;
    };
  };
}

interface DaybookOrdersParams {
  type: "all" | "incoming" | "outgoing";
  sortBy: "latest" | "oldest";
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

interface FilterIncomingOrdersParams {
  variety?: string;
  generation?: string;
  rouging?: string;
  tuberType?: string;
  grader?: string;
  weighedStatus?: boolean;
  bagType?: string;
  page?: number;
  limit?: number;
}

interface FilterOrdersParams {
  variety?: string;
  generation?: string;
  rouging?: string;
  tuberType?: string;
  grader?: string;
  weighedStatus?: boolean;
  bagType?: string;
  fulfilled?: boolean;
  farmerId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

interface GatePass {
  type: "RECEIPT" | "DELIVERY";
  gatePassNumber: number;
}

interface BagQuantity {
  initialQuantity: number;
  currentQuantity: number;
}

interface BagSize {
  size: string;
  quantity: BagQuantity;
  location: string;
  approxWeight?: number;
}

interface OrderDetail {
  variety: string;
  bagSizes: BagSize[];
}

interface FarmerInfo {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
}

interface FilteredOrder {
  _id: string;
  coldStorageId: string;
  farmerId: string;
  gatePass: GatePass;
  generation: string;
  rouging: string;
  tuberType: string;
  grader: string;
  weighedStatus: boolean;
  approxWeight: string;
  bagType: string;
  dateOfSubmission: string;
  fulfilled: boolean;
  remarks: string;
  currentStockAtThatTime: number;
  orderDetails: OrderDetail[];
  createdAt: string;
  updatedAt: string;
  farmerInfo: FarmerInfo;
}

interface FilterOrdersResponse {
  status: string;
  message: string;
  data: FilteredOrder[];
}

export interface CreateOrderPayload {
  coldStorageId: string;
  farmerId: string | null;
  dateOfSubmission?: string | null;
  remarks?: string | null;
  generation?: string | null;
  rouging?: string | null;
  tuberType?: string | null;
  grader?: string | null;
  weighedStatus?: boolean | null;
  approxWeight?: string | null;
  bagType?: string | null;
  orderDetails?: {
    variety: string;
    bagSizes: {
      size: string;
      quantity: {
        initialQuantity: number;
        currentQuantity: number;
      };
      location: string;
      approxWeight?: number;
    }[];
  }[] | null;
  isNullVoucher?: boolean;
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

export interface CreateOutgoingOrderPayload {
  generation: string;
  rouging: string;
  tuberType: string;
  grader: string;
  weighedStatus: boolean;
  approxWeight: string;
  bagType: string;
  remarks: string;
  orders: OutgoingOrderDetail[];
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
    defaults?: {
      generation?: string;
      rouging?: string;
      tuberType?: string;
      grader?: string;
    };
  };
  isMobile: boolean;
  password?: string | undefined;
}

interface UpdateIncomingOrderPayload {
  remarks: string;
  dateOfSubmission: string;
  generation: string;
  rouging: string;
  tuberType: string;
  grader: string;
  weighedStatus: boolean;
  approxWeight: string;
  bagType: string;
  orderDetails: {
    variety: string;
    bagSizes: {
      size: string;
      quantity: {
        initialQuantity: number;
        currentQuantity: number;
      };
      location: string;
      approxWeight?: number;
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

interface Farmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  farmerId: string;
  createdAt: string;
}

interface FarmersResponse {
  status: string;
  populatedFarmers: Farmer[];
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

interface ReceiptNumberResponse {
  status: string;
  receiptNumber: number;
}

interface BhattiDataResponse {
  status: string;
  message: string;
  data: {
    grader: string[];
    generation: string[];
    rouging: string[];
  };
}

interface CustomAnalyticsParams {
  variety?: string;
  grader?: string;
  generation?: string;
  rouging?: string;
  tuberType?: string;
  weighedStatus?: boolean;
  bagType?: string;
}

interface SizeData {
  size: string;
  initialQuantity: number;
  currentQuantity: number;
  quantityRemoved: number;
}

interface StockSummary {
  variety: string;
  sizes: SizeData[];
}

interface CustomAnalyticsTotals {
  totalBags: number;
  totalCurrentBags: number;
  totalRemovedBags: number;
}

interface OrderCounts {
  totalIncomingOrders: number;
  totalOutgoingOrders: number;
  totalOrders: number;
}

interface Distributions {
  varietyDistribution: Record<string, number>;
  generationDistribution: Record<string, number>;
  rougingDistribution: Record<string, number>;
  graderDistribution: Record<string, number>;
  bagSizeDistribution: Record<string, number>;
  tuberTypeDistribution: Record<string, number>;
  bagTypeDistribution: Record<string, number>;
  weighedStatusDistribution: Record<string, number>;
  varietyAnalysis: {
    byGeneration: Record<string, Record<string, number>>;
    byRouging: Record<string, Record<string, number>>;
    byGrader: Record<string, Record<string, number>>;
  };
  generationAnalysis: {
    byVariety: Record<string, Record<string, number>>;
    byRouging: Record<string, Record<string, number>>;
    byGrader: Record<string, Record<string, number>>;
  };
  rougingAnalysis: {
    byVariety: Record<string, Record<string, number>>;
    byGeneration: Record<string, Record<string, number>>;
    byGrader: Record<string, Record<string, number>>;
  };
  graderAnalysis: {
    byVariety: Record<string, Record<string, number>>;
    byGeneration: Record<string, Record<string, number>>;
    byRouging: Record<string, Record<string, number>>;
  };
  bagSizeAnalysis: {
    byVariety: Record<string, Record<string, number>>;
    byGeneration: Record<string, Record<string, number>>;
    byRouging: Record<string, Record<string, number>>;
    byGrader: Record<string, Record<string, number>>;
  };
  tuberTypeAnalysis: {
    byVariety: Record<string, Record<string, number>>;
    byGeneration: Record<string, Record<string, number>>;
    byRouging: Record<string, Record<string, number>>;
    byGrader: Record<string, Record<string, number>>;
  };
  bagTypeAnalysis: {
    byVariety: Record<string, Record<string, number>>;
    byGeneration: Record<string, Record<string, number>>;
    byRouging: Record<string, Record<string, number>>;
    byGrader: Record<string, Record<string, number>>;
  };
  weighedStatusAnalysis: {
    byVariety: Record<string, Record<string, number>>;
    byGeneration: Record<string, Record<string, number>>;
    byRouging: Record<string, Record<string, number>>;
    byGrader: Record<string, Record<string, number>>;
    byBagType: Record<string, Record<string, number>>;
    byTuberType: Record<string, Record<string, number>>;
  };
  summary: {
    totalOrders: number;
    totalOutgoingOrders: number;
    uniqueVarieties: number;
    uniqueGenerations: number;
    uniqueRougings: number;
    uniqueGraders: number;
    uniqueBagSizes: number;
    uniqueTuberTypes: number;
    uniqueBagTypes: number;
    weighedStatusCounts: {
      weighed: number;
      unweighed: number;
    };
  };
}

interface CustomAnalyticsFilters {
  variety?: string;
  generation?: string;
  rouging?: string;
  tuberType?: string;
  grader?: string;
  weighedStatus?: string;
  bagType?: string;
}

interface CustomAnalyticsResponse {
  status: string;
  message: string;
  data: {
    stockSummary: StockSummary[];
    totals: CustomAnalyticsTotals;
    orderCounts: OrderCounts;
    distributions: Distributions;
    filters: CustomAnalyticsFilters;
  };
}

export const storeAdminApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await axios.post(
      `${BASE_URL}/api/store-admin/login`,
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
        },
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
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  sendOtp: async (mobileNumber: string) => {
    const formData = new URLSearchParams();
    formData.append("mobileNumber", mobileNumber);

    const response = await axios.post(
      `${BASE_URL}/api/store-admin/send-otp`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  },

  verifyOtp: async (mobileNumber: string, enteredOtp: string) => {
    const formData = new URLSearchParams();
    formData.append("mobileNumber", mobileNumber);
    formData.append("enteredOtp", enteredOtp);

    const response = await axios.post(
      `${BASE_URL}/api/store-admin/verify-mobile`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  },

  resendOtp: async (mobileNumber: string) => {
    const formData = new URLSearchParams();
    formData.append("mobileNumber", mobileNumber);

    const response = await axios.post(
      `${BASE_URL}/api/store-admin/resend-otp`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  },

  editMobile: async (mobileNumber: string) => {
    const formData = new URLSearchParams();
    formData.append("mobileNumber", mobileNumber);

    const response = await axios.post(
      `${BASE_URL}/api/store-admin/edit-mobile`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
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
          Authorization: `Bearer ${token}`,
        },
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
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  getFarmers: async (token: string): Promise<FarmersResponse> => {
    const response = await axios.get<FarmersResponse>(
      `${BASE_URL}/api/store-admin/farmers`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  getFarmerStockSummary: async (farmerId: string, token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/store-admin/farmers/${farmerId}/stock-summary`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  getColdStorageSummary: async (token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/store-admin/cold-storage-summary`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  searchFarmers: async (
    coldStorageId: string,
    query: string,
    token: string
  ) => {
    const response = await axios.get(
      `${BASE_URL}/api/store-admin/${coldStorageId}/farmers/search`,
      {
        params: { query },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  getVarieties: async (token: string) => {
    const response = await axios.get(`${BASE_URL}/api/store-admin/varieties`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  createOutgoingOrder: async (
    farmerId: string,
    payload: CreateOutgoingOrderPayload,
    token: string
  ) => {
    const response = await axios.post(
      `${BASE_URL}/api/store-admin/farmers/${farmerId}/outgoing`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  getFarmerIncomingOrders: async (farmerId: string, token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/store-admin/farmers/${farmerId}/orders/incoming`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  filterFarmerIncomingOrders: async (
    farmerId: string,
    params: FilterIncomingOrdersParams,
    token: string
  ) => {
    const response = await axios.get(
      `${BASE_URL}/api/store-admin/farmers/${farmerId}/incoming-orders/filter`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  filterOrders: async (
    params: FilterOrdersParams,
    token: string
  ): Promise<FilterOrdersResponse> => {
    const response = await axios.get<FilterOrdersResponse>(
      `${BASE_URL}/api/store-admin/orders/filter`,
      {
        params,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  quickRegister: async (
    credentials: QuickRegisterCredentials,
    token?: string
  ) => {
    const formData = new URLSearchParams();
    formData.append("name", credentials.name);
    formData.append("address", credentials.address);
    formData.append("mobileNumber", credentials.mobileNumber);
    formData.append("password", credentials.password);
    formData.append("imageUrl", credentials.imageUrl);
    formData.append("farmerId", credentials.farmerId);

    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
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
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  checkFarmerId: async (token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/store-admin/farmerid/check`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  getFarmerOrders: async (farmerId: string, token: string) => {
    const response = await axios.get(
      `${BASE_URL}/api/store-admin/farmers/${farmerId}/orders`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  updateIncomingOrder: async (
    orderId: string,
    payload: UpdateIncomingOrderPayload,
    token: string
  ) => {
    const response = await axios.put(
      `${BASE_URL}/api/store-admin/incoming-orders/${orderId}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  uploadProfilePhoto: async (image: File) => {
    const formData = new FormData();
    formData.append("image", image);

    const response = await axios.post<UploadProfilePhotoResponse>(
      `${BASE_URL}/api/store-admin/upload-profile-photo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  deleteProfilePhoto: async (payload: DeleteProfilePhotoPayload) => {
    const response = await axios.delete<DeleteProfilePhotoResponse>(
      `${BASE_URL}/api/store-admin/delete-profile-photo`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        data: payload,
      }
    );
    return response.data;
  },

  getTopFarmers: async (token: string) => {
    const response = await axios.get<{
      status: string;
      message: string;
      data: TopFarmer[];
    }>(`${BASE_URL}/api/store-admin/top-farmers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  incrementCount: async () => {
    const response = await axios.post<CountResponse>(
      `${BASE_URL}/api/count/increment`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  getCount: async () => {
    const response = await axios.get<CountResponse>(`${BASE_URL}/api/count`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  getReceiptNumber: async (type: "incoming" | "outgoing", token: string) => {
    const response = await axios.get<ReceiptNumberResponse>(
      `${BASE_URL}/api/store-admin/receipt-number`,
      {
        params: { type },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  getBhattiData: async (token: string) => {
    const response = await axios.get<BhattiDataResponse>(
      `${BASE_URL}/api/store-admin/bhatti-data`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  customAnalytics: async (
    params: CustomAnalyticsParams,
    token: string
  ): Promise<CustomAnalyticsResponse> => {
    const response = await axios.get<CustomAnalyticsResponse>(
      `${BASE_URL}/api/store-admin/orders/custom-analytics`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },
};
