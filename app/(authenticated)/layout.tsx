"use client";

import React from "react";
import { AuthProvider } from "../../context/AuthContext";
import { AuthGuard } from "../AuthGaurd";
import { Toaster } from "sonner";
import { MainMenubar } from "@/components/Menubar";
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <MainMenubar />
        {children}
      </AuthGuard>
    </AuthProvider>
  );
}
