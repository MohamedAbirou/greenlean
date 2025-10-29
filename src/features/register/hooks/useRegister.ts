import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { isUsernameAvailable, registerUser } from "../api/registerApi";

export function useRegisterUser(onSuccess?: (userData: any) => void) {
  return useMutation({
    mutationFn: registerUser,
    onSuccess,
  });
}

export function useUsernameAvailability() {
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const check = (username: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setChecking(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await isUsernameAvailable(username);
        setUsernameAvailable(result);
      } catch (e) {
        setUsernameAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 500);
  };

  return { usernameAvailable, checking, check };
}
