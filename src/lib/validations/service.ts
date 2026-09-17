import { z } from 'zod';
import { SERVICE_CATEGORIES } from '@/lib/service-categories';

export const createServiceSchema = z.object({
    title: z.string().min(1, 'Please enter the service name.').max(120),
    description: z.string().min(1, 'Please fill in the details.').max(2000),
    mode: z.enum(['remote', 'onsite']).default('remote'),
    category: z.enum(SERVICE_CATEGORIES).default('other'),
    priceBaht: z.coerce.number().positive('The price must be greater than 0').max(1_000_000),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;