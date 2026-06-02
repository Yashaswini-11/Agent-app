"use client";

import { Menubar } from "@/components/ui/menubar";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";

export const MainMenubar = () => {
  const { token, logout } = useAuth();

  return (
    <Menubar className="w-full h-16 shadow-lg rounded-b-2xl px-4 bg-[#2563eb] flex items-center justify-between">
      <div className="flex items-center space-x-1">
        <div className="flex items-center -mt-2">
          <span className="text-white text-2xl">👥</span>
        </div>
        <div className="flex items-center">
          <h1 className="text-white text-xl font-bold">Agent App</h1>
        </div>
      </div>

      <Button
        onClick={logout}
        className="bg-white text-[#2563eb] hover:bg-black hover:text-white font-medium px-6 py-2 rounded-lg shadow transition-colors"
      >
        Logout
      </Button>
    </Menubar>
  );
};