/*
  Warnings:

  - You are about to drop the column `sectorId` on the `Membro` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_MembrosDosSectores" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_MembrosDosSectores_A_fkey" FOREIGN KEY ("A") REFERENCES "Membro" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MembrosDosSectores_B_fkey" FOREIGN KEY ("B") REFERENCES "Sector" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Membro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "igrejaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefone" TEXT,
    "dataNascimento" DATETIME,
    "dataBatismo" DATETIME,
    "cargo" TEXT NOT NULL DEFAULT 'Membro',
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "role" TEXT NOT NULL DEFAULT 'member',
    "departamentoId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Membro_igrejaId_fkey" FOREIGN KEY ("igrejaId") REFERENCES "Igreja" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Membro_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Membro" ("atualizadoEm", "cargo", "criadoEm", "dataBatismo", "dataNascimento", "departamentoId", "email", "id", "igrejaId", "nome", "password", "role", "status", "telefone") SELECT "atualizadoEm", "cargo", "criadoEm", "dataBatismo", "dataNascimento", "departamentoId", "email", "id", "igrejaId", "nome", "password", "role", "status", "telefone" FROM "Membro";
DROP TABLE "Membro";
ALTER TABLE "new_Membro" RENAME TO "Membro";
CREATE UNIQUE INDEX "Membro_email_key" ON "Membro"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_MembrosDosSectores_AB_unique" ON "_MembrosDosSectores"("A", "B");

-- CreateIndex
CREATE INDEX "_MembrosDosSectores_B_index" ON "_MembrosDosSectores"("B");
