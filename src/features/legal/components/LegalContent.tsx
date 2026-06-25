import type { LegalBlock, LegalSection } from "../types";

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") {
    return <p className="text-muted-foreground leading-relaxed">{block}</p>;
  }
  return (
    <ul className="list-disc space-y-2 pl-6 text-muted-foreground leading-relaxed marker:text-primary">
      {block.list.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

interface LegalContentProps {
  sections: LegalSection[];
}

export function LegalContent({ sections }: LegalContentProps) {
  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <section key={section.heading} className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            {section.heading}
          </h2>
          {section.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </section>
      ))}
    </div>
  );
}
