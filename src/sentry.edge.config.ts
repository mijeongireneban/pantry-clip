import * as Sentry from "@sentry/nextjs";

import {
  getSentryEnvironment,
  getSentryRelease,
  getSentryTracesSampleRate,
  getServerSentryDsn
} from "@/src/config/sentry";

const dsn = getServerSentryDsn();

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: getSentryEnvironment(),
  release: getSentryRelease(),
  tracesSampleRate: getSentryTracesSampleRate()
});
