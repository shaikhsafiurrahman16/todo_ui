import axios from "axios";

axios.defaults.baseURL = "http://localhost:3001/api";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (res) => {
    if (res.data && res.data.redirect) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return res;
  },
  (err) => Promise.reject(err)
);

export default axios;
