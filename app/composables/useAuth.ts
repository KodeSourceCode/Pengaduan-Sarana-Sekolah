export const useAuth = () => {
  const { fetch: fetchSession } = useUserSession();

  const login = async (body: LoginRequest) => {
    try {
      const res = await $fetch<ApiResponse<AuthUser>>("/api/auth/login", {
        method: "POST",
        body,
      });

      // Sinkronkan session dari server ke client
      await fetchSession();
      await navigateTo("/");

      return res;
    } catch (error: any) {
      throw error.data?.message ?? "Terjadi kesalahan saat login";
    }
  };

  return {
    login,
  };
};
