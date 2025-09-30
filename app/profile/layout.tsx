"use client";

import { useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth, isStudent, isLandlord } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Solo redirigir si estamos en /profile (no en las subrutas)
    if (user && pathname === "/profile") {
      if (isStudent(user)) {
        router.replace("/profile/student");
      } else if (isLandlord(user)) {
        router.replace("/profile/landlord");
      }
    }
  }, [user, router, pathname]);

  return <ProtectedRoute>{children}</ProtectedRoute>;
}
