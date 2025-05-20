import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, ShoppingBag, Users, Settings } from "lucide-react";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: ShoppingBag, label: "Products", href: "/products" },
    { icon: Users, label: "Customers", href: "/customers" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-4 bg-secondary p-4">
      <div className="flex items-center gap-2 px-2 py-4">
        <img src="/coldop-logo.png" alt="Coldop Logo" className="h-8 w-8" />
        <span className="font-custom text-xl font-semibold text-foreground">Coldop</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-primary hover:text-secondary",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </ScrollArea>
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
          "fixed inset-y-0 left-0 z-50 hidden w-64 border-r bg-secondary md:block",
          className
        )}
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
