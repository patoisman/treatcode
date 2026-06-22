import { Gift } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Gift className="h-6 w-6" />
            <span className="text-xl font-bold">Treatcode</span>
          </div>

          {/* Links + contact */}
          <div className="flex flex-col items-center gap-3 text-primary-foreground/90 text-sm">
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
            </div>
            <p className="text-xs opacity-90 text-center">
              Need help? Contact us at{" "}
              <a
                href="mailto:treatcode@treatcode.com"
                className="underline underline-offset-2 hover:text-white transition-colors"
              >
                treatcode@treatcode.com
              </a>
            </p>
          </div>

          {/* Legal */}
          <div className="text-primary-foreground/70 text-sm text-center md:text-right">
            <p>© 2026 Treat Code Ltd. All rights reserved.</p>
            <p className="mt-2 text-xs opacity-80">
              Treat Code Ltd is registered in the UK (16429228)
            </p>
            <p className="mt-1 text-xs opacity-80 max-w-md ml-auto">
              Treat Code Ltd is a Limited Network Exclusion company as defined
              by the Financial Conduct Authority FCA
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
