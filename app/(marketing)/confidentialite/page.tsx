import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ToConfirm } from "@/components/ui/ToConfirm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité d&apos;Ecotocare : données traitées, finalités, consentement WhatsApp, droits des personnes concernées.",
  alternates: {
    canonical: "/confidentialite",
  },
  robots: { index: true, follow: true },
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 text-xl font-semibold tracking-tight text-ink sm:text-2xl">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-base leading-relaxed text-ink-muted">{children}</p>;
}

export default function PrivacyPolicyPage() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
          {siteConfig.name}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Politique de confidentialité
        </h1>
        <p className="mt-2 text-sm text-ink-soft">Dernière mise à jour : 16 octobre 2026</p>

        <P>
          Ecotocare est un logiciel de rappel de rendez-vous et de relance de patients par WhatsApp, destiné aux
          établissements de santé. Il est édité par{" "}
          <ToConfirm>raison sociale complète de MarketYou à confirmer</ToConfirm>, dont le siège est situé à
          Bonamoussadi, Douala, Cameroun (« nous »). Contact : {siteConfig.contactEmail}, ou infos@marketsyou.com.
        </P>

        <H2>Deux situations à distinguer</H2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-ink-muted">
          <li>
            <strong className="text-ink">Visiteurs du site et demandes de démonstration&nbsp;:</strong> nous sommes
            responsables du traitement de vos données.
          </li>
          <li>
            <strong className="text-ink">Patients des cabinets utilisateurs&nbsp;:</strong> le cabinet est le
            responsable du traitement de vos données. Ecotocare agit comme sous-traitant, uniquement pour le compte
            du cabinet et selon ses instructions.
          </li>
        </ul>

        <H2>Les données que nous traitons</H2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-ink-muted">
          <li>
            <strong className="text-ink">Visiteurs&nbsp;:</strong> nom, adresse e-mail professionnelle, nom du
            cabinet et message envoyés via le formulaire de démonstration ou de contact, adresse e-mail
            d&apos;inscription à la lettre d&apos;information.
          </li>
          <li>
            <strong className="text-ink">Comptes des cabinets&nbsp;:</strong> nom et fonction des praticiens et du
            personnel, identifiants de connexion, journal des actions.
          </li>
          <li>
            <strong className="text-ink">Patients (pour le compte des cabinets)&nbsp;:</strong> nom, numéro de
            téléphone WhatsApp, date, heure et praticien du rendez-vous, statut du rendez-vous (confirmé, à
            reporter, sans réponse), contenu des réponses aux messages, preuve du consentement (opt-in) et sa date.
          </li>
        </ul>
        <P>
          Le fait qu&apos;une personne ait rendez-vous dans un établissement de santé révèle une information sur sa
          santé. Ces données sont donc traitées comme des données sensibles.
        </P>

        <H2>Pourquoi nous les utilisons</H2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-surface text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-5 py-3">Finalité</th>
                <th className="px-5 py-3">Base</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface-raised">
              <tr>
                <td className="px-5 py-3 text-ink">Répondre aux demandes de démonstration et de contact</td>
                <td className="px-5 py-3 text-ink-muted">Votre demande, intérêt légitime</td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-ink">Fournir le service aux cabinets (compte, support, facturation)</td>
                <td className="px-5 py-3 text-ink-muted">Exécution du contrat</td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-ink">
                  Envoyer des rappels de rendez-vous et des relances aux patients par WhatsApp
                </td>
                <td className="px-5 py-3 text-ink-muted">Consentement du patient (opt-in), recueilli par le cabinet</td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-ink">Sécurité, journalisation des envois, prévention des abus</td>
                <td className="px-5 py-3 text-ink-muted">Intérêt légitime, obligation légale</td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-ink">Lettre d&apos;information, si vous vous y inscrivez</td>
                <td className="px-5 py-3 text-ink-muted">Votre consentement</td>
              </tr>
            </tbody>
          </table>
        </div>

        <H2>Consentement et arrêt des messages</H2>
        <P>
          Aucun message WhatsApp n&apos;est envoyé à un patient sans son consentement préalable. Le patient peut à tout
          moment cesser de recevoir nos messages en répondant <strong className="text-ink">« STOP »</strong> ou en
          le demandant à son cabinet. Nous cessons alors les envois.
        </P>

        <H2>Avec qui partageons-nous les données&nbsp;?</H2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-ink-muted">
          <li>
            <strong className="text-ink">Meta Platforms (WhatsApp Business Platform)&nbsp;:</strong> acheminement
            des messages. Meta traite les données selon ses propres conditions.
          </li>
          <li>
            <strong className="text-ink">Hébergeur&nbsp;:</strong> OVH SAS (France).
          </li>
          <li>
            <strong className="text-ink">Autres sous-traitants&nbsp;:</strong> service d&apos;envoi d&apos;e-mails pour les
            demandes de contact et la lettre d&apos;information.
          </li>
        </ul>
        <P>Nous ne vendons pas les données personnelles.</P>

        <H2>Transferts de données hors du Cameroun</H2>
        <P>
          Le service utilise WhatsApp (Meta) et notre hébergeur OVH SAS, dont les infrastructures sont situées en
          France. Ces transferts sont encadrés par{" "}
          <ToConfirm>les garanties prévues par la loi n° 2024/017, à préciser avec un juriste</ToConfirm>.
        </P>

        <H2>Durée de conservation</H2>
        <P>
          <ToConfirm>
            Durées à définir avec les cabinets et un juriste. Structure proposée : données de rendez-vous
            conservées un certain nombre de mois après le dernier rendez-vous ; journaux de messages conservés une
            durée limitée ; données de compte conservées pendant la durée du contrat puis une durée limitée.
          </ToConfirm>
        </P>

        <H2>Sécurité</H2>
        <P>
          Les données sont chiffrées au repos (base de données) et en transit (HTTPS). L&apos;accès est limité par rôle
          (secrétaire, praticien). Les envois sont journalisés.
        </P>

        <H2>Patients mineurs</H2>
        <P>
          <ToConfirm>
            À confirmer avec les cabinets : pour un patient mineur, les messages sont adressés au parent ou au
            tuteur dont le cabinet détient le numéro.
          </ToConfirm>
        </P>

        <H2>Vos droits</H2>
        <P>
          Conformément à la loi n° 2024/017 du 23 décembre 2024 relative à la protection des données à caractère
          personnel, vous pouvez demander l&apos;accès à vos données, leur rectification, leur effacement, vous opposer
          à leur traitement et retirer votre consentement à tout moment.
        </P>
        <P>
          Si vous êtes patient, adressez d&apos;abord votre demande à votre cabinet. Vous pouvez aussi nous écrire à
          infos@marketsyou.com. Vous pouvez enfin saisir l&apos;Autorité de protection des données à caractère personnel
          du Cameroun.
        </P>

        <H2>Cookies</H2>
        <P>Ce site n&apos;utilise pas de cookies de suivi (mesure d&apos;audience publicitaire ou profilage).</P>

        <H2>Modifications</H2>
        <P>Nous pouvons mettre à jour cette politique. La date en tête de page indique la dernière version en vigueur.</P>
      </Container>
    </section>
  );
}
