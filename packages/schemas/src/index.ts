import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  title: z.string().min(3).max(100),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, digits, and hyphens'),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial();

export type CreateWorkspaceDto = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceDto = z.infer<typeof updateWorkspaceSchema>;

export const createClientSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phoneNumber: z.string().max(30).optional(),
  instagram: z.string().max(100).optional(),
  telegram: z.string().max(100).optional(),
  birthday: z.iso.date().optional(),
  notes: z.string().max(1000).optional(),
  isBlacklisted: z.boolean().optional().default(false),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientDto = z.infer<typeof createClientSchema>;
export type UpdateClientDto = z.infer<typeof updateClientSchema>;
