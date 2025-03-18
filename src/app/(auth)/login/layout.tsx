import { ToastProvider } from "@/providers/ToastProvider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex items-center justify-center h-screen">{children}</div>
    </ToastProvider>
  );
}
