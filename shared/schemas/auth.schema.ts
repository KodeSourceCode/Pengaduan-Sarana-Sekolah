import { z } from "zod";

export const loginSchema = z.object({
  nis: z.string().min(1, "NIS wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z.object({
  nis: z.string().min(1, "NIS wajib diisi"),
  nama: z.string().min(1, "Nama wajib diisi"),
  email: z.email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  kelas: z.string().min(2, "Kelas minimal 2 karakter"),
});


const passwordCheckShema = registerSchema
  .extend({ confirmPassword: z.string() })
  
export const registerClientSchema = passwordCheckShema
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password do not match",
    path: ["confirmPassword"],
    // run if password & confirmPassword are valid
    when(payload) { 
      return passwordCheckShema 
        .pick({ password: true, confirmPassword: true }) 
        .safeParse(payload.value).success; 
    },  
  });
