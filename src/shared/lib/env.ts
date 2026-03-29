import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  EXPO_PUBLIC_REVENUECAT_API_KEY: z.string().optional(),
});

function getEnv() {
  const raw = {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_REVENUECAT_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY,
  };

  const parsed = envSchema.safeParse(raw);

  if (!parsed.success) {
    console.warn('Missing environment variables:', parsed.error.flatten().fieldErrors);
    return raw as z.infer<typeof envSchema>;
  }

  return parsed.data;
}

export const Env = getEnv();
