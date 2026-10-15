"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "fr" | "en";

const STORAGE_KEY = "ecotocare_locale";

// Le français est la langue source, écrite directement dans les composants
// (fallback passé à t()). Seul l'anglais est stocké ici — évite de dupliquer
// et de désynchroniser le texte français déjà présent dans le code.
const en: Record<string, string> = {
  // Navbar
  "nav.features": "Features",
  "nav.howItWorks": "How it works",
  "nav.security": "Security",
  "nav.faq": "FAQ",
  "nav.resources": "Resources",
  "nav.contact": "Contact",
  "nav.login": "Sign in",
  "nav.demo": "Request a demo",
  "nav.myAccount": "My account",
  "nav.logout": "Log out",
  "nav.openMenu": "Open menu",
  "nav.closeMenu": "Close menu",
  "nav.notYetAccount": "Don't have an account yet?",
  "nav.createAccount": "Create an account",

  // Hero
  "hero.badge": "New",
  "hero.discover": "Discover {name}",
  "hero.title": "Never miss another patient appointment",
  "hero.subtitle": "{name} automatically sends appointment reminders and re-engages inactive patients via WhatsApp — the channel your patients already check every day.",
  "hero.cta.demo": "Request a demo",
  "hero.cta.contact": "Contact the team",

  // Langue
  "lang.switch": "Switch language",

  "hero.checklist.0": "Up to -30% missed appointments",
  "hero.checklist.1": "Automatic re-engagement of inactive patients",
  "hero.checklist.2": "100% web, no installation",

  // Trust bar
  "trust.eyebrow": "WhatsApp Business API (Meta)",
  "trust.title.part1": "Secure, compliant messaging,",
  "trust.title.part2": "compliant",
  "trust.title.part3": "with no commitment",
  "trust.description": "A clear framework for your service: data security, GDPR compliance, and compatibility with every browser.",
  "trust.badge": "Secure & certified",
  "trust.api.title": "WhatsApp Business API (Meta)",
  "trust.api.description": "Messaging routed through a Meta-certified BSP provider.",
  "trust.gdpr.title": "GDPR & health data compliant",
  "trust.gdpr.description": "Encryption at rest and in transit, patient consent (opt-in).",
  "trust.noCommitment.title": "No commitment",
  "trust.noCommitment.description": "One account per practice, cancel anytime.",
  "trust.browsers.title": "Works on every browser",
  "trust.browsers.description": "Chrome, Firefox, Edge — desktop and tablet.",

  // Value proposition
  "valueProp.eyebrow": "Why WhatsApp",
  "valueProp.title": "More than a simple SMS reminder",
  "valueProp.description": "Unanswered calls and ignored texts cost time and appointments. WhatsApp changes that: the message gets read, and the patient's reply updates your dashboard automatically.",
  "valueProp.imageAlt": "Why WhatsApp - Ecotocare",
  "valueProp.point1.title": "Fewer follow-up calls",
  "valueProp.point1.description": "The reminder goes out automatically at D-2 and D-1: your secretary can focus on the cases with no response.",
  "valueProp.point2.title": "A channel patients already use",
  "valueProp.point2.description": "98% of patients check WhatsApp every day, versus a text message that's often ignored or a missed call.",
  "valueProp.point3.title": "A reply in one tap",
  "valueProp.point3.description": "Confirming or rescheduling an appointment takes a single message, right from the conversation.",

  // Features
  "features.eyebrow": "Features",
  "features.title": "A tool built for your practice",
  "features.description": "Every feature answers a concrete need: fewer no-shows, more re-engaged patients, a team that stays in control.",
  "features.reminders.title": "Appointment reminders",
  "features.reminders.description": "Automatic WhatsApp message 48h then 24h before each appointment, with a one-tap patient reply.",
  "features.relance.title": "Re-engaging inactive patients",
  "features.relance.description": "Automatic detection of patients overdue for their recommended care, with a follow-up message sent automatically.",
  "features.confirm.title": "One-click confirmation",
  "features.confirm.description": "The patient confirms or requests a reschedule directly in WhatsApp — no phone call, no text message.",
  "features.dashboard.title": "Real-time dashboard",
  "features.dashboard.description": "Day and week views, appointment statuses, and alerts for appointments with no response.",
  "features.patientCard.title": "Patient record & history",
  "features.patientCard.description": "Full history of appointments, messages sent and replies, for every patient.",
  "features.security.title": "Security & compliance",
  "features.security.description": "Role-based access control, a log of every message sent, and tracked patient consent.",

  // How it works
  "steps.eyebrow": "Getting started",
  "steps.title": "How does it work?",
  "steps.description": "Three steps are all it takes for your practice to switch to automatic WhatsApp reminders.",
  "steps.create.title": "Create your practice",
  "steps.create.description": "Sign up your practice, add your practitioners, and connect your WhatsApp Business number.",
  "steps.configure.title": "Set your rules",
  "steps.configure.description": "Define the reminder delays (D-2, D-1) and the follow-up frequency by type of care.",
  "steps.follow.title": "Track your patients",
  "steps.follow.description": "The dashboard updates automatically as replies come in on WhatsApp.",

  // Feature highlight
  "highlight.eyebrow": "Automation",
  "highlight.title": "Reminders that never sleep",
  "highlight.description": "Ecotocare's scheduled task system triggers reminders and follow-ups at the right time, with no manual work — and logs every message for full traceability.",
  "highlight.checklist.0": "Automatic reminders 48h and 24h before every appointment",
  "highlight.checklist.1": "Follow-ups for inactive patients, configurable by type of care",
  "highlight.checklist.2": "Appointment status updated in real time on the dashboard",
  "highlight.checklist.3": "Visual alert for appointments with no response by D-1",
  "highlight.imageAlt": "Patient receiving a WhatsApp appointment reminder and confirming it in one tap",

  // CTA banner
  "cta.title": "Ready to cut down on missed appointments?",
  "cta.description": "Request a personalized demo and see how Ecotocare fits into your schedule and your WhatsApp Business number within a few days.",
  "cta.secondaryButton": "Read the FAQ",

  // FAQ
  "faq.eyebrow": "Frequently asked questions",
  "faq.title": "What practices ask us the most",
  "faq.description": "Patient consent, compliance, WhatsApp costs: answers to the most common questions before getting started.",
  "faq.app.question": "Do patients need to install an app?",
  "faq.app.answer": "No. Patients receive and reply to messages directly in WhatsApp, the app they already use every day. No installation required on the patient's side.",
  "faq.gdpr.question": "Is it GDPR and health-data compliant?",
  "faq.gdpr.answer": "Yes. Patient data is encrypted at rest and in transit (HTTPS), access is role-based (secretary / practitioner), and every WhatsApp message requires the patient's prior consent (opt-in) — a condition imposed by Meta.",
  "faq.start.question": "How long does it take to get started?",
  "faq.start.answer": "The technical setup is quick, but message templates must be approved by Meta before the first send — this can take anywhere from a few hours to a few days, and is outside Ecotocare's control.",
  "faq.customize.question": "Can I customize the messages sent?",
  "faq.customize.answer": "Yes, within the limits of Meta's pre-approved WhatsApp templates. The wording, tone, and variables (name, date, practitioner) stay customizable from the dashboard.",
  "faq.cost.question": "What do WhatsApp messages cost?",
  "faq.cost.answer": "The cost per message depends on the BSP provider chosen and the volume sent; it's a recurring cost, separate from the development plan, detailed individually based on the size of your practice.",
  "faq.noResponse.question": "What happens if a patient doesn't reply?",
  "faq.noResponse.answer": "The appointment stays visible with a visual alert on the dashboard from D-1 with no response, so the secretary can make a manual follow-up call if needed.",

  // Resources
  "resources.eyebrow": "Resources",
  "resources.title": "Go further",
  "resources.description": "Practical guidance on practice management, compliance, and WhatsApp Business — coming soon to our resource center.",
  "resources.comingSoon": "Coming soon",
  "resources.noShow.title": "Reducing missed appointments at your practice",
  "resources.noShow.excerpt": "Concrete levers to lower your no-show rate, beyond the simple phone reminder.",
  "resources.noShow.tag": "Practice management",
  "resources.gdpr.title": "GDPR and health data: what you need to know",
  "resources.gdpr.excerpt": "Consent, encryption, traceability: best practices for communicating with your patients while staying compliant.",
  "resources.gdpr.tag": "Compliance",
  "resources.whatsapp.title": "Understanding the WhatsApp Business API",
  "resources.whatsapp.excerpt": "Meta-approved templates, BSP providers, patient opt-in: how it all works, explained simply.",
  "resources.whatsapp.tag": "WhatsApp",

  // Public reviews
  "reviews.title": "What our users say",
  "reviews.subtitle": "Verified feedback from practices using Ecotocare every day.",
  "reviews.empty": "No reviews published yet.",
  "reviews.thanks": "Thanks for your review! It will appear here once our team has approved it.",
  "reviews.placeholderName": "Your name",
  "reviews.placeholderRole": "Role / practice (optional)",
  "reviews.placeholderMessage": "Your review...",
  "reviews.submit": "Submit my review",
  "reviews.leave": "Leave a review",
  "reviews.reactError": "Couldn't save your reaction",
  "reviews.submitError": "Failed to submit your review",

  // Newsletter
  "newsletter.invalidEmail": "Please enter a valid email.",
  "newsletter.genericError": "Something went wrong.",
  "newsletter.serverError": "Couldn't reach the server. Please try again.",
  "newsletter.title": "Stay up to date with Ecotocare",
  "newsletter.description": "Practical tips, new features, and best practices for your practice — straight to your inbox.",
  "newsletter.success": "Subscription confirmed — thank you!",
  "newsletter.sending": "Sending...",
  "newsletter.subscribe": "Subscribe",
  "newsletter.disclaimer": "No spam. Unsubscribe anytime.",

  // Contact
  "contact.email.title": "By email",
  "contact.responseTime.title": "Response time",
  "contact.responseTime.detail": "Within 24 business hours",
  "contact.zone.title": "Coverage area",
  "contact.zone.detail": "Healthcare facilities, France",
  "contact.eyebrow": "Contact",
  "contact.title": "Let's talk about your practice",
  "contact.description": "A question, a demo to schedule, a specific need? Tell us about your practice and our team will get back to you quickly.",
  "contact.field.name": "Full name",
  "contact.field.email": "Professional email",
  "contact.field.clinic": "Practice name",
  "contact.field.phone": "Phone (optional)",
  "contact.field.subject": "Subject",
  "contact.field.message": "Message",
  "contact.placeholder.name": "Dr. Amina Kader",
  "contact.placeholder.clinic": "Parc Health Center",
  "contact.placeholder.subject": "Demo request, product question...",
  "contact.placeholder.message": "Tell us about your practice and your appointment reminder needs...",
  "contact.sending": "Sending...",
  "contact.send": "Send message",
  "contact.success": "Thank you! We'll get back to you within 24 business hours.",
  "contact.error": "Please fill in your name, a valid email, and a message.",

  // Footer
  "footer.newsletter.title": "Follow {name} news",
  "footer.newsletter.description": "Leave your professional email, we'll get back to you quickly to arrange a demo.",
  "footer.newsletter.emailLabel": "Professional email address",
  "footer.newsletter.sending": "Sending...",
  "footer.newsletter.subscribe": "Notify me",
  "footer.newsletter.success": "Thank you! We'll be in touch very soon.",
  "footer.newsletter.invalidEmail": "Please enter a valid email address.",
  "footer.column.product": "Product",
  "footer.column.resources": "Resources",
  "footer.column.legal": "Legal",
  "footer.rights": "All rights reserved.",
  "footer.poweredBy": "Solution built by MarketYou · Messaging routed through a Meta-certified WhatsApp Business (BSP) provider.",
  "footer.legal.notice": "Legal notice",
  "footer.legal.privacy": "Privacy policy",
  "footer.legal.terms": "Terms of use",
  "footer.links.features": "Features",
  "footer.links.howItWorks": "How it works",
  "footer.links.security": "Security",
  "footer.links.faq": "FAQ",
  "footer.links.resources": "Resources",
  "footer.links.contact": "Contact",
};

const dictionaries: Record<Locale, Record<string, string>> = { fr: {}, en };

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback: string, vars?: Record<string, string>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function interpolate(text: string, vars?: Record<string, string>) {
  if (!vars) return text;
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
    text
  );
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "fr") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydratation depuis localStorage, indisponible côté serveur
      setLocaleState(stored);
    }
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }

  function t(key: string, fallback: string, vars?: Record<string, string>) {
    const text = locale === "fr" ? fallback : (dictionaries.en[key] ?? fallback);
    return interpolate(text, vars);
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
