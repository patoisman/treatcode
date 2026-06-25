// A block is either a paragraph (string) or a bulleted list ({ list }).
export type LegalBlock = string | { list: string[] };

export interface LegalSection {
  heading: string;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  title: string;
  /** Human-readable effective date, e.g. "24 June 2026". */
  lastUpdated: string;
  /** Lead paragraph(s) shown before the numbered sections. */
  intro: string[];
  sections: LegalSection[];
}
