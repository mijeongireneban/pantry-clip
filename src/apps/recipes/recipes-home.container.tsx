export function RecipesHomeContainer() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <p className="text-sm font-medium text-accent">PantryClip MVP</p>
        <h1 className="text-3xl font-semibold tracking-tight">Blueprint-aligned structure is ready</h1>
        <p className="text-sm text-gray-600">
          `src/app` handles routes only. Feature logic lives under `src/apps`.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="text-base font-semibold">Planned API routes</h2>
        <ul className="mt-3 space-y-1 text-sm text-gray-700">
          <li>POST /api/recipes/summarize</li>
          <li>POST /api/recipes</li>
          <li>GET /api/recipes</li>
          <li>GET /api/recipes/:id</li>
          <li>PATCH /api/recipes/:id</li>
          <li>DELETE /api/recipes/:id</li>
        </ul>
      </section>
    </main>
  );
}
