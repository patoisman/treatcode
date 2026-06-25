import { LegalLayout } from "@/features/legal/components/LegalLayout";
import { termsOfService } from "@/features/legal/content/terms";

export default function Terms() {
  return <LegalLayout document={termsOfService} />;
}
