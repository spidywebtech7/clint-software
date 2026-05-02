import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your machine's local IP address for physical device testing
// Example: 'http://192.168.1.10:5000/api'
export const BASE_URL = 'http://10.116.81.138:5000/api'; 
export const SOCKET_URL = 'http://10.116.81.138:5000';


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
