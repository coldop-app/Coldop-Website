import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const FAQs = [
  {
    question: "How do I add a new farmer to my cold storage?",
    answer: "You can add a new farmer by going to the People section and clicking on the 'Add Farmer' button. Fill in the required details and save the information."
  },
  {
    question: "How can I generate reports for my cold storage?",
    answer: "Reports can be generated from the Reports section in the sidebar. You can select different parameters like date range, farmer details, and get detailed insights about your cold storage operations."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards and UPI payments. You can manage your payment methods in the Billing Settings section."
  },
  {
    question: "How do I track incoming and outgoing orders?",
    answer: "You can track all orders through the Daybook section. It provides a comprehensive view of all incoming and outgoing orders with detailed status updates."
  }
];

const ContactSupportScreen = () => {
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

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
        {/* Contact Methods Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Contact Support</CardTitle>
            <CardDescription>
              Get help from our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email Support</h3>
                    <p className="text-sm text-muted-foreground">
                      coldopapp@gmail.com
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Phone Support</h3>
                    <p className="text-sm text-muted-foreground">
                      +91 9877069258
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
            <CardDescription>
              Quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {FAQs.map((faq, index) => (
                <div
                  key={index}
                  className="border rounded-lg"
                >
                  <button
                    className="w-full px-4 py-3 flex items-center justify-between text-left focus:outline-none"
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  >
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <span className="font-medium">{faq.question}</span>
                    </div>
                    {expandedFAQ === index ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-4 pb-3 text-sm text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactSupportScreen;