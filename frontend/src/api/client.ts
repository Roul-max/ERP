import axios from "axios";

export const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "")
  .trim()
  .replace(/\/$/, "");

const client = axios.create({
  // If `VITE_API_URL` is unset/empty, use a relative URL so Vite can proxy `/api/*` in dev.
  baseURL: `${API_ORIGIN}/api/v1` || "/api/v1",
});

let requestCount = 0;

const showLoading = () => {
  if (requestCount === 0) {
    window.dispatchEvent(
      new CustomEvent("ui-loading", { detail: true })
    );
  }
  requestCount++;
};

const hideLoading = () => {
  requestCount--;
  if (requestCount <= 0) {
    requestCount = 0;
    window.dispatchEvent(
      new CustomEvent("ui-loading", { detail: false })
    );
  }
};

const showError = (message: string) => {
  window.dispatchEvent(
    new CustomEvent("ui-error", { detail: message })
  );
};

client.interceptors.request.use(
  (config) => {
    const silent = (config as any).ui?.silent === true;
    if (!silent) {
      showLoading();
      (config as any).__uiLoadingShown = true;
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // If request interceptor failed after showLoading, attempt to hide.
    if ((error?.config as any)?.__uiLoadingShown) hideLoading();
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => {
    if ((response.config as any).__uiLoadingShown) hideLoading();
    return response;
  },
  (error) => {
    if ((error?.config as any)?.__uiLoadingShown) hideLoading();

    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    showError(message);

    return Promise.reject(error);
  }
);

export default client;
