import React from 'react';
import SEO from '@/components/common/SEO/SEO';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Privacy Policy - Coldop"
        description="Learn about Coldop's privacy policy, data protection practices, and how we handle your personal information."
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                At Coldop ("we," "our," or "us"), we are committed to protecting your privacy and ensuring the security
                of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard
                your information when you use our cold storage management platform, including our mobile application,
                web dashboard, and related services (collectively, the "Service").
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may collect the following types of personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li>Name and contact information (email address, phone number)</li>
                <li>Business information (company name, address, role)</li>
                <li>Account credentials and authentication information</li>
                <li>Payment and billing information</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Operational Data</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li>Farmer account information and transaction records</li>
                <li>Inventory data and stock movement records</li>
                <li>Order and delivery information</li>
                <li>Storage facility data and temperature logs</li>
                <li>Receipt and voucher data</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Technical Information</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Device information (device type, operating system, app version)</li>
                <li>Usage analytics and app performance data</li>
                <li>Log files and error reports</li>
                <li>IP address and location data (when location services are enabled)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Providing and maintaining our cold storage management services</li>
                <li>Processing transactions and managing farmer accounts</li>
                <li>Sending WhatsApp notifications and transaction confirmations</li>
                <li>Generating reports, receipts, and vouchers</li>
                <li>Improving our services and developing new features</li>
                <li>Providing customer support and technical assistance</li>
                <li>Ensuring security and preventing fraud</li>
                <li>Complying with legal obligations and regulatory requirements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your
                information in the following limited circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our platform</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Consent:</strong> When you have given us explicit consent to share your information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular backups and disaster recovery procedures</li>
                <li>Employee training on data protection practices</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as necessary to provide our services, comply with
                legal obligations, resolve disputes, and enforce our agreements. Operational data may be retained
                for longer periods to maintain historical records and support business continuity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate or incomplete information</li>
                <li>Deletion of your personal information (subject to legal and business requirements)</li>
                <li>Restriction of processing</li>
                <li>Data portability</li>
                <li>Objection to processing</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise these rights, please contact us at coldop.app@gmail.com.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed">
                Our website and mobile application may use cookies and similar tracking technologies to improve
                user experience, analyze usage patterns, and provide personalized content. You can control cookie
                settings through your browser or device settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure
                that such transfers are conducted in accordance with applicable data protection laws and that
                appropriate safeguards are in place.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes
                by posting the new Privacy Policy on our website and updating the "Last updated" date. Your
                continued use of our services after any changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices,
                please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> coldop.app@gmail.com</p>
                <p className="text-gray-700"><strong>Phone:</strong> +91 9877741375</p>
                <p className="text-gray-700"><strong>Address:</strong> 123 Cold Storage Lane, Tech Park, Bangalore 560001</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;