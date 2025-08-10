// client.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8547/api/ConsumerApi/v1/Restaurant/TheHungryUnicorn',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
});

export function setToken(token: string) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  localStorage.setItem('apiToken', token);
}

export function clearToken() {
  delete api.defaults.headers.common['Authorization'];
  localStorage.removeItem('apiToken');
}

// load saved token only if it exists
const saved = localStorage.getItem('apiToken');
if (saved) {
  api.defaults.headers.common['Authorization'] = `Bearer ${saved}`;
}
