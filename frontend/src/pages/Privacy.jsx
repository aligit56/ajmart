import React from 'react';
import { Shield, Lock } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-lightCard dark:bg-darkCard p-6 md:p-10 rounded-3xl border border-lightBorder dark:border-darkBorder shadow-sm">
      <div className="border-b border-lightBorder dark:border-darkBorder pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan text-xs font-bold uppercase tracking-wider mb-2">
          <Shield size={13} /> Data & Security
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-lightText dark:text-darkText">
          Privacy Policy
        </h1>
        <p className="text-xs md:text-sm text-lightTextSecondary dark:text-darkTextSecondary mt-1">
          Last updated: October 2026
        </p>
      </div>

      <div className="space-y-6 text-sm md:text-base text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-lightText dark:text-darkText">1. Information We Collect</h2>
          <p>
            When you register, place an order, or reach out to AJMart, we collect necessary contact information including your full name, phone number, delivery address, and order preferences.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-lightText dark:text-darkText">2. How We Use Your Information</h2>
          <p>
            We use your personal data strictly to:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Process, assemble, and deliver your grocery orders accurately.</li>
            <li>Send order confirmation, delivery updates, and tracking details via SMS/WhatsApp.</li>
            <li>Respond to your customer support inquiries or product questions.</li>
            <li>Improve our catalog, inventory, and online shopping experience.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-lightText dark:text-darkText">3. Information Sharing and Disclosure</h2>
          <p>
            We respect your privacy. AJMart does NOT sell, rent, or trade your personal information to third parties or marketing brokers. We only share necessary delivery information (name, address, contact number) with our trusted delivery riders for the sole purpose of delivering your order.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-lightText dark:text-darkText">4. Data Security</h2>
          <p>
            We implement industry-standard security protocols to protect your personal information against unauthorized access, modification, or disclosure. User accounts are protected with secure password hashing.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-lightText dark:text-darkText">5. WhatsApp & Communication</h2>
          <p>
            By submitting an order or inquiry through WhatsApp, you agree to receive order notifications and delivery status communications on that number. You may opt out of promotional messages at any time.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-lightText dark:text-darkText">6. Contacting Us</h2>
          <p>
            If you have questions about your privacy or wish to delete your account data, please contact our support desk at info@ajmart.pk or message us on WhatsApp.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
