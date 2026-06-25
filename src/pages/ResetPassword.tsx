import { BrandMark } from "@/components/common/BrandMark";
import { ResetPasswordCard } from "@/features/auth/components/ResetPasswordCard";

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BrandMark className="h-12 w-12 mr-3" />
            <h1 className="text-4xl font-bold text-primary">Treatcode</h1>
          </div>
          <p className="text-muted-foreground">Your guilt-free spending stash</p>
        </div>
        <ResetPasswordCard />
      </div>
    </div>
  );
}
