import React from 'react';
import { Mail, Phone, Clock, MessageCircle, FileText, Users } from 'lucide-react';
import SEO from '@/components/common/SEO/SEO';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Support: React.FC = () => {
  const supportChannels = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Support",
      description: "Get help via email with detailed responses",
      contact: "coldop.app@gmail.com",
      link: "mailto:coldop.app@gmail.com?subject=Support Request&body=Hi Coldop team,%0D%0A%0D%0AI need help with:",
      responseTime: "24 hours"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone Support",
      description: "Speak directly with our support team",
      contact: "+91 9877741375",
      link: "tel:+919877741375",
      responseTime: "Business hours"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "WhatsApp Support",
      description: "Quick help via WhatsApp messaging",
      contact: "+91 9646996729",
      link: "https://wa.me/919646996729?text=Hi%20Coldop%20team,%20I%20need%20help%20with:",
      responseTime: "2-4 hours"
    }
  ];

  const supportTopics = [
    {
      icon: <Users className="h-5 w-5" />,
      title: "Account Management",
      description: "Creating farmer accounts, managing user access, and account settings",
      topics: ["Creating farmer accounts", "User permissions", "Account recovery", "Profile management"]
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Order Management",
      description: "Incoming and outgoing orders, tracking, and order history",
      topics: ["Recording incoming stock", "Managing outgoing orders", "Order tracking", "Receipt printing"]
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: "WhatsApp Integration",
      description: "Setting up and managing WhatsApp notifications",
      topics: ["WhatsApp setup", "Notification preferences", "Message troubleshooting", "Integration issues"]
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Technical Issues",
      description: "App performance, sync issues, and technical troubleshooting",
      topics: ["App not loading", "Data sync problems", "Performance issues", "Error messages"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Support Center - Coldop"
        description="Get help with Coldop's cold storage management platform. Contact our support team via email, phone, or WhatsApp."
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Support Center
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're here to help you get the most out of Coldop. Choose your preferred way to reach us.
            </p>
          </div>
        </div>
      </div>

      {/* Support Channels */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Contact Our Support Team
          </h2>
          <p className="text-lg text-gray-600">
            Multiple ways to get the help you need, when you need it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {supportChannels.map((channel, index) => (
            <Card key={index} className="border-none shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {channel.icon}
                  </div>
                  <CardTitle>{channel.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {channel.description}
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-500">
                    <strong>Contact:</strong> {channel.contact}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Response time:</strong> {channel.responseTime}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  asChild
                >
                  <a href={channel.link}>Contact Us</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Support Topics */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Common Support Topics
            </h2>
            <p className="text-lg text-gray-600">
              Find help for the most common questions and issues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportTopics.map((topic, index) => (
              <Card key={index} className="border-none shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {topic.icon}
                    </div>
                    <CardTitle className="text-base">{topic.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {topic.description}
                  </p>
                  <ul className="space-y-1">
                    {topic.topics.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-xs text-gray-500">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Support Policy */}
        <Card className="border-none shadow-md mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Support Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Support Hours
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li><strong>Email Support:</strong> 24/7 (response within 24 hours)</li>
                  <li><strong>Phone Support:</strong> Mon-Fri, 9 AM - 6 PM IST</li>
                  <li><strong>WhatsApp Support:</strong> Mon-Sat, 9 AM - 8 PM IST</li>
                  <li><strong>Emergency Support:</strong> Available for critical issues</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  What We Cover
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Technical troubleshooting and bug fixes</li>
                  <li>• Feature guidance and best practices</li>
                  <li>• Account setup and configuration</li>
                  <li>• Data migration and backup support</li>
                  <li>• Integration assistance</li>
                  <li>• Training and onboarding</li>
                </ul>
              </div>
            </div>

            <Card className="mt-8 bg-primary/5 border-none">
              <CardHeader>
                <CardTitle className="text-base text-primary">Priority Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Complete plan subscribers receive priority support with faster response times and dedicated assistance.
                  Emergency support is available 24/7 for critical system issues.
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* FAQ Link */}
        <Card className="border-none bg-gray-50 shadow-sm">
          <CardContent className="text-center p-8">
            <CardTitle className="text-lg mb-2">Check Our FAQ First</CardTitle>
            <CardDescription className="mb-4">
              Many common questions are answered in our comprehensive FAQ section.
            </CardDescription>
            <Button
              variant="outline"
              className="bg-white text-primary hover:bg-white/90 border-2 border-primary font-bold"
              asChild
            >
              <a href="/faq">View FAQ</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Support;