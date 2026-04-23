import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../services/auth";
import { useAuth } from "@/lib/auth";

export function useLoginMutation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const authLogin = useAuth((state) => state.login);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      authLogin(data.user, data.token);
      navigate(searchParams.get("next") || "/");
    },
  });
}
