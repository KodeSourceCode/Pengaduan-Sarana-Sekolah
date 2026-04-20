import { updateStatusSchema } from "#shared/schemas/aspirasi.schema";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "id aspirasi wajib diisi",
    });
  }

  const body = await readBody(event);
  const result = updateStatusSchema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.message,
    });
  }

  const existing = await prisma.aspirasi.findUnique({ where: { id } });
  if (!existing) {
    throw createError({ statusCode: 404, message: "Aspirasi tidak ditemukan" });
  }

  const data = await prisma.aspirasi.update({
    where: { id },
    data: { status: result.data.status },
  });

  return {
    success: true,
    message: "Status aspirasi berhasil diupdate",
    data,
  } satisfies ApiResponse<typeof data>;
});
