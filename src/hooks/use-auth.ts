import { useEffect, useState } from "react";
import type { SiaUser } from "@/lib/sia-auth";
import { getUser } from "@/lib/sia-auth";

export const useAuth = () => {
  const [user, setUser] = useState<SiaUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setLoading(false);

    // Re-check when window gains focus (e.g. after login in same tab)
    const onFocus = () => {
      setUser(getUser());
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return { user, loading };
};
