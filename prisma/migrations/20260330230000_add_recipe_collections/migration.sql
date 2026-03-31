CREATE TABLE "recipe_collections" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "name" VARCHAR(80) NOT NULL,
  "is_default" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recipe_collections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recipe_collection_items" (
  "collection_id" UUID NOT NULL,
  "recipe_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recipe_collection_items_pkey" PRIMARY KEY ("collection_id", "recipe_id")
);

CREATE UNIQUE INDEX "uq_recipe_collections_user_name"
  ON "recipe_collections"("user_id", "name");

CREATE INDEX "idx_recipe_collections_user_created_id_desc"
  ON "recipe_collections"("user_id", "created_at" DESC, "id" DESC);

CREATE INDEX "idx_recipe_collection_items_recipe_id"
  ON "recipe_collection_items"("recipe_id");

ALTER TABLE "recipe_collections"
  ADD CONSTRAINT "recipe_collections_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recipe_collection_items"
  ADD CONSTRAINT "recipe_collection_items_collection_id_fkey"
  FOREIGN KEY ("collection_id") REFERENCES "recipe_collections"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recipe_collection_items"
  ADD CONSTRAINT "recipe_collection_items_recipe_id_fkey"
  FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

WITH default_collections AS (
  INSERT INTO "recipe_collections" ("user_id", "name", "is_default")
  SELECT DISTINCT "user_id", 'Saved', TRUE
  FROM "recipes"
  WHERE "is_saved" = TRUE AND "deleted_at" IS NULL
  RETURNING "id", "user_id"
)
INSERT INTO "recipe_collection_items" ("collection_id", "recipe_id")
SELECT default_collections."id", recipes."id"
FROM default_collections
JOIN "recipes" AS recipes
  ON recipes."user_id" = default_collections."user_id"
WHERE recipes."is_saved" = TRUE AND recipes."deleted_at" IS NULL;

ALTER TABLE "recipes"
  DROP COLUMN "is_saved";
