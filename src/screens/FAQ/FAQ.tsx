import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SEO from '@/components/common/SEO/SEO';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData: FAQItem[] = [
    {
      question: "What is Coldop and how does it work?",
      answer: "Coldop is a comprehensive cold storage management platform that includes a mobile app, web dashboard, WhatsApp updates, and instant receipt printing. It helps farmers and cold storage operators manage their inventory, track deliveries, and maintain complete transparency in their operations."
    },
    {
      question: "How do I create farmer accounts?",
      answer: "Creating farmer accounts is simple - you only need a name and mobile number. Each farmer gets a digital ledger, eliminating the need for handwritten records. The system automatically tracks all transactions and balances."
    },
    {
      question: "Can I track incoming and outgoing orders?",
      answer: "Yes! Coldop allows you to record incoming stock and outgoing stock/dispatch in seconds through both mobile and web platforms. The system automatically updates farmer balances and assigns lot numbers for easy tracking."
    },
    {
      question: "Do I get notifications for transactions?",
      answer: "Absolutely! Upon successful storage of crops, both you and your client instantly receive confirmation on WhatsApp. This ensures full transparency and keeps everyone informed about transaction status."
    },
    {
      question: "What are the pricing plans?",
      answer: "We offer two plans: Starter at $399/month (1 crop per day, 11am-9pm ordering) and Complete at $649/month (2 crops per day, 24/7 ordering, access to all storages). Both plans include free recovery and our Purity Pact guarantee."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Yes, Coldop includes both mobile apps for iOS and Android, as well as a comprehensive web dashboard. You can manage your cold storage operations from anywhere, anytime."
    },
    {
      question: "How does the receipt printing work?",
      answer: "Coldop includes instant receipt printing functionality. When transactions are completed, you can immediately print professional receipts for your records and to provide to farmers."
    },
    {
      question: "What is the Purity Pact?",
      answer: "The Purity Pact is our steadfast commitment to crop freshness, minimizing waste, and ensuring unparalleled quality. We maintain optimal temperature control to extend shelf life and prevent deterioration."
    },
    {
      question: "Can I access my data from multiple devices?",
      answer: "Yes, your data is synchronized across all devices. You can access your cold storage management system from your phone, tablet, or computer with seamless data synchronization."
    },
    {
      question: "What support is available?",
      answer: "We provide comprehensive support including help documentation, customer service, and technical assistance. You can reach us via email at coldop.app@gmail.com or through our support channels."
    },
    {
      question: "How secure is my data?",
      answer: "Data security is our priority. We use industry-standard encryption and security measures to protect your information. All data is backed up regularly and stored securely."
    },
    {
      question: "Can I try Coldop before purchasing?",
      answer: "Yes, we offer demos and trials. Contact our team to schedule a demonstration and see how Coldop can transform your cold storage operations."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Frequently Asked Questions - Coldop"
        description="Find answers to common questions about Coldop's cold storage management platform, pricing, features, and support."
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about Coldop's cold storage management platform.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-medium text-gray-900 pr-4">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
              </button>

              {openIndex === index && (
                <div className="px-6 pb-4">
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="bg-blue-50 rounded-lg p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-4">
              Can't find the answer you're looking for? We're here to help.
            </p>
            <a
              href="mailto:coldop.app@gmail.com?subject=FAQ Support Request&body=Hi Coldop team,%0D%0A%0D%0AI have a question that's not covered in the FAQ:"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;