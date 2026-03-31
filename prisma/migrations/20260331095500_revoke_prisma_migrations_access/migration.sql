DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = '_prisma_migrations'
  ) THEN
    EXECUTE 'REVOKE ALL ON TABLE public."_prisma_migrations" FROM PUBLIC';
    EXECUTE 'REVOKE ALL ON TABLE public."_prisma_migrations" FROM anon';
    EXECUTE 'REVOKE ALL ON TABLE public."_prisma_migrations" FROM authenticated';
  END IF;
END
$$;
