// Analyse heuristique de texte extrait d'un PDF pour en tirer des lignes
// patient (nom + téléphone + email optionnel). Contrairement à un import
// CSV (format structuré et fiable), un PDF n'a pas de colonnes garanties :
// chaque ligne détectée doit donc être relue et corrigée par l'utilisateur
// avant import — jamais importée silencieusement.
export type ParsedPatientRow = {
  fullName: string;
  phoneNumber: string;
  email?: string;
};

const PHONE_REGEX = /(\+?\d[\d\s().-]{5,}\d)/;
const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[\w.-]+/;

export function parsePatientRowsFromText(text: string): {
  rows: ParsedPatientRow[];
  skippedLines: number;
} {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const rows: ParsedPatientRow[] = [];
  let skippedLines = 0;

  for (const line of lines) {
    const phoneMatch = line.match(PHONE_REGEX);
    if (!phoneMatch) {
      skippedLines++;
      continue;
    }

    const phoneDigits = phoneMatch[0].replace(/\D/g, "");
    if (phoneDigits.length < 8) {
      skippedLines++;
      continue;
    }
    const phoneNumber = phoneMatch[0].startsWith("+")
      ? `+${phoneDigits}`
      : phoneDigits;

    const emailMatch = line.match(EMAIL_REGEX);
    const email = emailMatch?.[0];

    let rest = line.replace(phoneMatch[0], "");
    if (email) rest = rest.replace(email, "");
    const fullName = rest
      .replace(/[,;|\t]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (fullName.length < 2) {
      skippedLines++;
      continue;
    }

    rows.push({ fullName, phoneNumber, email });
  }

  return { rows, skippedLines };
}
