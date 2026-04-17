export type ToastType = "success" | "info" | "warning" | "error";

export const toast = (type: ToastType, message: string) => {
  window.dispatchEvent(new CustomEvent("ui-toast", { detail: { type, message } }));
};

export const toastSuccess = (message: string) => toast("success", message);
export const toastError = (message: string) => toast("error", message);
export const toastInfo = (message: string) => toast("info", message);
export const toastWarning = (message: string) => toast("warning", message);

