"use client";

import { redirect } from "next/navigation";

import { useSession, signOut } from "@/lib/auth/client";
import { getUserIdentity } from "@/lib/utils";

type UseUserResult = {
  user: Identity | null;
  loading: boolean;
  onSignOut: () => Promise<void>;
};

export function useUser(): UseUserResult {
  const { data, isPending } = useSession();

  const onSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          redirect("/");
        },
      },
    });
  };

  if (!data?.user) {
    return { loading: isPending, user: null, onSignOut };
  }

  return { loading: isPending, user: getUserIdentity(data), onSignOut };
}
