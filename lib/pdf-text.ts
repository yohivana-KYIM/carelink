// Extraction de texte depuis un PDF, côté navigateur uniquement (pdfjs-dist
// est importé dynamiquement pour ne jamais être inclus dans le bundle serveur).
export async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const lines: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    // Regroupe les fragments de texte par ligne visuelle (même position Y
    // approximative) plutôt que de les concaténer dans l'ordre d'extraction,
    // qui mélange souvent les colonnes d'un tableau.
    const rowsByY = new Map<number, string[]>();
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 3) * 3;
      const row = rowsByY.get(y) ?? [];
      row.push(item.str);
      rowsByY.set(y, row);
    }

    const sortedY = [...rowsByY.keys()].sort((a, b) => b - a);
    for (const y of sortedY) {
      lines.push(rowsByY.get(y)!.join(" ").replace(/\s+/g, " ").trim());
    }
  }

  return lines.filter((l) => l.length > 0).join("\n");
}
