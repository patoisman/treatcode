import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gift, LogOut, Menu, User, LogIn, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/common/BrandMark";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSession } from "@/features/auth/hooks/useSession";
import { useProfile } from "@/features/auth/hooks/useProfile";
import { useSignOut } from "@/features/auth/hooks/useSignOut";
import { setAdminLanding } from "@/features/admin/lib/adminLanding";

export function Header() {
  const { session } = useSession();
  const { data: profile } = useProfile();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !!session;
  // Greet with the first name only — friendlier and less cluttered than full name.
  const displayName = profile?.full_name?.trim().split(/\s+/)[0] || profile?.email;

  const handleSignOut = async () => {
    try {
      await signOut.mutateAsync();
      setMobileOpen(false);
      navigate("/");
    } catch {
      toast.error("Sign out failed");
    }
  };

  const handleNavigate = (path: string) => {
    // Remember an admin's last explicit area choice so sign-in lands them back
    // where they prefer (see adminLanding / SignIn redirect).
    if (profile?.is_admin && profile.id) {
      if (path === "/admin") setAdminLanding(profile.id, "admin");
      else if (path === "/dashboard") setAdminLanding(profile.id, "dashboard");
    }
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xs border-b border-border/50 transition-all duration-300">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button
          type="button"
          aria-label="Treatcode home"
          className="flex items-center space-x-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => handleNavigate(isAuthenticated ? "/dashboard" : "/")}
        >
          <BrandMark className="h-8 w-8" />
          <span
            className="text-3xl font-bold bg-clip-text text-transparent"
            style={{ background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            Treatcode
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground">Welcome, {displayName}</span>
              {/* Prominent way back into the app. Routes to /dashboard; ProtectedRoute
                  redirects users with incomplete onboarding to /onboarding, which resumes
                  their step — so this always lands them wherever they left off. */}
              <Button size="sm" onClick={() => handleNavigate("/dashboard")}>
                <Gift className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
              {profile?.is_admin && (
                <Button variant="outline" size="sm" onClick={() => handleNavigate("/admin")}>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={signOut.isPending}>
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild><Link to="/signin">Sign In</Link></Button>
              <Button asChild><Link to="/signup">Get Started</Link></Button>
            </>
          )}
        </nav>

        {/* Mobile nav */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-12 w-12 [&_svg]:size-8">
                <Menu /><span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader><SheetTitle>Menu</SheetTitle></SheetHeader>
              <div className="flex flex-col space-y-4 mt-6">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground px-2">
                      <User className="h-4 w-4" /><span>{displayName}</span>
                    </div>
                    {profile?.is_admin && (
                      <Button variant="ghost" className="justify-start" onClick={() => handleNavigate("/admin")}>
                        <ShieldCheck className="mr-2 h-4 w-4" />Admin
                      </Button>
                    )}
                    <Button variant="ghost" className="justify-start" onClick={() => handleNavigate("/dashboard")}>
                      <Gift className="mr-2 h-4 w-4" />Dashboard
                    </Button>
                    <Button variant="ghost" className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleSignOut} disabled={signOut.isPending}>
                      <LogOut className="mr-2 h-4 w-4" />Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="justify-start" onClick={() => handleNavigate("/signin")}>
                      <LogIn className="mr-2 h-4 w-4" />Sign In
                    </Button>
                    <Button className="w-full" onClick={() => handleNavigate("/signup")}>Get Started</Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
