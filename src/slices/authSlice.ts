import { createSlice } from "@reduxjs/toolkit";
import { Admin } from "../utils/types";

const isWebView = () => {
  return navigator.userAgent.includes('ReactNative') || 
         (window as any).ReactNativeWebView !== undefined;
};

const getStoredAdminInfo = () => {
  try {
    const stored = localStorage.getItem("adminInfo");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error parsing stored admin info:', error);
    return null;
  }
};

const setStoredAdminInfo = (adminInfo: Admin) => {
  try {
    localStorage.setItem("adminInfo", JSON.stringify(adminInfo));
    
    if (isWebView() && (window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({
        type: 'SAVE_AUTH',
        data: adminInfo
      }));
    }
  } catch (error) {
    console.error('Error storing admin info:', error);
  }
};

const removeStoredAdminInfo = () => {
  try {
    localStorage.removeItem("adminInfo");
    
    if (isWebView() && (window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({
        type: 'REMOVE_AUTH'
      }));
    }
  } catch (error) {
    console.error('Error removing admin info:', error);
  }
};

const initialState: { adminInfo: Admin | null } = {
  adminInfo: getStoredAdminInfo(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.adminInfo = action.payload;
      setStoredAdminInfo(action.payload);
    },
    logout: (state) => {
      state.adminInfo = null;
      removeStoredAdminInfo();
    },
    restoreAuth: (state, action) => {
      state.adminInfo = action.payload;
      localStorage.setItem("adminInfo", JSON.stringify(action.payload));
    },
  },
});

export const { setCredentials, logout, restoreAuth } = authSlice.actions;

export default authSlice.reducer;