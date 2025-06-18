import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Building2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const BillingSettingsScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4 -ml-4"
          onClick={() => navigate('/erp/settings')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Current Plan Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Current Plan</CardTitle>
            <CardDescription>
              Your current subscription plan and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border p-4 bg-muted/30">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">Professional Plan</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Billed monthly • ₹999/month
                  </p>
                </div>
                <Button>Upgrade Plan</Button>
              </div>
              <Separator className="my-4" />
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Storage Used</span>
                  <span className="font-medium">1,234 / 5,000 bags</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Next Billing Date</span>
                  <span className="font-medium">March 1, 2024</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Payment Method</CardTitle>
            <CardDescription>
              Manage your payment information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Payment Method */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-muted">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/24</p>
                    </div>
                  </div>
                  <Button variant="outline">Update</Button>
                </div>
              </div>

              {/* Add New Card Form */}
              <div className="space-y-4 pt-4">
                <h3 className="font-medium">Add New Card</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        type="password"
                        maxLength={3}
                      />
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-2">Add Card</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Address Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Billing Address</CardTitle>
            <CardDescription>
              Your billing information for invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full bg-muted">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">Current Billing Address</p>
                  <p className="text-sm text-muted-foreground">123 Business Street, City, State, 12345</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    placeholder="Enter street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      placeholder="Enter postal code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="Enter country"
                    />
                  </div>
                </div>
                <Button className="w-full">Update Billing Address</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing History Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Billing History</CardTitle>
            <CardDescription>
              View and download your past invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: "Feb 1, 2024", amount: "₹999", status: "Paid" },
                { date: "Jan 1, 2024", amount: "₹999", status: "Paid" },
                { date: "Dec 1, 2023", amount: "₹999", status: "Paid" },
              ].map((invoice, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-muted">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.date}</p>
                      <p className="text-sm text-muted-foreground">{invoice.amount}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-600 font-medium">
                      {invoice.status}
                    </span>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingSettingsScreen;