import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your machine's local IP address for physical device testing
// Example: 'http://192.168.1.10:5000/api'
export const BASE_URL = 'https://clint-crm-server.onrender.com/api'; 
export const SOCKET_URL = 'https://clint-crm-server.onrender.com';


const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
