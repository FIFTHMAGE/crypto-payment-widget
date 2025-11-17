/** Config Manager */
import { z } from 'zod';
const schema = z.object({ PORT: z.string(), DATABASE_URL: z.string().url() });
export const config = schema.parse(process.env);

