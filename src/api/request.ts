import axios from "axios";
import router from "@/router";

const BASE_URL = process.env.NODE_HOST;
const LS_TOKEN_KEY = "music_authToken";

axios.defaults.timeout = 30000; // 超时时间设置（视频流需更长）
axios.defaults.withCredentials = true; // true允许跨域
axios.defaults.baseURL = BASE_URL;
// Content-Type 响应头
axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";

// 请求拦截器：自动注入 Authorization 头
axios.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem(LS_TOKEN_KEY);
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
  } catch { /* localStorage 不可用时跳过 */ }
  return config;
});

// 响应拦截器
axios.interceptors.response.use(
  (response) => {
    // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
    // 否则的话抛出错误
    if (response.status === 200) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(response);
    }
  },
  // 服务器状态码不是2开头的的情况
  (error) => {
    if (!error.response) {
      // 网络异常 / 请求超时
      return Promise.reject(error);
    }
    switch (error.response.status) {
      // 401: 未登录或 token 失效
      case 401:
        clearAuthAndRedirect();
        break;
      case 403:
        setTimeout(() => clearAuthAndRedirect(), 1000);
        break;
      // 404 请求不存在
      case 404:
        break;
    }
    return Promise.reject(error.response);
  }
);

export function getBaseURL() {
  return BASE_URL;
}

/** 清空本地登录态并跳到登录页（避免循环 import store） */
function clearAuthAndRedirect() {
  try {
    localStorage.removeItem(LS_TOKEN_KEY);
    localStorage.removeItem("music_userId");
    localStorage.removeItem("music_username");
    localStorage.removeItem("music_userPic");
  } catch { /* ignore */ }
  // 通知应用层做 store 清理 + 断开 chat
  try {
    window.dispatchEvent(new CustomEvent("auth:expired"));
  } catch { /* ignore */ }
  if (router.currentRoute.value.path !== "/sign-in") {
    router.replace({ path: "/sign-in" });
  }
}

/**
 * 封装get方法
 * @param url
 * @param data
 * @returns {Promise}
 */
export function get(url, params?: object) {
  return new Promise((resolve, reject) => {
    axios.get(url, params).then(
      (response) => resolve(response.data),
      (error) => reject(error)
    );
  });
}

/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export function post(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.post(url, data).then(
      (response) => resolve(response.data),
      (error) => reject(error)
    );
  });
}

/**
 * 封装delete请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export function deletes(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.delete(url, data).then(
      (response) => resolve(response.data),
      (error) => reject(error)
    );
  });
}

/**
 * 封装put请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export function put(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.put(url, data).then(
      (response) => resolve(response.data),
      (error) => reject(error)
    );
  });
}

/**
 * 封装 multipart/form-data 上传
 * 必须显式覆盖默认的 application/x-www-form-urlencoded
 */
export function postForm(url, formData: FormData, onProgress?: (percent: number) => void) {
  return new Promise((resolve, reject) => {
    axios
      .post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      })
      .then(
        (response) => resolve(response.data),
        (error) => reject(error)
      );
  });
}
