"use client";

import { useState } from "react";
import LoginPage from "./components/signin";  
import SignupPage from "./components/signup";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted">
      {isLogin ? <LoginPage /> : <SignupPage />}

      <div className="mt-4">
        {isLogin ? (
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 text-blue-600"
              onClick={() => setIsLogin(false)}
            >
              Sign up
            </Button>
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Button
              variant="link"
              className="p-0 text-blue-600"
              onClick={() => setIsLogin(true)}
            >
              Login
            </Button>
          </p>
        )}
      </div>
    </div>
  );
}
