import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, ShoppingBag, Users, Settings } from "lucide-react";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const menuItems = [
    { icon: Home, labelKey: "erpFooter.daybook", href: "/erp/daybook" },
    { icon: Users, labelKey: "erpFooter.people", href: "/erp/people" },
    { icon: ShoppingBag, labelKey: "erpFooter.analytics", href: "/erp/analytics" },
    { icon: Settings, labelKey: "erpFooter.settings", href: "/erp/settings" },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-secondary">
      {/* Logo Section with subtle gradient border */}
      <div className="relative border-b border-gray-200/30 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="overflow-hidden rounded-xl bg-primary/10 p-1.5">
            <img src="/coldop-logo.png" alt="Coldop Logo" className="h-8 w-8" />
          </div>
          <span className="font-custom text-xl font-semibold tracking-tight text-gray-900">
            Coldop
          </span>
        </div>
      </div>

      {/* Navigation Section */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 hover:bg-primary/10 hover:text-primary",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive
                    ? ""
                    : "group-hover:scale-110 group-hover:text-primary"
                )} />
                <span className="font-medium">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Subtle Branding Footer */}
      <div className="border-t border-gray-200/30 bg-gray-50/30 px-6 py-3">
        <p className="text-center text-xs text-gray-400">powered by coldop</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar - Commented out as we're using ErpFooter for mobile navigation
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
      */}

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-gray-200/30 bg-secondary shadow-sm md:block",
          className
        )}
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
