-- CreateTable
CREATE TABLE "Igreja" (
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
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Membro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "igrejaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefone" TEXT,
    "dataNascimento" DATETIME,
    "dataBatismo" DATETIME,
    "cargo" TEXT NOT NULL DEFAULT 'Membro',
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "role" TEXT NOT NULL DEFAULT 'subadmin',
    "departamentoId" INTEGER,
    "sectorId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Membro_igrejaId_fkey" FOREIGN KEY ("igrejaId") REFERENCES "Igreja" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Membro_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Membro_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Departamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "igrejaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "icone" TEXT,
    "descricao" TEXT,
    "liderId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Departamento_igrejaId_fkey" FOREIGN KEY ("igrejaId") REFERENCES "Igreja" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Departamento_liderId_fkey" FOREIGN KEY ("liderId") REFERENCES "Membro" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sector" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "igrejaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "departamentoId" INTEGER NOT NULL,
    "liderId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Sector_igrejaId_fkey" FOREIGN KEY ("igrejaId") REFERENCES "Igreja" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Sector_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Sector_liderId_fkey" FOREIGN KEY ("liderId") REFERENCES "Membro" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "igrejaId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Evento_igrejaId_fkey" FOREIGN KEY ("igrejaId") REFERENCES "Igreja" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Aviso" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "igrejaId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Aviso_igrejaId_fkey" FOREIGN KEY ("igrejaId") REFERENCES "Igreja" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pastor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "igrejaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL DEFAULT 'Pastor Presidente',
    "bio" TEXT,
    "foto" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "versiculo" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pastor_igrejaId_fkey" FOREIGN KEY ("igrejaId") REFERENCES "Igreja" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Oferta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "igrejaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "valor" REAL NOT NULL,
    "finalidade" TEXT NOT NULL,
    "metodo" TEXT NOT NULL,
    "referencia" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Oferta_igrejaId_fkey" FOREIGN KEY ("igrejaId") REFERENCES "Igreja" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "igrejaId" INTEGER NOT NULL,
    "titulo" TEXT,
    "url" TEXT NOT NULL,
    "album" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Foto_igrejaId_fkey" FOREIGN KEY ("igrejaId") REFERENCES "Igreja" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PedidoOracao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "contact" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Igreja_nome_key" ON "Igreja"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Igreja_slug_key" ON "Igreja"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Membro_email_key" ON "Membro"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Departamento_igrejaId_nome_key" ON "Departamento"("igrejaId", "nome");
