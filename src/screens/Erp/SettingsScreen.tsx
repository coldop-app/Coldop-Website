import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { ChangeEvent } from "react";

const SettingsScreen = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  // Mock data - in real app would come from API/store
  const [settings, setSettings] = useState({
    companyName: "Coldop Storage",
    email: "admin@coldop.com",
    phone: "+1234567890",
    address: "123 Cold Storage Lane",
    temperatureUnit: "celsius",
    notifications: {
      temperatureAlerts: true,
      capacityAlerts: true,
      maintenanceReminders: true,
      paymentReminders: true
    },
    billing: {
      currency: "USD",
      taxRate: "18",
      paymentTerms: "30"
    }
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Mock API call - would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(t("settings.saveSuccess"));
    } catch (error) {
      toast.error(t("settings.saveError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h2>
        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">{t("settings.tabs.general")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("settings.tabs.notifications")}</TabsTrigger>
          <TabsTrigger value="billing">{t("settings.tabs.billing")}</TabsTrigger>
          <TabsTrigger value="storage">{t("settings.tabs.storage")}</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.general.title")}</CardTitle>
              <CardDescription>
                {t("settings.general.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">{t("settings.general.companyName")}</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSettings({...settings, companyName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("settings.general.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSettings({...settings, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("settings.general.phone")}</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSettings({...settings, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t("settings.general.address")}</Label>
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperatureUnit">{t("settings.general.temperatureUnit")}</Label>
                <Select
                  value={settings.temperatureUnit}
                  onValueChange={(value) => setSettings({...settings, temperatureUnit: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.general.selectTemperatureUnit")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celsius">{t("settings.general.celsius")}</SelectItem>
                    <SelectItem value="fahrenheit">{t("settings.general.fahrenheit")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.notifications.title")}</CardTitle>
              <CardDescription>
                {t("settings.notifications.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.notifications.temperatureAlerts")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.notifications.temperatureAlertsDesc")}
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.temperatureAlerts}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, temperatureAlerts: checked }
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.notifications.capacityAlerts")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.notifications.capacityAlertsDesc")}
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.capacityAlerts}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, capacityAlerts: checked }
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.notifications.maintenanceReminders")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.notifications.maintenanceRemindersDesc")}
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.maintenanceReminders}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, maintenanceReminders: checked }
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.notifications.paymentReminders")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.notifications.paymentRemindersDesc")}
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.paymentReminders}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, paymentReminders: checked }
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.billing.title")}</CardTitle>
              <CardDescription>
                {t("settings.billing.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">{t("settings.billing.currency")}</Label>
                <Select
                  value={settings.billing.currency}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      billing: { ...settings.billing, currency: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.billing.selectCurrency")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">{t("settings.billing.taxRate")}</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={settings.billing.taxRate}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      billing: { ...settings.billing, taxRate: e.target.value }
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">{t("settings.billing.paymentTerms")}</Label>
                <Input
                  id="paymentTerms"
                  type="number"
                  value={settings.billing.paymentTerms}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      billing: { ...settings.billing, paymentTerms: e.target.value }
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.storage.title")}</CardTitle>
              <CardDescription>
                {t("settings.storage.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t("settings.storage.adminApprovalRequired")}
              </p>
              <Button variant="outline" disabled>
                {t("settings.storage.requestChanges")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? t("settings.saving") : t("settings.saveChanges")}
        </Button>
      </div>
    </div>
  );
};

export default SettingsScreen;