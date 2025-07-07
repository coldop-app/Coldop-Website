import React from 'react';
import { TrendingUp, Users, Clock, CheckCircle } from 'lucide-react';
import SEO from '@/components/common/SEO/SEO';

const CaseStudies: React.FC = () => {
  const caseStudies = [
    {
      title: "Green Valley Farms: 40% Reduction in Crop Waste",
      company: "Green Valley Farms",
      location: "Punjab, India",
      industry: "Organic Farming",
      challenge: "High post-harvest losses due to poor storage management and lack of real-time monitoring",
      solution: "Implemented Coldop's complete cold storage management system with mobile app and WhatsApp notifications",
      results: [
        "40% reduction in crop waste within 6 months",
        "25% increase in farmer satisfaction",
        "Real-time inventory tracking for 500+ farmers",
        "Automated receipt printing reduced paperwork by 90%"
      ],
      metrics: {
        farmers: "500+",
        wasteReduction: "40%",
        satisfaction: "25%",
        efficiency: "90%"
      },
      testimonial: "Coldop transformed our operations completely. The real-time WhatsApp notifications keep our farmers informed, and the automated systems have eliminated manual errors.",
      author: "Rajesh Kumar",
      role: "Operations Manager"
    },
    {
      title: "AgriCorp Solutions: Streamlined Multi-Location Operations",
      company: "AgriCorp Solutions",
      location: "Haryana, India",
      industry: "Agricultural Distribution",
      challenge: "Managing inventory across 12 cold storage facilities with inconsistent tracking systems",
      solution: "Deployed Coldop across all locations with centralized dashboard and mobile access for field teams",
      results: [
        "100% transparency across all 12 locations",
        "60% faster order processing",
        "Eliminated data discrepancies between facilities",
        "24/7 real-time monitoring capabilities"
      ],
      metrics: {
        locations: "12",
        speedIncrease: "60%",
        accuracy: "100%",
        monitoring: "24/7"
      },
      testimonial: "Managing multiple cold storage facilities was a nightmare before Coldop. Now we have complete visibility and control over all our operations from a single dashboard.",
      author: "Priya Sharma",
      role: "Regional Director"
    },
    {
      title: "Fresh Harvest Co-op: Digital Transformation Success",
      company: "Fresh Harvest Co-operative",
      location: "Maharashtra, India",
      industry: "Farmer Cooperative",
      challenge: "Paper-based record keeping leading to errors and disputes with member farmers",
      solution: "Complete digitization using Coldop's farmer account management and digital receipt system",
      results: [
        "Zero paper-based transactions",
        "95% reduction in disputes",
        "Instant digital receipts for all transactions",
        "Improved trust and transparency with farmers"
      ],
      metrics: {
        paperReduction: "100%",
        disputeReduction: "95%",
        farmers: "800+",
        satisfaction: "98%"
      },
      testimonial: "The digital transformation with Coldop has revolutionized our cooperative. Farmers now trust us completely because everything is transparent and instantly verified.",
      author: "Suresh Patil",
      role: "Cooperative President"
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Increased Efficiency",
      description: "Average 60% improvement in operational efficiency across all case studies"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Enhanced Transparency",
      description: "100% transparency in operations leading to improved farmer relationships"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Real-time Monitoring",
      description: "24/7 monitoring capabilities with instant WhatsApp notifications"
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Reduced Errors",
      description: "Up to 95% reduction in operational errors and disputes"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Case Studies - Coldop"
        description="Discover how Coldop's cold storage management platform has transformed operations for farms and cooperatives across India."
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how Coldop has transformed cold storage operations for businesses across India,
              reducing waste, improving efficiency, and enhancing farmer relationships.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Proven Results Across Industries
          </h2>
          <p className="text-lg text-gray-600">
            Our customers consistently achieve significant improvements in their operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-lg mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Case Studies */}
        <div className="space-y-16">
          {caseStudies.map((study, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  {/* Main Content */}
                  <div className="lg:col-span-2">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {study.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span><strong>Company:</strong> {study.company}</span>
                        <span><strong>Location:</strong> {study.location}</span>
                        <span><strong>Industry:</strong> {study.industry}</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Challenge</h4>
                        <p className="text-gray-700">{study.challenge}</p>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Solution</h4>
                        <p className="text-gray-700">{study.solution}</p>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Results</h4>
                        <ul className="space-y-2">
                          {study.results.map((result, resultIndex) => (
                            <li key={resultIndex} className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{result}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Metrics & Testimonial */}
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h4>
                      <div className="space-y-3">
                        {Object.entries(study.metrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="font-semibold text-blue-600">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Testimonial</h4>
                      <blockquote className="text-gray-700 italic mb-4">
                        "{study.testimonial}"
                      </blockquote>
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">{study.author}</p>
                        <p className="text-gray-600">{study.role}</p>
                        <p className="text-gray-600">{study.company}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-blue-600 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Cold Storage Operations?
            </h3>
            <p className="text-lg mb-6 text-blue-100">
              Join hundreds of satisfied customers who have revolutionized their cold storage management with Coldop.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:coldop.app@gmail.com?subject=Case Study Inquiry&body=Hi Coldop team,%0D%0A%0D%0AI'm interested in learning more about how Coldop can help transform our operations like the case studies I've seen:"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
              >
                Contact Sales
              </a>
              <a
                href="/faq"
                className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-blue-700 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseStudies;