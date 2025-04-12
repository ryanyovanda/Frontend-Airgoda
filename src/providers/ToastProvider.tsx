"use client";

import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Toast, ToastToggle } from "flowbite-react";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ToastContextProps {
  showToast: (message: string, type?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const toastData = { message, type };
    setToast(toastData);
    sessionStorage.setItem("persistent-toast", JSON.stringify(toastData));
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    const savedToast = sessionStorage.getItem("persistent-toast");
    if (savedToast) {
      const { message, type } = JSON.parse(savedToast);
      setToast({ message, type });
      sessionStorage.removeItem("persistent-toast");
      setTimeout(() => setToast(null), 5000);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
         <Toast
        className={`flex items-center justify-between border-l-4 shadow-md px-4 py-3 rounded-md min-w-[320px] max-w-md ${
          toast.type === "success"
            ? "border-purple-500 bg-purple-100 text-purple-800"
            : "border-red-500 bg-red-100 text-red-800"
        }`}
      >
        <div className="flex items-center gap-3">
          <FontAwesomeIcon
            icon={toast.type === "success" ? faCheck : faXmark}
            className={`h-5 w-5 ${toast.type === "success" ? "text-purple-500" : "text-red-500"}`}
          />
          <div className="text-sm font-medium">{toast.message}</div>
        </div>

        <ToastToggle className="ml-4 flex items-center justify-center h-6 w-6 rounded-md bg-white text-gray-500" />
      </Toast>


        </div>
      )}
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
