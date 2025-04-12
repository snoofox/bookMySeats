"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // Assuming this is your context hook
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function Navbar() {
  const { user, logout, isLoading } = useAuth();

  const getInitials = (name: string | undefined) => {
    if (!name) return "??";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Ticket className="h-6 w-6 text-purple-600" />
          <span className="text-xl font-semibold">BookMySeats</span>
        </Link>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-20" />
            </>
          ) : user ? (
            <div className="flex items-center gap-5">
              <Avatar>
                <AvatarImage
                  src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${user.username}`}
                  alt={`${user.username}'s avatar`}
                />
                <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
              </Avatar>
              <Button onClick={logout} variant={"outline"}>
                Logout
              </Button>
            </div>
          ) : (
            <nav className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="default"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Register
                </Button>
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
