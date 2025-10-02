import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Heart, 
  BookOpen, 
  Gamepad2, 
  Camera, 
  Calendar, 
  User, 
  Settings, 
  Menu,
  Home,
  Video,
  TestTube
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/diary", label: "Our Diary", icon: BookOpen },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/memories", label: "Memories", icon: Camera },
  { href: "/activities", label: "Activities", icon: Calendar },
  { href: "/meet-up", label: "Meet Up", icon: Video },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/test-features", label: "Test Features", icon: TestTube },
];

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const NavLink = ({ href, label, icon: Icon, mobile = false }: any) => (
    <Link
      to={href}
      onClick={() => mobile && setIsOpen(false)}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
        "hover:bg-white/10 hover:shadow-gentle",
        location.pathname === href
          ? "bg-white/20 text-white shadow-gentle"
          : "text-white/80 hover:text-white",
        mobile && "w-full justify-start"
      )}
    >
      <Icon className="h-4 w-4" />
      <span className={cn("font-medium", !mobile && "hidden lg:block")}>
        {label}
      </span>
    </Link>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-romantic backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-white">
              <div className="bg-white/20 p-2 rounded-lg animate-heartbeat">
                <Heart className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold hidden sm:block">LoveConnect</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navigationItems.slice(0, -2).map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1">
                {navigationItems.slice(-2).map((item) => (
                  <NavLink key={item.href} {...item} />
                ))}
              </div>

              {/* Mobile Menu Button */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 bg-gradient-romantic border-l border-white/10">
                  <div className="py-6">
                    <div className="flex items-center gap-2 text-white mb-8">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Heart className="h-6 w-6" />
                      </div>
                      <span className="text-xl font-bold">LoveConnect</span>
                    </div>

                    <div className="space-y-2">
                      {navigationItems.map((item) => (
                        <NavLink key={item.href} {...item} mobile />
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};