import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Home,
  Box,
  Users,
  Package,
  Settings as SettingsIcon,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Thermometer,
  Clock,
  Search,
  Filter,
  Download,
} from "lucide-react";
import TopBar from "@/components/common/Topbar/Topbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DaybookScreen2 = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <TopBar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          title="DaybookScreen2"
        />
        <div className="flex flex-1">
          <Sidebar className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col p-0">
            <div className="px-8 pt-8 pb-4">
              <h1 className="text-2xl font-bold">Coldop Admin</h1>
            </div>
            <div className="border-t border-sidebar-border mb-2" />
            <SidebarContent className="flex-1 px-4 pt-6">
              <SidebarMenu className="flex flex-col gap-8">
                <SidebarMenuItem>
                  <SidebarMenuButton className="font-custom text-base gap-3" isActive>
                    <Home className="mr-1" />
                    Dashboard
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="font-custom text-base gap-3">
                    <Box className="mr-1" />
                    Cold-storages
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="font-custom text-base gap-3">
                    <Users className="mr-1" />
                    Farmers
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="font-custom text-base gap-3">
                    <Package className="mr-1" />
                    Inventory
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="font-custom text-base gap-3">
                    <SettingsIcon className="mr-1" />
                    Settings
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <main className="flex-1 p-8">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-9 bg-background"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card className="bg-background border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium font-custom">Total Orders</CardTitle>
                  <Package className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-custom">24</div>
                  <p className="text-xs text-muted-foreground">+2 from yesterday</p>
                </CardContent>
              </Card>
              <Card className="bg-background border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium font-custom">Incoming Orders</CardTitle>
                  <ArrowDownLeft className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-custom">12</div>
                  <p className="text-xs text-muted-foreground">+3 from yesterday</p>
                </CardContent>
              </Card>
              <Card className="bg-background border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium font-custom">Outgoing Orders</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-custom">12</div>
                  <p className="text-xs text-muted-foreground">-1 from yesterday</p>
                </CardContent>
              </Card>
              <Card className="bg-background border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium font-custom">Storage Capacity</CardTitle>
                  <Thermometer className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-custom">75%</div>
                  <p className="text-xs text-muted-foreground">18,000/24,000 units</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="bg-background border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-custom">Recent Incoming Orders</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    New
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((order) => (
                      <div key={order} className="flex items-center justify-between border-b border-border pb-4 last:border-0">
                        <div className="space-y-1">
                          <p className="text-sm font-medium font-custom">Order #{1000 + order}</p>
                          <p className="text-xs text-muted-foreground">Frozen Vegetables - 500 kg</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">2h ago</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-custom">Recent Outgoing Orders</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    New
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((order) => (
                      <div key={order} className="flex items-center justify-between border-b border-border pb-4 last:border-0">
                        <div className="space-y-1">
                          <p className="text-sm font-medium font-custom">Order #{2000 + order}</p>
                          <p className="text-xs text-muted-foreground">Dairy Products - 300 kg</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">1h ago</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mt-6">
              <Card className="bg-background border-border">
                <CardHeader>
                  <CardTitle className="font-custom">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button className="gap-2 font-custom">
                      <PlusCircle className="h-4 w-4" />
                      New Incoming Order
                    </Button>
                    <Button className="gap-2 font-custom">
                      <PlusCircle className="h-4 w-4" />
                      New Outgoing Order
                    </Button>
                    <Button variant="outline" className="gap-2 font-custom">
                      <Download className="h-4 w-4" />
                      Download Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DaybookScreen2;