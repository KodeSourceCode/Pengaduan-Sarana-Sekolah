import { registerSiswaByAdminSchema } from "#shared/schemas/auth.schema";

const DEFAULT_SISWA_PASSWORD = "pengaduanSiswa#123";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const body = await readBody(event);
  const result = registerSiswaByAdminSchema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.message,
    });
  }

  const existingNis = await prisma.user.findUnique({
    where: { nis: result.data.nis },
  });

  if (existingNis) {
    throw createError({
      statusCode: 409,
      message: "NIS sudah terdaftar",
    });
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email: result.data.email },
  });

  if (existingEmail) {
    throw createError({
      statusCode: 409,
      message: "Email sudah terdaftar",
    });
  }

  const hashedPassword = await hashPassword(DEFAULT_SISWA_PASSWORD);

  const user = await prisma.user.create({
    data: {
      nis: result.data.nis,
      nama: result.data.nama,
      email: result.data.email,
      kelas: result.data.kelas,
      password: hashedPassword,
      role: "SISWA",
    },
  });

  return {
    success: true,
    message: "Akun siswa berhasil dibuat",
    data: {
      id: user.id,
      nis: user.nis,
      nama: user.nama,
      email: user.email,
      role: user.role,
      kelas: user.kelas,
      createdAt: user.createdAt.toISOString(),
    },
  } satisfies ApiResponse<AuthUser>;
});
