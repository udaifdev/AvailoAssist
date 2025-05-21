
import axios from 'axios';
import { logout, setBlocked } from '../slice/userSlice';
import store from '../store';
import { io } from 'socket.io-client';


export const adminAxios = axios.create({
  baseURL: 'http://localhost:8080/api', // Admin API base URL
  withCredentials: true,
});

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8081/api', // User-Worker base URL
  withCredentials: true,
});

// Socket.io
export const socket = io('http://localhost:8081', {
  withCredentials: true
});

 

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.message?.includes('blocked')) {
      store.dispatch(setBlocked());
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
