export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const data = await prisma.user.findMany({
    where: { role: "SISWA" },
    select: {
      id: true,
      nis: true,
      nama: true,
      email: true,
      kelas: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    message: "Berhasil mengambil data siswa",
    data,
  } satisfies ApiResponse<typeof data>;
});
