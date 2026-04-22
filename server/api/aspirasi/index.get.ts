import { filterAspirasiSchema } from "#shared/schemas/aspirasi.schema";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const query = getQuery(event);

  const filter = filterAspirasiSchema.safeParse(query);

  const where: any = {};
  const toDayRange = (value: string) => {
    const startOfDay = new Date(`${value}T00:00:00.000Z`);
    const nextDay = new Date(startOfDay);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    return {
      gte: startOfDay,
      lt: nextDay,
    };
  };

  if (filter.success) {
    const judul = filter.data.judul?.trim();
    if (judul) {
      where.judul = {
        contains: judul,
        mode: "insensitive",
      };
    }

    if (filter.data.status) where.status = filter.data.status;
    if (filter.data.kategori) where.kategori = filter.data.kategori;
    if (filter.data.userId) where.userId = filter.data.userId;
    if (filter.data.createdAt)
      where.createdAt = toDayRange(filter.data.createdAt);
    if (filter.data.updatedAt)
      where.updatedAt = toDayRange(filter.data.updatedAt);
  }

  const data = await prisma.aspirasi.findMany({
    where,
    include: {
      user: {
        select: {
          nis: true,
          nama: true,
          kelas: true,
        },
      },
      _count: {
        select: {
          umpanBalik: true,
          progressPerbaikan: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    message: "Berhasil mengambil data aspirasi",
    data,
  } satisfies ApiResponse<typeof data>;
});
