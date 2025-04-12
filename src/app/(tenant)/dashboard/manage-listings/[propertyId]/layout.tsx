import { ToastProvider } from "@/providers/ToastProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Airgoda | Property"
};
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div>{children}</div>
    </ToastProvider>
  );
}
