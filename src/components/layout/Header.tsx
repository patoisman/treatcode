import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gift, LogOut, Menu, User, LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
    navigate("/");
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const displayName = user?.full_name || user?.email;

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xs border-b border-border/50 transition-all duration-300">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => handleNavigate(isAuthenticated ? "/dashboard" : "/")}
        >
          <Gift className="h-8 w-8 text-primary" />
          <span className="text-3xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Treatcode
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground">
                Welcome, {displayName}
              </span>
              {user?.is_admin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigate("/admin")}
                  className="flex items-center space-x-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={() => handleNavigate("/dashboard")}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile nav */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-12 w-12 [&_svg]:size-8">
                <Menu />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-6">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground px-2">
                      <User className="h-4 w-4" />
                      <span>{displayName}</span>
                    </div>
                    {user?.is_admin && (
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => handleNavigate("/admin")}
                      >
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Admin
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleNavigate("/dashboard")}
                    >
                      <Gift className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleNavigate("/auth")}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => handleNavigate("/auth")}
                    >
                      Get Started
                    </Button>
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
