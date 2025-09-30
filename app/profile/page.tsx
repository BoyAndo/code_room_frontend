"use client";

import { useEffect } from "react";
import { useAuth, isStudent, isLandlord } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (isStudent(user)) {
        router.replace("/profile/student");
      } else if (isLandlord(user)) {
        router.replace("/profile/landlord");
      }
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-cream/20 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage mx-auto mb-4"></div>
        <p className="text-neutral-600">Redirigiendo a tu perfil...</p>
      </div>
    </div>
  );
}
