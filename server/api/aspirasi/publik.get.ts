import {
  PUBLIC_ASPIRASI_PER_PAGE,
  publicAspirasiQuerySchema,
} from "#shared/schemas/aspirasi.schema";
import type {
  PublicAspirasiListItem,
  PublicAspirasiListPayload,
} from "#shared/types/api";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const normalizedPublicQuery = {
    page: Array.isArray(query.page) ? query.page[0] : query.page,
    perPage: Array.isArray(query.perPage) ? query.perPage[0] : query.perPage,
  };

  const parsed = publicAspirasiQuerySchema.safeParse(normalizedPublicQuery);
  const page = parsed.success ? parsed.data.page : 1;
  const perPage = PUBLIC_ASPIRASI_PER_PAGE;
  const skip = (page - 1) * perPage;

  const [
    total,
    itemsRaw,
    totalAspirasi,
    totalUmpanBalik,
    totalProgressPerbaikan,
    totalSiswa,
  ] = await Promise.all([
    prisma.aspirasi.count(),
    prisma.aspirasi.findMany({
      select: {
        id: true,
        judul: true,
        kategori: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        fotoUrl: true,
        user: {
          select: {
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
      skip,
      take: perPage,
    }),
    prisma.aspirasi.count(),
    prisma.umpanBalik.count(),
    prisma.progressPerbaikan.count(),
    prisma.user.count({ where: { role: "SISWA" } }),
  ]);

  const items: PublicAspirasiListItem[] = itemsRaw.map((item) => ({
    id: item.id,
    judul: item.judul,
    kategori: item.kategori as PublicAspirasiListItem["kategori"],
    status: item.status as PublicAspirasiListItem["status"],
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    fotoUrl: item.fotoUrl,
    user: {
      nama: item.user.nama,
      kelas: item.user.kelas,
    },
    _count: {
      umpanBalik: item._count.umpanBalik,
      progressPerbaikan: item._count.progressPerbaikan,
    },
  }));

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return {
    success: true,
    message: "Berhasil mengambil data aspirasi publik",
    data: {
      items,
      pagination: {
        page,
        perPage,
        total,
        totalPages,
      },
      stats: {
        totalAspirasi,
        totalUmpanBalik,
        totalProgressPerbaikan,
        totalSiswa,
      },
      totalAllAspirasi: totalAspirasi,
    },
  } satisfies ApiResponse<PublicAspirasiListPayload>;
});
