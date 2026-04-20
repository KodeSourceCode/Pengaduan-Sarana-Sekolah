import type { ApiResponse } from "~~/shared/types/api";

export default defineEventHandler(async (event) => {
  const user = await requireSiswa(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "id aspirasi wajib diisi",
    });
  }

  const existing = await prisma.aspirasi.findUnique({
    where: { id },
  });

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: "Aspirasi tidak ditemukan",
    });
  }

  if (existing.userId !== user.id) {
    throw createError({
      statusCode: 403,
      message: "Forbidden",
    });
  }

  if (existing.status !== "MENUNGGU") {
    throw createError({
      statusCode: 403,
      message: "Aspirasi hanya bisa dihapus saat masih menunggu",
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.umpanBalik.deleteMany({
      where: { aspirasiId: id },
    });

    await tx.progressPerbaikan.deleteMany({
      where: { aspirasiId: id },
    });

    await tx.aspirasi.delete({
      where: { id },
    });
  });

  return {
    success: true,
    message: "Aspirasi berhasil dihapus",
    data: null,
  } satisfies ApiResponse<null>;
});
