import { z } from 'zod';

const ve = (key: string, params?: Record<string, unknown>) =>
  params ? JSON.stringify({ key, ...params }) : key;

export const createWorkspaceSchema = z.object({
  title: z
    .string()
    .min(3, ve('validation.min_length', { min: 3 }))
    .max(100, ve('validation.max_length', { max: 100 })),
  slug: z
    .string()
    .min(3, ve('validation.min_length', { min: 3 }))
    .max(50, ve('validation.max_length', { max: 50 }))
    .regex(/^[a-z0-9-]+$/, ve('validation.slug_format')),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial();

export type CreateWorkspaceDto = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceDto = z.infer<typeof updateWorkspaceSchema>;

export const createClientSchema = z.object({
  firstName: z
    .string()
    .min(1, ve('validation.required'))
    .max(100, ve('validation.max_length', { max: 100 })),
  lastName: z
    .string()
    .min(1, ve('validation.required'))
    .max(100, ve('validation.max_length', { max: 100 })),
  phoneNumber: z
    .string()
    .max(30, ve('validation.max_length', { max: 30 }))
    .optional(),
  instagram: z
    .string()
    .max(100, ve('validation.max_length', { max: 100 }))
    .optional(),
  telegram: z
    .string()
    .max(100, ve('validation.max_length', { max: 100 }))
    .optional(),
  birthday: z.iso.date({ error: ve('validation.invalid_date') }).optional(),
  notes: z
    .string()
    .max(1000, ve('validation.max_length', { max: 1000 }))
    .optional(),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientDto = z.infer<typeof createClientSchema>;
export type UpdateClientDto = z.infer<typeof updateClientSchema>;

export const listClientsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
  search: z.string().optional(),
});

export type ListClientsQueryDto = z.infer<typeof listClientsQuerySchema>;
