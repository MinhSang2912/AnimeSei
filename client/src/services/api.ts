import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5183/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đính kèm AccessToken vào Header của mọi Request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Biến quản lý trạng thái Refresh Token để tránh gọi lặp lại liên tục khi có nhiều Request bị 401 cùng lúc
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Tự động xin lại Token mới khi nhận lỗi 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu nhận lỗi 401 và chưa từng thử retry request này
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang trong quá trình refresh token, đưa request vào hàng chờ
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // Nếu không có Refresh Token trong bộ nhớ -> Ép buộc đăng nhập lại
        isRefreshing = false;
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Gọi API backend xin cấp mới Token
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          accessToken: accessToken || '',
          refreshToken: refreshToken,
        });

        if (refreshResponse.data?.success && refreshResponse.data?.data) {
          const newAuthData = refreshResponse.data.data;
          const newAccessToken = newAuthData.accessToken;
          const newRefreshToken = newAuthData.refreshToken;

          // Cập nhật Token mới vào localStorage
          localStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Cập nhật lại thông tin User trong localStorage
          const savedUserStr = localStorage.getItem('user');
          if (savedUserStr) {
            try {
              const savedUser = JSON.parse(savedUserStr);
              savedUser.accessToken = newAccessToken;
              if (newRefreshToken) savedUser.refreshToken = newRefreshToken;
              localStorage.setItem('user', JSON.stringify(savedUser));
            } catch (e) {
              console.error('Error updating user state with new token', e);
            }
          }

          // Gán Token mới vào request bị lỗi ban đầu và thực hiện lại
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return api(originalRequest);
        } else {
          throw new Error('Refresh token failed');
        }
      } catch (refreshErr) {
        // Refresh token đã bị quá hạn 7 ngày hoặc bị thu hồi -> Xóa session
        processQueue(refreshErr, null);
        localStorage.clear();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
