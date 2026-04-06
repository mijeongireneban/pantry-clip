ALTER TABLE "users"
ADD COLUMN "username" VARCHAR(24),
ADD COLUMN "avatar_url" TEXT;

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
