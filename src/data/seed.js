// In-memory sample data for the "Chaari docs" fictional domain.
// 5 questions marked done (Q0–Q4) + 1 pending (Q5, 20 candidates to demo big k).
// /retrieve calls are simulated — no real backend.

const DOCS = 'https://docs.chaari.app/';

const mk = (id, title, text, score, sug, srcs) => ({
  id, title, text,
  url: DOCS + id,
  score,
  judgeSuggested: !!sug,
  sources: srcs ? srcs.map(a => ({ label: a, url: DOCS + a })) : null,
});

export function seed() {
  const q = [
    {
      id: 'q_000', lang: 'en', query: 'How do I rotate my API keys?',
      candidates: [
        mk('authentication#rotating-credentials', 'Authentication — Rotating credentials', 'Generate a new key, switch your services over to it, deploy, then revoke the old key once all traffic has migrated.', 0.82, true, ['authentication#rotating-credentials', 'quickstart#rotate-keys', 'changelog#key-rotation-2025']),
        mk('authentication#key-anatomy', 'Authentication — Anatomy of a key', 'A key is made of a public prefix identifying the environment and a secret. Only the secret must stay confidential.', 0.71, true, ['authentication#key-anatomy', 'reference#key-format']),
        mk('authentication#scopes', 'Authentication — Scopes & permissions', 'Give each key the minimal scope it needs. Scopes are set at creation and cannot be changed afterwards.', 0.64, false),
        mk('rate-limits#per-key', 'Rate limits — Per-key limits', 'Each key has its own quota. Rotating a key resets its limit counter.', 0.42, false),
        mk('billing#usage-metering', 'Billing — Usage metering', 'Usage is aggregated per organization, regardless of the number of active keys.', 0.29, false),
      ],
      relevantIds: ['authentication#rotating-credentials', 'authentication#key-anatomy', 'rate-limits#per-key'],
      expectedAnswer: 'Create a new key, switch the services over to it, deploy, then disable the old one once traffic has migrated.',
      done: true,
    },
    {
      id: 'q_001', lang: 'en', query: 'What happens when I exceed my request limit?',
      candidates: [
        mk('rate-limits#overview', 'Rate limits — Overview', 'Beyond the quota, the API returns a 429 status with a Retry-After header indicating the delay before resuming.', 0.86, true),
        mk('rate-limits#per-key', 'Rate limits — Per-key limits', 'Each key has its own hourly quota. Overage is counted over a sliding window.', 0.68, true),
        mk('rate-limits#burst', 'Rate limits — Bursts & smoothing', 'A small burst budget absorbs occasional spikes; once exhausted, smoothing kicks in.', 0.55, false),
        mk('errors#http-status', 'Errors — HTTP status codes', 'A 429 signals throttling. 5xx indicate a server error and are retryable.', 0.47, true),
        mk('webhooks#retries', 'Webhooks — Retry policy', 'Failed webhooks are retried with exponential backoff over 24 hours.', 0.24, false),
      ],
      relevantIds: ['rate-limits#overview', 'rate-limits#per-key'], done: true,
      expectedAnswer: 'The API returns 429 with a Retry-After header; the quota is per key over a sliding window.',
    },
    {
      id: 'q_002', lang: 'en', query: 'How do I verify a webhook signature?',
      candidates: [
        mk('webhooks#verifying-signatures', 'Webhooks — Verifying signatures', 'Each delivery is signed with HMAC-SHA256. Recompute the digest over the raw body using your signing secret and compare in constant time.', 0.89, true),
        mk('webhooks#signing-secret', 'Webhooks — Signing secrets', "Retrieve your endpoint's signing secret from the dashboard. Rotate it if you suspect exposure.", 0.72, true),
        mk('webhooks#event-payload', 'Webhooks — Event payload', 'Every event includes an id, type, and created timestamp alongside the resource snapshot.', 0.50, false),
        mk('security#replay-protection', 'Security — Replay protection', 'Reject deliveries whose timestamp is older than five minutes to prevent replay attacks.', 0.44, true),
      ],
      relevantIds: ['webhooks#verifying-signatures', 'webhooks#signing-secret'], done: true,
      expectedAnswer: 'Recompute the HMAC-SHA256 digest over the raw body with your signing secret and compare in constant time.',
    },
    {
      id: 'q_003', lang: 'en', query: 'How do I set up SSO for my team?',
      candidates: [
        mk('sso#setup-saml', 'SSO — SAML configuration', 'Enter your IdP metadata URL, map the attributes, then test the connection before enforcing SSO.', 0.84, true),
        mk('sso#enforcing', 'SSO — Enforcing SSO', 'Once enabled, password logins are disabled for all members of the verified domain.', 0.69, true),
        mk('teams#roles', 'Teams — Roles & permissions', 'Three roles: owner, admin, member. Roles can be provisioned via SCIM.', 0.52, false),
        mk('sso#scim-provisioning', 'SSO — SCIM provisioning', 'Automatic provisioning creates and deactivates accounts based on your directory groups.', 0.48, true),
      ],
      relevantIds: ['sso#setup-saml', 'sso#enforcing'], done: true,
      expectedAnswer: 'Enter the IdP metadata, map the attributes, test, then enforce SSO.',
    },
    {
      id: 'q_004', lang: 'en', query: 'What data does Chaari retain after I delete a project?',
      candidates: [
        mk('data#retention-policy', 'Data — Retention policy', 'Deleted projects are soft-deleted for 30 days, then purged. Backups roll off within 35 days.', 0.81, true),
        mk('data#export', 'Data — Exporting your data', 'Export a full JSON archive of a project from settings before deletion.', 0.60, false),
        mk('security#encryption', 'Security — Encryption at rest', 'All data is encrypted at rest with AES-256; keys are rotated quarterly.', 0.40, false),
        mk('legal#dpa', 'Legal — Data processing addendum', 'The DPA specifies sub-processors and retention commitments for enterprise customers.', 0.33, true),
      ],
      relevantIds: ['data#retention-policy'], done: true,
      expectedAnswer: 'Soft-deleted for 30 days then purged; backups roll off within 35 days.',
    },
    {
      id: 'q_005', lang: 'en', query: "Why aren't my webhooks being received?",
      candidates: [
        mk('webhooks#troubleshooting', 'Webhooks — Troubleshooting', 'Check that your endpoint returns a 2xx within 10 seconds; beyond that the delivery is considered failed.', 0.86, true, ['webhooks#troubleshooting', 'support#webhook-faq']),
        mk('webhooks#retries', 'Webhooks — Retry policy', 'Failed deliveries are retried with exponential backoff for 24 h, then abandoned.', 0.74, true),
        mk('webhooks#delivery-logs', 'Webhooks — Delivery logs', 'The dashboard shows each attempt, its response code and the returned body.', 0.69, true),
        mk('webhooks#endpoint-timeouts', 'Webhooks — Timeouts', 'An endpoint that responds in more than 10 seconds is treated as a delivery failure.', 0.63, false),
        mk('webhooks#ip-allowlist', 'Webhooks — IP allowlist', 'If your firewall filters inbound traffic, add our published IP ranges to your allowlist.', 0.58, false),
        mk('webhooks#firewall-proxy', 'Webhooks — Firewall & proxy', 'A reverse proxy or filtering firewall can block inbound requests.', 0.54, false),
        mk('webhooks#tls-requirements', 'Webhooks — TLS requirements', 'The endpoint must present a valid, non-expired TLS certificate.', 0.50, false),
        mk('webhooks#response-codes', 'Webhooks — Response codes', 'Only 2xx confirm receipt; 3xx redirects are not followed.', 0.47, false),
        mk('webhooks#event-subscriptions', 'Webhooks — Event subscriptions', 'Check that the expected event type is actually subscribed on this endpoint.', 0.44, false),
        mk('webhooks#event-filtering', 'Webhooks — Event filters', 'An overly restrictive filter can silently drop events.', 0.41, false),
        mk('webhooks#endpoint-status', 'Webhooks — Endpoint status', 'An endpoint disabled after too many consecutive failures is no longer called.', 0.38, false),
        mk('webhooks#payload-size', 'Webhooks — Payload size', 'Very large payloads may be rejected or truncated.', 0.35, false),
        mk('webhooks#ordering', 'Webhooks — Delivery ordering', 'Event ordering is not guaranteed between deliveries.', 0.32, false),
        mk('webhooks#idempotency', 'Webhooks — Idempotency', 'Use the event id to deduplicate repeated deliveries.', 0.29, false),
        mk('webhooks#dns', 'Webhooks — DNS resolution', 'An invalid DNS record prevents connecting to your endpoint.', 0.26, false),
        mk('webhooks#quickstart', 'Webhooks — Getting started', 'Create an endpoint, subscribe to event types, then send a test event.', 0.23, false),
        mk('rate-limits#overview', 'Rate limits — Overview', 'A 429 concerns the outbound API, not webhook receipt.', 0.20, false),
        mk('webhooks#disable', 'Webhooks — Disabling', 'You can suspend then re-enable an endpoint from settings.', 0.17, false),
        mk('security#replay-protection', 'Security — Replay protection', 'Rejecting stale deliveries is unrelated to non-receipt.', 0.14, false),
        mk('billing#usage-metering', 'Billing — Usage metering', 'Not directly related to webhook delivery.', 0.11, false),
      ],
      relevantIds: null, expectedAnswer: '', done: false,
    },
  ];
  // pre-check pending questions from the LLM judge suggestions
  q.forEach(x => { if (x.relevantIds === null) x.relevantIds = x.candidates.filter(c => c.judgeSuggested).map(c => c.id); });
  return q;
}

// Pool of stub chunks used to synthesise candidates for questions added on the fly.
export function stubPool() {
  return [
    ['guides#getting-started', 'Guides — Getting started', 'Install the SDK, configure your key, then make a first test call.'],
    ['guides#quotas', 'Guides — Quotas & plans', 'Each plan defines a monthly quota; overage switches to usage-based billing.'],
    ['api#pagination', 'API — Pagination', 'Lists are cursor-paginated; follow next_cursor until null.'],
    ['api#errors', 'API — Error handling', 'Errors follow a { code, message } envelope; 4xx are not retryable.'],
    ['account#members', 'Account — Members', 'Invite members by email and assign a role at invitation time.'],
    ['account#billing', 'Account — Billing', 'Manage payment methods and invoices from billing settings.'],
  ].map(r => ({ id: r[0], title: r[1], text: r[2], url: DOCS + r[0] }));
}

export function genQuestion(query, lang) {
  const scores = [0.80, 0.63, 0.49, 0.36];
  const picked = [...stubPool()].sort(() => Math.random() - 0.5).slice(0, 4);
  const cands = picked.map((c, i) => ({ ...c, score: scores[i], judgeSuggested: scores[i] >= 0.6 }));
  return {
    id: 'q_' + String(Date.now()).slice(-6), lang: lang || 'en', query, done: false,
    candidates: cands, relevantIds: cands.filter(c => c.judgeSuggested).map(c => c.id), expectedAnswer: '',
  };
}
