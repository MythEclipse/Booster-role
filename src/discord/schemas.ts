import { z } from "zod";

export const hexColorRegex = /^#[0-9A-F]{6}$/i;

export const claimOptions = z.object({
  name: z.string().min(3, "Role name must be 3-32 characters").max(32, "Role name must be 3-32 characters"),
  color: z.string().regex(hexColorRegex, "Color must be a hex value like #AABBCC").nullable().optional(),
  color2: z.string().regex(hexColorRegex, "Color must be a hex value like #AABBCC").nullable().optional(),
});

export const renameOptions = z.object({
  name: z.string().min(3, "Role name must be 3-32 characters").max(32, "Role name must be 3-32 characters"),
});

export const recolorOptions = z.object({
  color: z.string().regex(hexColorRegex, "Color must be a hex value like #AABBCC"),
  color2: z.string().regex(hexColorRegex, "Color must be a hex value like #AABBCC").nullable().optional(),
});

export type ClaimInput = z.infer<typeof claimOptions>;
export type RenameInput = z.infer<typeof renameOptions>;
export type RecolorInput = z.infer<typeof recolorOptions>;
