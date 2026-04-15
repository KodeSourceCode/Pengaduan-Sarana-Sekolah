-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SISWA', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatusAspirasi" AS ENUM ('MENUNGGU', 'DIPROSES', 'SELESAI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "KategoriEnum" AS ENUM ('KEBERSIHAN', 'KEAMANAN', 'FASILITAS_BELAJAR', 'INFRASTRUKTUR', 'LAINNYA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nis" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "kelas" TEXT,
    "role" "Role" NOT NULL DEFAULT 'SISWA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aspirasi" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kategori" "KategoriEnum" NOT NULL,
    "status" "StatusAspirasi" NOT NULL DEFAULT 'MENUNGGU',
    "fotoUrl" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aspirasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UmpanBalik" (
    "id" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "statusBaru" "StatusAspirasi" NOT NULL,
    "aspirasiId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UmpanBalik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressPerbaikan" (
    "id" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "persentase" INTEGER NOT NULL DEFAULT 0,
    "fotoUrl" TEXT,
    "aspirasiId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressPerbaikan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nis_key" ON "User"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Aspirasi" ADD CONSTRAINT "Aspirasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UmpanBalik" ADD CONSTRAINT "UmpanBalik_aspirasiId_fkey" FOREIGN KEY ("aspirasiId") REFERENCES "Aspirasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UmpanBalik" ADD CONSTRAINT "UmpanBalik_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressPerbaikan" ADD CONSTRAINT "ProgressPerbaikan_aspirasiId_fkey" FOREIGN KEY ("aspirasiId") REFERENCES "Aspirasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressPerbaikan" ADD CONSTRAINT "ProgressPerbaikan_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
