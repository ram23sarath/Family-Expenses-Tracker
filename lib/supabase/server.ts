import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookieList: Parameters<SetAllCookies>[0]) {
          try {
            cookieList.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // ignore set attempts in read-only server contexts
          }
        }
      }
    }
  );
};
