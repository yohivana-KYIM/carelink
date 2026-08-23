export const siteConfig = {
  name: "Ecotocare",
  tagline: "Logiciel de rappel de rendez-vous WhatsApp pour cabinets dentaires",
  description:
    "Ecotocare est le logiciel de rappel de rendez-vous par WhatsApp pour cabinets dentaires : rappels automatiques, relance des patients inactifs, moins de rendez-vous manqués, dashboard cabinet dentaire sans installation.",
  url: "https://ecotocare.com",
  locale: "fr_FR",
  keywords: [
    "rappel rendez-vous WhatsApp dentiste",
    "logiciel de rappel de rendez-vous pour dentiste",
    "réduire les rendez-vous manqués cabinet dentaire",
    "relance patients inactifs WhatsApp",
    "no-show dentiste",
    "WhatsApp Business API cabinet dentaire",
    "dashboard cabinet dentaire sans installation",
  ],
  contactEmail: "contact@ecotocare.com",
  social: {
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
    linkedin: "https://www.linkedin.com/",
    x: "https://x.com/",
  },
} as const;

export const navLinks = [
  { label: "Fonctionnalités", href: "/#fonctionnalites", key: "nav.features" },
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
    title: "API WhatsApp Business (Meta)",
    description: "Messagerie acheminée via un fournisseur BSP certifié Meta.",
  },
  {
    title: "Conforme RGPD & données de santé",
    description: "Chiffrement au repos et en transit, consentement patient (opt-in).",
  },
  {
    title: "Sans engagement",
    description: "Un compte par cabinet, résiliable à tout moment.",
  },
  {
    title: "Compatible tous navigateurs",
    description: "Chrome, Firefox, Edge — ordinateur et tablette.",
  },
] as const;

export const features = [
  {
    icon: "BellRing",
    title: "Rappels de rendez-vous",
    description:
      "Message WhatsApp automatique 48h puis 24h avant chaque rendez-vous, avec réponse du patient en un clic.",
  },
  {
    icon: "RefreshCcw",
    title: "Relance des patients inactifs",
    description:
      "Détection automatique des patients ayant dépassé le délai de soin recommandé et envoi d'une relance.",
  },
  {
    icon: "CheckCheck",
    title: "Confirmation en un clic",
    description:
      "Le patient confirme ou demande un report directement dans WhatsApp, sans appel ni SMS.",
  },
  {
    icon: "LayoutDashboard",
    title: "Tableau de bord en temps réel",
    description:
      "Vue du jour, de la semaine, statuts des rendez-vous et alertes pour les cas sans réponse.",
  },
  {
    icon: "UserRound",
    title: "Fiche patient & historique",
    description:
      "Historique complet des rendez-vous, messages envoyés et réponses, pour chaque patient.",
  },
  {
    icon: "ShieldCheck",
    title: "Sécurité & conformité",
    description:
      "Contrôle d'accès par rôle, journalisation des envois et consentement patient tracé.",
  },
] as const;

export const howItWorksSteps = [
  {
    number: "01",
    title: "Créez votre cabinet",
    description:
      "Inscrivez votre cabinet, ajoutez vos praticiens et connectez votre numéro WhatsApp Business.",
    image: "/images/onboarding-signup.jpeg",
  },
  {
    number: "02",
    title: "Configurez vos règles",
    description:
      "Définissez les délais de rappel (J-2, J-1) et la fréquence de relance par type de soin.",
    image: "/images/regle.png",
  },
  {
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
    question: "Les patients doivent-ils installer une application ?",
    answer:
      "Non. Les patients reçoivent et répondent aux messages directement dans WhatsApp, l'application qu'ils utilisent déjà au quotidien. Aucune installation côté patient.",
  },
  {
    question: "Est-ce conforme au RGPD et aux données de santé ?",
    answer:
      "Oui. Les données patients sont chiffrées au repos et en transit (HTTPS), l'accès est contrôlé par rôle (secrétaire / dentiste), et chaque envoi WhatsApp nécessite le consentement préalable (opt-in) du patient, condition imposée par Meta.",
  },
  {
    question: "Combien de temps faut-il pour démarrer ?",
    answer:
      "La mise en place technique est rapide, mais les modèles de message doivent être validés par Meta avant le premier envoi — ce délai peut aller de quelques heures à quelques jours et ne dépend pas d'Ecotocare.",
  },
  {
    question: "Puis-je personnaliser les messages envoyés ?",
    answer:
      "Oui, dans les limites imposées par les modèles WhatsApp pré-approuvés par Meta. Le texte, le ton et les variables (nom, date, praticien) restent personnalisables depuis le dashboard.",
  },
  {
    question: "Quel est le coût des messages WhatsApp ?",
    answer:
      "Le coût par message dépend du fournisseur BSP choisi et du volume envoyé ; il s'agit d'un coût récurrent distinct du forfait de développement, détaillé séparément selon la taille de votre cabinet.",
  },
  {
    question: "Que se passe-t-il si un patient ne répond pas ?",
    answer:
      "Le rendez-vous reste visible avec une alerte visuelle dans le dashboard dès J-1 sans réponse, afin que la secrétaire puisse effectuer un appel de suivi manuel si nécessaire.",
  },
] as const;

export const testimonials = [
  {
    quote:
      "Nos patients confirment leur rendez-vous en un tap, directement dans WhatsApp.",
    name: "Dr. Bernard",
    role: "Cabinet à Lyon",
  },
  {
    quote:
      "Les relances automatiques nous ont fait gagner un temps fou sur les rappels manuels.",
    name: "Camille R.",
    role: "Secrétaire médicale, Nantes",
  },
  {
    quote:
      "Le dashboard est tellement simple que toute l'équipe l'utilise sans formation.",
    name: "Dr. Haddad",
    role: "Cabinet à Marseille",
  },
  {
    quote:
      "Moins d'appels, moins de créneaux perdus, plus de sérénité au quotidien.",
    name: "Sophie M.",
    role: "Secrétaire médicale, Bordeaux",
  },
  {
    quote:
      "Voir en un coup d'œil les rendez-vous sans réponse change notre organisation.",
    name: "Dr. Petit",
    role: "Cabinet à Toulouse",
  },
  {
    quote:
      "Nos patients apprécient de ne plus rater d'appel en pleine journée de travail.",
    name: "Léa D.",
    role: "Secrétaire médicale, Lille",
  },
  {
    quote: "La prise en main a pris moins d'une heure pour toute l'équipe.",
    name: "Dr. Nguyen",
    role: "Cabinet à Rennes",
  },
  {
    quote:
      "Les relances des patients inactifs nous ramènent des rendez-vous qu'on aurait perdus.",
    name: "Julie B.",
    role: "Secrétaire médicale, Strasbourg",
  },
  {
    quote: "Un outil pensé pour un usage quotidien, sans complexité inutile.",
    name: "Dr. Faure",
    role: "Cabinet à Nice",
  },
] as const;

export const resources = [
  {
    title: "Réduire les rendez-vous manqués au cabinet",
    excerpt:
      "Les leviers concrets pour faire baisser le taux de no-show, au-delà du simple rappel téléphonique.",
    tag: "Gestion de cabinet",
  },
  {
    title: "RGPD et données de santé : ce qu'il faut savoir",
    excerpt:
      "Consentement, chiffrement, traçabilité : les bonnes pratiques pour communiquer avec vos patients en toute conformité.",
    tag: "Conformité",
  },
  {
    title: "Comprendre WhatsApp Business API",
    excerpt:
      "Templates validés par Meta, fournisseurs BSP, opt-in patient : le fonctionnement expliqué simplement.",
    tag: "WhatsApp",
  },
] as const;

export const footerLinks = {
  produit: [
    { label: "Fonctionnalités", href: "#fonctionnalites" },
    { label: "Comment ça marche", href: "#comment-ca-marche" },
    { label: "Sécurité", href: "#securite" },
  ],
  ressources: [
    { label: "FAQ", href: "#faq" },
    { label: "Ressources", href: "#ressources" },
    { label: "Contact", href: "#contact" },
  ],
  legal: [
    { label: "Mentions légales", href: "#" },
    { label: "Politique de confidentialité", href: "#" },
    { label: "Conditions d'utilisation", href: "#" },
  ],
} as const;
