ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "recipes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "recipe_collections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "recipe_collection_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "summarize_jobs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own"
  ON "users"
  FOR SELECT
  USING (id = (current_setting('request.jwt.claim.sub', true))::uuid);

CREATE POLICY "users_update_own"
  ON "users"
  FOR UPDATE
  USING (id = (current_setting('request.jwt.claim.sub', true))::uuid)
  WITH CHECK (id = (current_setting('request.jwt.claim.sub', true))::uuid);

CREATE POLICY "recipes_select_own"
  ON "recipes"
  FOR SELECT
  USING ("user_id" = (current_setting('request.jwt.claim.sub', true))::uuid);

CREATE POLICY "recipes_insert_own"
  ON "recipes"
  FOR INSERT
  WITH CHECK (
    "user_id" = (current_setting('request.jwt.claim.sub', true))::uuid
  );

CREATE POLICY "recipes_update_own"
  ON "recipes"
  FOR UPDATE
  USING ("user_id" = (current_setting('request.jwt.claim.sub', true))::uuid)
  WITH CHECK (
    "user_id" = (current_setting('request.jwt.claim.sub', true))::uuid
  );

CREATE POLICY "recipes_delete_own"
  ON "recipes"
  FOR DELETE
  USING ("user_id" = (current_setting('request.jwt.claim.sub', true))::uuid);

CREATE POLICY "recipe_collections_select_own"
  ON "recipe_collections"
  FOR SELECT
  USING ("user_id" = (current_setting('request.jwt.claim.sub', true))::uuid);

CREATE POLICY "recipe_collections_insert_own"
  ON "recipe_collections"
  FOR INSERT
  WITH CHECK (
    "user_id" = (current_setting('request.jwt.claim.sub', true))::uuid
  );

CREATE POLICY "recipe_collections_update_own"
  ON "recipe_collections"
  FOR UPDATE
  USING ("user_id" = (current_setting('request.jwt.claim.sub', true))::uuid)
  WITH CHECK (
    "user_id" = (current_setting('request.jwt.claim.sub', true))::uuid
  );

CREATE POLICY "recipe_collections_delete_own"
  ON "recipe_collections"
  FOR DELETE
  USING ("user_id" = (current_setting('request.jwt.claim.sub', true))::uuid);

CREATE POLICY "recipe_collection_items_select_own"
  ON "recipe_collection_items"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM "recipe_collections"
      WHERE "recipe_collections"."id" = "recipe_collection_items"."collection_id"
        AND "recipe_collections"."user_id" =
          (current_setting('request.jwt.claim.sub', true))::uuid
    )
  );

CREATE POLICY "recipe_collection_items_insert_own"
  ON "recipe_collection_items"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM "recipe_collections"
      WHERE "recipe_collections"."id" = "recipe_collection_items"."collection_id"
        AND "recipe_collections"."user_id" =
          (current_setting('request.jwt.claim.sub', true))::uuid
    )
    AND EXISTS (
      SELECT 1
      FROM "recipes"
      WHERE "recipes"."id" = "recipe_collection_items"."recipe_id"
        AND "recipes"."user_id" =
          (current_setting('request.jwt.claim.sub', true))::uuid
    )
  );

CREATE POLICY "recipe_collection_items_update_own"
  ON "recipe_collection_items"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM "recipe_collections"
      WHERE "recipe_collections"."id" = "recipe_collection_items"."collection_id"
        AND "recipe_collections"."user_id" =
          (current_setting('request.jwt.claim.sub', true))::uuid
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM "recipe_collections"
      WHERE "recipe_collections"."id" = "recipe_collection_items"."collection_id"
        AND "recipe_collections"."user_id" =
          (current_setting('request.jwt.claim.sub', true))::uuid
    )
    AND EXISTS (
      SELECT 1
      FROM "recipes"
      WHERE "recipes"."id" = "recipe_collection_items"."recipe_id"
        AND "recipes"."user_id" =
          (current_setting('request.jwt.claim.sub', true))::uuid
    )
  );

CREATE POLICY "recipe_collection_items_delete_own"
  ON "recipe_collection_items"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM "recipe_collections"
      WHERE "recipe_collections"."id" = "recipe_collection_items"."collection_id"
        AND "recipe_collections"."user_id" =
          (current_setting('request.jwt.claim.sub', true))::uuid
    )
  );

CREATE POLICY "summarize_jobs_select_own"
  ON "summarize_jobs"
  FOR SELECT
  USING ("user_id" = (current_setting('request.jwt.claim.sub', true))::uuid);

CREATE POLICY "summarize_jobs_insert_own"
  ON "summarize_jobs"
  FOR INSERT
  WITH CHECK (
    "user_id" = (current_setting('request.jwt.claim.sub', true))::uuid
  );

CREATE POLICY "summarize_jobs_update_own"
  ON "summarize_jobs"
  FOR UPDATE
  USING ("user_id" = (current_setting('request.jwt.claim.sub', true))::uuid)
  WITH CHECK (
    "user_id" = (current_setting('request.jwt.claim.sub', true))::uuid
  );

CREATE POLICY "summarize_jobs_delete_own"
  ON "summarize_jobs"
  FOR DELETE
  USING ("user_id" = (current_setting('request.jwt.claim.sub', true))::uuid);
