import { z } from 'zod';

const envSchema = z.object({
 NEXT_PUBLIC_SITE_URL: z.string().url().optional().default('https://hashtagweb3.com'),
 NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('production'),
});

export const env = envSchema.parse(process.env);
