import { filterAspirasiSchema } from "#shared/schemas/aspirasi.schema";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const query = getQuery(event);

  const filter = filterAspirasiSchema.safeParse(query);

  const where: any = {};
  const getUtcMonthContext = (monthValue?: string) => {
    if (monthValue) {
      const [yearPart, monthPart] = monthValue.split("-");
      return {
        year: Number(yearPart),
        monthIndex: Number(monthPart) - 1,
      };
    }

    const now = new Date();
    return {
      year: now.getUTCFullYear(),
      monthIndex: now.getUTCMonth(),
    };
  };

  const toUtcMonthRange = (value: string) => {
    const { year, monthIndex } = getUtcMonthContext(value);

    const startOfMonth = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
    const startOfNextMonth = new Date(
      Date.UTC(year, monthIndex + 1, 1, 0, 0, 0, 0),
    );

    return {
      gte: startOfMonth,
      lt: startOfNextMonth,
    };
  };

  const toUtcDayRange = (day: number, monthValue?: string) => {
    const { year, monthIndex } = getUtcMonthContext(monthValue);

    const startOfDay = new Date(Date.UTC(year, monthIndex, day, 0, 0, 0, 0));
    const startOfNextDay = new Date(
      Date.UTC(year, monthIndex, day + 1, 0, 0, 0, 0),
    );

    return {
      gte: startOfDay,
      lt: startOfNextDay,
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
    if (filter.data.createdDay) {
      where.createdAt = toUtcDayRange(
        filter.data.createdDay,
        filter.data.createdMonth,
      );
    } else if (filter.data.createdMonth) {
      where.createdAt = toUtcMonthRange(filter.data.createdMonth);
    }

    if (filter.data.updatedDay) {
      where.updatedAt = toUtcDayRange(
        filter.data.updatedDay,
        filter.data.updatedMonth,
      );
    } else if (filter.data.updatedMonth) {
      where.updatedAt = toUtcMonthRange(filter.data.updatedMonth);
    }
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
