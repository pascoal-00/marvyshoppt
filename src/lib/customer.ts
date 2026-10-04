import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Indica o teu nome completo.").max(120),
  phone: z
    .string()
    .trim()
    .min(6, "Indica um telefone válido (com indicativo).")
    .max(30)
    .regex(/^[+0-9 ()-]+$/, "O telefone só pode ter números, espaços e + ( ) -"),
  email: z.string().trim().email("Indica um email válido.").max(160),
  addressLine: z.string().trim().min(5, "Indica a rua, número e andar.").max(200),
  postalCode: z.string().trim().min(4, "Indica o código postal.").max(20),
  city: z.string().trim().min(2, "Indica a localidade.").max(80),
  country: z.string().trim().min(2).max(60),
  note: z.string().trim().max(500).optional(),
});

export type CustomerInfo = z.infer<typeof customerSchema>;

export const EMPTY_CUSTOMER: CustomerInfo = {
  name: "",
  phone: "",
  email: "",
  addressLine: "",
  postalCode: "",
  city: "",
  country: "",
  note: "",
};

export const CUSTOMER_STORAGE_KEY = "mshop.customer.v1";
