import Script from "next/script";

export default function ApiDocsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">PantryClip API Docs</h1>
      <p className="mb-4 text-sm text-gray-600">
        OpenAPI source: <code>/api/openapi</code>
      </p>

      <link
        rel="stylesheet"
        href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
      />

      <div id="swagger-ui" className="rounded-lg border border-gray-200" />

      <Script
        src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"
        strategy="afterInteractive"
      />
      <Script id="swagger-ui-init" strategy="afterInteractive">{`
        (function initSwagger() {
          if (!window.SwaggerUIBundle || !window.SwaggerUIStandalonePreset) {
            setTimeout(initSwagger, 50);
            return;
          }

          window.SwaggerUIBundle({
            url: "/api/openapi",
            dom_id: "#swagger-ui",
            deepLinking: true,
            presets: [window.SwaggerUIBundle.presets.apis, window.SwaggerUIStandalonePreset],
            layout: "BaseLayout"
          });
        })();
      `}</Script>
    </main>
  );
}
