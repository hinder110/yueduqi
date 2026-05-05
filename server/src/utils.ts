import axios, { AxiosInstance } from 'axios';

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36';

export const httpClient: AxiosInstance = axios.create({
  timeout: 15000,
  headers: {
    'User-Agent': USER_AGENT,
  },
});
