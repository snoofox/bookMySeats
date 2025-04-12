"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    if (!username.trim()) {
      setError("Username is required.");
      return false;
    }
    if (!password) {
      setError("Password is required.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      login(data.token, data.user);

      router.push("/");
    } catch (error: any) {
      console.error("Login failed:", error);
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navbar />
      <div className="container flex items-center justify-center py-16">
        <Card className="w-full max-w-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (
                      error?.includes("Username") ||
                      error?.includes("required")
                    )
                      setError(null);
                  }}
                  required
                  disabled={isLoading}
                  aria-describedby={
                    error?.includes("Username") || error?.includes("required")
                      ? "username-error"
                      : undefined
                  }
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (
                      error?.includes("Password") ||
                      error?.includes("required")
                    )
                      setError(null);
                  }}
                  required
                  disabled={isLoading}
                  aria-describedby={
                    error?.includes("Password") || error?.includes("required")
                      ? "password-error"
                      : undefined
                  }
                />
              </div>
              {error && (
                <p
                  id={
                    error.includes("Username")
                      ? "username-error"
                      : error.includes("Password")
                      ? "password-error"
                      : "form-error"
                  }
                  className="text-sm text-red-600 text-center"
                >
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className={`text-purple-600 hover:underline ${
                    isLoading ? "pointer-events-none opacity-50" : ""
                  }`}
                  aria-disabled={isLoading}
                  tabIndex={isLoading ? -1 : undefined}
                >
                  Register
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
