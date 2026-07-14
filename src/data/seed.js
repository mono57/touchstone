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
      id: 'q_000', lang: 'fr', query: 'Comment faire tourner mes clés API ?',
      candidates: [
        mk('authentication#rotating-credentials', 'Authentication — Rotation des identifiants', "Générez une nouvelle clé, basculez la configuration de vos services, déployez, puis révoquez l'ancienne clé une fois tout le trafic migré.", 0.82, true, ['authentication#rotating-credentials', 'quickstart#rotate-keys', 'changelog#key-rotation-2025']),
        mk('authentication#key-anatomy', "Authentication — Anatomie d'une clé", "Une clé se compose d'un préfixe public identifiant l'environnement et d'un secret. Seul le secret doit rester confidentiel.", 0.71, true, ['authentication#key-anatomy', 'reference#key-format']),
        mk('authentication#scopes', 'Authentication — Scopes & permissions', "Attribuez à chaque clé le périmètre minimal nécessaire. Les scopes se définissent à la création et ne sont pas modifiables ensuite.", 0.64, false),
        mk('rate-limits#per-key', 'Rate limits — Limites par clé', 'Chaque clé dispose de son propre quota. Faire tourner une clé réinitialise son compteur de limite.', 0.42, false),
        mk('billing#usage-metering', "Billing — Mesure de l'usage", "L'usage est agrégé par organisation, indépendamment du nombre de clés actives.", 0.29, false),
      ],
      relevantIds: ['authentication#rotating-credentials', 'authentication#key-anatomy', 'rate-limits#per-key'],
      expectedAnswer: "Créer une nouvelle clé, basculer la config des services, déployer, puis désactiver l'ancienne une fois le trafic migré.",
      done: true,
    },
    {
      id: 'q_001', lang: 'fr', query: 'Que se passe-t-il quand je dépasse ma limite de requêtes ?',
      candidates: [
        mk('rate-limits#overview', "Rate limits — Vue d'ensemble", "Au-delà du quota, l'API renvoie un statut 429 avec un en-tête Retry-After indiquant le délai avant reprise.", 0.86, true),
        mk('rate-limits#per-key', 'Rate limits — Limites par clé', 'Chaque clé dispose de son quota horaire. Le dépassement est comptabilisé par fenêtre glissante.', 0.68, true),
        mk('rate-limits#burst', 'Rate limits — Rafales & lissage', "Un petit budget de rafale absorbe les pics ponctuels ; une fois épuisé, le lissage s'applique.", 0.55, false),
        mk('errors#http-status', 'Errors — Codes de statut HTTP', 'Le code 429 signale une limitation. Les 5xx indiquent une erreur serveur et sont réessayables.', 0.47, true),
        mk('webhooks#retries', 'Webhooks — Politique de réessai', 'Les webhooks échoués sont réessayés avec un backoff exponentiel sur 24 heures.', 0.24, false),
      ],
      relevantIds: ['rate-limits#overview', 'rate-limits#per-key'], done: true,
      expectedAnswer: "L'API renvoie 429 avec un en-tête Retry-After ; le quota est par clé sur une fenêtre glissante.",
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
      id: 'q_003', lang: 'fr', query: 'Comment configurer le SSO pour mon équipe ?',
      candidates: [
        mk('sso#setup-saml', 'SSO — Configuration SAML', "Renseignez l'URL de métadonnées de votre IdP, mappez les attributs, puis testez la connexion avant d'imposer le SSO.", 0.84, true),
        mk('sso#enforcing', 'SSO — Imposer le SSO', 'Une fois activé, les connexions par mot de passe sont désactivées pour tous les membres du domaine vérifié.', 0.69, true),
        mk('teams#roles', 'Teams — Rôles & permissions', 'Trois rôles : propriétaire, admin, membre. Les rôles peuvent être provisionnés via SCIM.', 0.52, false),
        mk('sso#scim-provisioning', 'SSO — Provisioning SCIM', 'Le provisioning automatique crée et désactive les comptes selon les groupes de votre annuaire.', 0.48, true),
      ],
      relevantIds: ['sso#setup-saml', 'sso#enforcing'], done: true,
      expectedAnswer: "Renseigner les métadonnées de l'IdP, mapper les attributs, tester, puis imposer le SSO.",
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
      id: 'q_005', lang: 'fr', query: 'Pourquoi mes webhooks ne sont-ils pas reçus ?',
      candidates: [
        mk('webhooks#troubleshooting', 'Webhooks — Dépannage', 'Vérifiez que votre endpoint renvoie un 2xx sous 10 secondes ; au-delà la livraison est considérée comme échouée.', 0.86, true, ['webhooks#troubleshooting', 'support#webhook-faq']),
        mk('webhooks#retries', 'Webhooks — Politique de réessai', 'Les livraisons échouées sont réessayées avec un backoff exponentiel pendant 24 h, puis abandonnées.', 0.74, true),
        mk('webhooks#delivery-logs', 'Webhooks — Journaux de livraison', 'Le tableau de bord affiche chaque tentative, son code de réponse et le corps renvoyé.', 0.69, true),
        mk('webhooks#endpoint-timeouts', 'Webhooks — Timeouts', 'Un endpoint qui répond en plus de 10 secondes est traité comme un échec de livraison.', 0.63, false),
        mk('webhooks#ip-allowlist', "Webhooks — Liste d'IP autorisées", 'Si votre pare-feu filtre les entrées, ajoutez nos plages IP publiées à votre allowlist.', 0.58, false),
        mk('webhooks#firewall-proxy', 'Webhooks — Pare-feu & proxy', 'Un proxy inverse ou un pare-feu filtrant peut bloquer les requêtes entrantes.', 0.54, false),
        mk('webhooks#tls-requirements', 'Webhooks — Exigences TLS', 'Le endpoint doit présenter un certificat TLS valide et non expiré.', 0.50, false),
        mk('webhooks#response-codes', 'Webhooks — Codes de réponse', 'Seuls les 2xx confirment la réception ; les redirections 3xx ne sont pas suivies.', 0.47, false),
        mk('webhooks#event-subscriptions', "Webhooks — Abonnements d'événements", "Vérifiez que le type d'événement attendu est bien abonné sur cet endpoint.", 0.44, false),
        mk('webhooks#event-filtering', "Webhooks — Filtres d'événements", 'Un filtre trop restrictif peut écarter silencieusement des événements.', 0.41, false),
        mk('webhooks#endpoint-status', "Webhooks — Statut de l'endpoint", "Un endpoint désactivé après trop d'échecs consécutifs n'est plus appelé.", 0.38, false),
        mk('webhooks#payload-size', 'Webhooks — Taille du payload', 'Les charges utiles très volumineuses peuvent être rejetées ou tronquées.', 0.35, false),
        mk('webhooks#ordering', 'Webhooks — Ordre de livraison', "L'ordre des événements n'est pas garanti entre deux livraisons.", 0.32, false),
        mk('webhooks#idempotency', 'Webhooks — Idempotence', "Utilisez l'id d'événement pour dédupliquer les livraisons répétées.", 0.29, false),
        mk('webhooks#dns', 'Webhooks — Résolution DNS', 'Un enregistrement DNS invalide empêche la connexion à votre endpoint.', 0.26, false),
        mk('webhooks#quickstart', 'Webhooks — Prise en main', "Créez un endpoint, abonnez des types d'événements, puis envoyez un événement de test.", 0.23, false),
        mk('rate-limits#overview', "Rate limits — Vue d'ensemble", "Les réponses 429 concernent l'API sortante, pas la réception des webhooks.", 0.20, false),
        mk('webhooks#disable', 'Webhooks — Désactivation', 'Vous pouvez suspendre puis réactiver un endpoint depuis les réglages.', 0.17, false),
        mk('security#replay-protection', 'Security — Anti-rejeu', 'Le rejet des livraisons trop anciennes est sans lien avec la non-réception.', 0.14, false),
        mk('billing#usage-metering', "Billing — Mesure de l'usage", 'Sans rapport direct avec la livraison des webhooks.', 0.11, false),
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
    ['guides#getting-started', 'Guides — Prise en main', 'Installez le SDK, configurez votre clé, puis effectuez un premier appel de test.'],
    ['guides#quotas', 'Guides — Quotas & plans', "Chaque plan définit un quota mensuel ; le dépassement bascule en facturation à l'usage."],
    ['api#pagination', 'API — Pagination', "Les listes sont paginées par curseur ; suivez next_cursor jusqu'à null."],
    ['api#errors', 'API — Gestion des erreurs', 'Les erreurs suivent une enveloppe { code, message } ; les 4xx ne sont pas réessayables.'],
    ['account#members', 'Account — Membres', "Invitez des membres par e-mail et attribuez un rôle à l'invitation."],
    ['account#billing', 'Account — Facturation', 'Gérez moyens de paiement et factures depuis les paramètres de facturation.'],
  ].map(r => ({ id: r[0], title: r[1], text: r[2], url: DOCS + r[0] }));
}

export function genQuestion(query, lang) {
  const scores = [0.80, 0.63, 0.49, 0.36];
  const picked = [...stubPool()].sort(() => Math.random() - 0.5).slice(0, 4);
  const cands = picked.map((c, i) => ({ ...c, score: scores[i], judgeSuggested: scores[i] >= 0.6 }));
  return {
    id: 'q_' + String(Date.now()).slice(-6), lang: lang || 'fr', query, done: false,
    candidates: cands, relevantIds: cands.filter(c => c.judgeSuggested).map(c => c.id), expectedAnswer: '',
  };
}
