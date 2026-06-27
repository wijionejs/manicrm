import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, digits, and hyphens'),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial();

export type CreateWorkspaceDto = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceDto = z.infer<typeof updateWorkspaceSchema>;
