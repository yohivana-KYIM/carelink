export const siteConfig = {
  name: "Ecotocare",
  tagline: "Rappels de rendez-vous WhatsApp pour cabinets médicaux de toutes spécialités",
  description:
    "Rappels de rendez-vous et relance des patients par WhatsApp pour les cabinets médicaux de toutes spécialités : dentistes, pédiatres, ophtalmologues, gynécologues et plus.",
  footerDescription:
    "Ecotocare est le logiciel de rappel de rendez-vous par WhatsApp pour les cabinets médicaux et paramédicaux de toutes spécialités : rappels automatiques, relance des patients, moins de rendez-vous manqués.",
  url: "https://ecotocare.com",
  locale: "fr_FR",
  keywords: [
    "rappel rendez-vous WhatsApp établissement de santé",
    "logiciel de rappel de rendez-vous médical",
    "réduire les rendez-vous manqués cabinet médical",
    "relance patients inactifs WhatsApp",
    "no-show cabinet médical",
    "WhatsApp Business API santé",
    "dashboard établissement de santé sans installation",
    "logiciel rappel rendez-vous pédiatre",
    "logiciel rappel rendez-vous ophtalmologue",
    "logiciel cabinet médical WhatsApp",
    "rappel rendez-vous spécialiste",
  ],
  contactEmail: "contact@ecotocare.com",
  social: {
    facebook: "https://www.facebook.com/share/19eQwa5T4u/?mibextid=wwXIfr",
    linkedin: "https://www.linkedin.com/showcase/ecotocare/",
  },
} as const;

export const navLinks = [
  { label: "Fonctionnalités", href: "/#fonctionnalites", key: "nav.features" },
  { label: "Spécialités", href: "/#specialites", key: "nav.specialties" },
  { label: "Comment ça marche", href: "/#comment-ca-marche", key: "nav.howItWorks" },
  { label: "Sécurité", href: "/#securite", key: "nav.security" },
  { label: "FAQ", href: "/#faq", key: "nav.faq" },
  { label: "Ressources", href: "/#ressources", key: "nav.resources" },
  { label: "Contact", href: "/contact", key: "nav.contact" },
] as const;

export const heroChecklist = [
  "Jusqu'à -30% de rendez-vous manqués",
  "Relances automatiques des patients inactifs",
  "100% web, sans installation",
] as const;

export const trustPoints = [
  {
    key: "api",
    title: "API WhatsApp Business (Meta)",
    description: "Messagerie acheminée via un fournisseur BSP certifié Meta.",
  },
  {
    key: "gdpr",
    title: "Conforme RGPD & données de santé",
    description: "Chiffrement au repos et en transit, consentement patient (opt-in).",
  },
  {
    key: "noCommitment",
    title: "Sans engagement",
    description: "Un compte par cabinet, résiliable à tout moment.",
  },
  {
    key: "browsers",
    title: "Compatible tous navigateurs",
    description: "Chrome, Firefox, Edge — ordinateur et tablette.",
  },
] as const;

export const features = [
  {
    key: "reminders",
    icon: "BellRing",
    title: "Rappels de rendez-vous",
    description:
      "Message WhatsApp automatique 48h puis 24h avant chaque rendez-vous, avec réponse du patient en un clic.",
  },
  {
    key: "relance",
    icon: "RefreshCcw",
    title: "Relance des patients inactifs",
    description:
      "Détection automatique des patients ayant dépassé le délai de soin recommandé et envoi d'une relance.",
  },
  {
    key: "confirm",
    icon: "CheckCheck",
    title: "Confirmation en un clic",
    description:
      "Le patient confirme ou demande un report directement dans WhatsApp, sans appel ni SMS.",
  },
  {
    key: "dashboard",
    icon: "LayoutDashboard",
    title: "Tableau de bord en temps réel",
    description:
      "Vue du jour, de la semaine, statuts des rendez-vous et alertes pour les cas sans réponse.",
  },
  {
    key: "patientCard",
    icon: "UserRound",
    title: "Fiche patient & historique",
    description:
      "Historique complet des rendez-vous, messages envoyés et réponses, pour chaque patient.",
  },
  {
    key: "security",
    icon: "ShieldCheck",
    title: "Sécurité & conformité",
    description:
      "Contrôle d'accès par rôle, journalisation des envois et consentement patient tracé.",
  },
] as const;

// Section "Spécialités" — conçu pour, jamais "utilisé par" : aucun cabinet de
// ces spécialités n'utilise encore Ecotocare. Pas de chiffres ("-30%", "98%")
// ni de promesse de résultat médical dans cette section (cf. brief 2026-10-16).
export const specialtyBlocks = [
  {
    key: "regularFollowUp",
    title: "Suivi régulier",
    tagline:
      "Des patients à revoir à intervalles réguliers : la relance automatique les fait revenir au bon moment.",
    specialties: [
      "Dentistes et orthodontistes",
      "Ophtalmologues",
      "Gynécologues et obstétriciens",
      "Pédiatres",
      "Cardiologues",
      "Endocrinologues et diabétologues",
      "Dermatologues",
      "Néphrologues",
      "Pneumologues",
      "Psychiatres et psychologues",
      "Médecine physique et de réadaptation",
      "Centres de PMA (fertilité)",
      "Oncologues",
    ],
  },
  {
    key: "consultations",
    title: "Consultations et suivi",
    tagline:
      "Des consultations variées, où chaque rendez-vous manqué est un créneau perdu : le rappel le protège.",
    specialties: [
      "Médecins généralistes",
      "ORL",
      "Gastro-entérologues",
      "Urologues",
      "Rhumatologues",
      "Neurologues",
      "Orthopédistes et médecine du sport",
      "Allergologues",
      "Chirurgie plastique et esthétique",
    ],
  },
  {
    key: "surgeryExams",
    title: "Chirurgie et examens",
    tagline:
      "Des rendez-vous qui mobilisent du temps et du matériel : le rappel limite les créneaux perdus.",
    specialties: [
      "Chirurgiens (viscéral, vasculaire, etc.)",
      "Imagerie médicale (radiologie, échographie)",
      "Laboratoires d'analyses",
    ],
  },
  {
    key: "paramedical",
    title: "Cabinets paramédicaux",
    tagline: "Des séries de séances où une absence retarde tout le parcours de soin.",
    specialties: [
      "Kinésithérapeutes",
      "Nutritionnistes et diététiciens",
      "Orthophonistes",
      "Ergothérapeutes",
      "Podologues",
      "Sages-femmes",
      "Ostéopathes",
    ],
  },
] as const;

export const relanceExamples = [
  { key: "dentists", specialty: "Dentistes", example: "Contrôle et détartrage, par exemple tous les 6 mois" },
  {
    key: "pediatricians",
    specialty: "Pédiatres",
    example: "Rendez-vous de vaccination ou de suivi de croissance prévus au calendrier",
  },
  { key: "ophthalmologists", specialty: "Ophtalmologues", example: "Contrôle de la vue annuel" },
  { key: "gynecologists", specialty: "Gynécologues", example: "Suivi annuel et consultations prénatales" },
  {
    key: "chronicCare",
    specialty: "Cardiologues, endocrinologues",
    example: "Renouvellement du suivi des maladies chroniques",
  },
  {
    key: "physiotherapists",
    specialty: "Kinésithérapeutes",
    example: "Rappel des séances de la série en cours",
  },
  { key: "psychiatrists", specialty: "Psychiatres, psychologues", example: "Rappel des séances" },
] as const;

export const howItWorksSteps = [
  {
    key: "create",
    number: "01",
    title: "Créez votre cabinet",
    description:
      "Inscrivez votre cabinet, ajoutez vos praticiens et connectez votre numéro WhatsApp Business.",
    image: "/images/onboarding-signup.jpeg",
  },
  {
    key: "configure",
    number: "02",
    title: "Configurez vos règles",
    description:
      "Définissez les délais de rappel (J-2, J-1) et la fréquence de relance par type de soin.",
    image: "/images/regle.png",
  },
  {
    key: "follow",
    number: "03",
    title: "Suivez vos patients",
    description:
      "Le dashboard se met à jour automatiquement selon les réponses reçues sur WhatsApp.",
    image: "/images/suivez.png",
  },
] as const;

export const highlightChecklist = [
  "Rappels 48h et 24h automatiques avant chaque rendez-vous",
  "Relances des patients inactifs paramétrables par type de soin",
  "Statut du rendez-vous mis à jour en temps réel dans le dashboard",
  "Alerte visuelle pour les rendez-vous sans réponse à J-1",
] as const;

export const faqItems = [
  {
    key: "app",
    question: "Les patients doivent-ils installer une application ?",
    answer:
      "Non. Les patients reçoivent et répondent aux messages directement dans WhatsApp, l'application qu'ils utilisent déjà au quotidien. Aucune installation côté patient.",
  },
  {
    key: "gdpr",
    question: "Est-ce conforme au RGPD et aux données de santé ?",
    answer:
      "Oui. Les données patients sont chiffrées au repos et en transit (HTTPS), l'accès est contrôlé par rôle (secrétaire / praticien), et chaque envoi WhatsApp nécessite le consentement préalable (opt-in) du patient, condition imposée par Meta.",
  },
  {
    key: "start",
    question: "Combien de temps faut-il pour démarrer ?",
    answer:
      "La mise en place technique est rapide, mais les modèles de message doivent être validés par Meta avant le premier envoi — ce délai peut aller de quelques heures à quelques jours et ne dépend pas d'Ecotocare.",
  },
  {
    key: "customize",
    question: "Puis-je personnaliser les messages envoyés ?",
    answer:
      "Oui, dans les limites imposées par les modèles WhatsApp pré-approuvés par Meta. Le texte, le ton et les variables (nom, date, praticien) restent personnalisables depuis le dashboard.",
  },
  {
    key: "cost",
    question: "Quel est le coût des messages WhatsApp ?",
    answer:
      "Le coût par message dépend du fournisseur BSP choisi et du volume envoyé ; il s'agit d'un coût récurrent distinct du forfait de développement, détaillé séparément selon la taille de votre cabinet.",
  },
  {
    key: "noResponse",
    question: "Que se passe-t-il si un patient ne répond pas ?",
    answer:
      "Le rendez-vous reste visible avec une alerte visuelle dans le dashboard dès J-1 sans réponse, afin que la secrétaire puisse effectuer un appel de suivi manuel si nécessaire.",
  },
  {
    key: "specialty",
    question: "Ecotocare convient-il à ma spécialité ?",
    answer:
      "Oui, dès que votre cabinet travaille sur rendez-vous. Le rappel de rendez-vous convient à toutes les spécialités. La relance des patients se règle selon le rythme de suivi de votre discipline, par type de soin. Si votre spécialité ne figure pas dans la liste, contactez-nous.",
  },
] as const;

export const resources = [
  {
    key: "noShow",
    title: "Réduire les rendez-vous manqués au cabinet",
    excerpt:
      "Les leviers concrets pour faire baisser le taux de no-show, au-delà du simple rappel téléphonique.",
    tag: "Gestion de cabinet",
  },
  {
    key: "gdpr",
    title: "RGPD et données de santé : ce qu'il faut savoir",
    excerpt:
      "Consentement, chiffrement, traçabilité : les bonnes pratiques pour communiquer avec vos patients en toute conformité.",
    tag: "Conformité",
  },
  {
    key: "whatsapp",
    title: "Comprendre WhatsApp Business API",
    excerpt:
      "Templates validés par Meta, fournisseurs BSP, opt-in patient : le fonctionnement expliqué simplement.",
    tag: "WhatsApp",
  },
] as const;

export const footerLinks = {
  produit: [
    { key: "features", label: "Fonctionnalités", href: "#fonctionnalites" },
    { key: "howItWorks", label: "Comment ça marche", href: "#comment-ca-marche" },
    { key: "security", label: "Sécurité", href: "#securite" },
  ],
  ressources: [
    { key: "faq", label: "FAQ", href: "#faq" },
    { key: "resources", label: "Ressources", href: "#ressources" },
    { key: "contact", label: "Contact", href: "#contact" },
  ],
  legal: [
    { key: "notice", label: "Mentions légales", href: "#" },
    { key: "privacy", label: "Politique de confidentialité", href: "#" },
    { key: "terms", label: "Conditions d'utilisation", href: "#" },
  ],
} as const;
