import { z } from "zod";

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const optionalUtm = z.string().trim().max(200).transform((value) => {
  return value === "" ? null : value;
});

export const linkFormSchema = z.object({
  destinationUrl: z
    .string()
    .trim()
    .min(1, "Destination URL is required.")
    .refine(isHttpUrl, "Enter a valid http or https URL."),
  utmSource: optionalUtm.default(""),
  utmMedium: optionalUtm.default(""),
  utmCampaign: optionalUtm.default(""),
  utmTerm: optionalUtm.default(""),
  utmContent: optionalUtm.default(""),
  isActive: z.boolean().default(true),
});

export type LinkFormValues = z.infer<typeof linkFormSchema>;

export function parseLinkFormData(formData: FormData) {
  const isActiveRaw = formData.get("isActive");

  return linkFormSchema.safeParse({
    destinationUrl: formData.get("destinationUrl") ?? "",
    utmSource: formData.get("utmSource") ?? "",
    utmMedium: formData.get("utmMedium") ?? "",
    utmCampaign: formData.get("utmCampaign") ?? "",
    utmTerm: formData.get("utmTerm") ?? "",
    utmContent: formData.get("utmContent") ?? "",
    isActive:
      isActiveRaw === null
        ? true
        : isActiveRaw === "true" || isActiveRaw === "on",
  });
}
