/*
  Warnings:

  - Added the required column `subadminEmail` to the `Igreja` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subadminSenha` to the `Igreja` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Igreja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "icone" TEXT,
    "endereco" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "sobre" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "subadminEmail" TEXT NOT NULL,
    "subadminSenha" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);
INSERT INTO "new_Igreja" ("ativo", "atualizadoEm", "criadoEm", "descricao", "email", "endereco", "icone", "id", "nome", "slug", "sobre", "telefone") SELECT "ativo", "atualizadoEm", "criadoEm", "descricao", "email", "endereco", "icone", "id", "nome", "slug", "sobre", "telefone" FROM "Igreja";
DROP TABLE "Igreja";
ALTER TABLE "new_Igreja" RENAME TO "Igreja";
CREATE UNIQUE INDEX "Igreja_nome_key" ON "Igreja"("nome");
CREATE UNIQUE INDEX "Igreja_slug_key" ON "Igreja"("slug");
CREATE UNIQUE INDEX "Igreja_subadminEmail_key" ON "Igreja"("subadminEmail");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
