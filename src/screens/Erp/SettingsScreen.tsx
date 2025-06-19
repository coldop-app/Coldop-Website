import { useNavigate } from "react-router-dom";
import { UserCircle, CreditCard, HelpCircle, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const SettingsScreen = () => {
  const navigate = useNavigate();

  const settingsOptions = [
    {
      title: "Profile Settings",
      description: "Manage your personal and cold storage information",
      icon: UserCircle,
      path: "/erp/settings/profile",
      color: "text-blue-500"
    },
    {
      title: "Billing Settings",
      description: "View and manage your billing information and subscriptions",
      icon: CreditCard,
      path: "/erp/settings/billing",
      color: "text-green-500"
    },
    {
      title: "Contact Support",
      description: "Get help from our support team",
      icon: HelpCircle,
      path: "/erp/settings/support",
      color: "text-purple-500"
    }
  ];

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-4">
        {settingsOptions.map((option) => (
          <Card
            key={option.title}
            className="group cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate(option.path)}
          >
            <CardHeader className="flex flex-row items-center justify-between p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full bg-background border ${option.color}`}>
                  <option.icon size={24} />
                </div>
                <div>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {option.description}
                  </CardDescription>
                </div>
              </div>
              <ChevronRight
                className="text-muted-foreground transition-transform group-hover:translate-x-1"
                size={20}
              />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SettingsScreen;
