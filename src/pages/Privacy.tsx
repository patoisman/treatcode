import { LegalLayout } from "@/features/legal/components/LegalLayout";
import { privacyPolicy } from "@/features/legal/content/privacy";

export default function Privacy() {
  return <LegalLayout document={privacyPolicy} />;
}
