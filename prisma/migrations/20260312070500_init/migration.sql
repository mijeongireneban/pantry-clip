-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "source_type" AS ENUM ('youtube_shorts', 'instagram_reels', 'other');

-- CreateEnum
CREATE TYPE "summary_source" AS ENUM ('manual', 'ai');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "source_url" TEXT NOT NULL,
    "source_type" "source_type" NOT NULL,
    "title" VARCHAR(140) NOT NULL,
    "ingredients_text" TEXT NOT NULL,
    "steps_text" TEXT NOT NULL,
    "summary_source" "summary_source" NOT NULL,
    "ai_confidence" DOUBLE PRECISION,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_recipes_user_created_id_desc" ON "recipes"("user_id", "created_at" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "idx_recipes_user_title" ON "recipes"("user_id", "title");

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

