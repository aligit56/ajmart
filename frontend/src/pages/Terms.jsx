import React from 'react';
import { FileText, ShieldAlert } from 'lucide-react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-lightCard dark:bg-darkCard p-6 md:p-10 rounded-3xl border border-lightBorder dark:border-darkBorder shadow-sm">
      <div className="border-b border-lightBorder dark:border-darkBorder pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan text-xs font-bold uppercase tracking-wider mb-2">
          <FileText size={13} /> Legal Agreement
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-lightText dark:text-darkText">
          Terms & Conditions
        </h1>
        <p className="text-xs md:text-sm text-lightTextSecondary dark:text-darkTextSecondary mt-1">
          Last updated: October 2026
        </p>
      </div>

      <div className="space-y-6 text-sm md:text-base text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-lightText dark:text-darkText">1. Introduction</h2>
          <p>
            Welcome to AJMart. These Terms and Conditions govern your use of our website, services, and online grocery orders within Pakistan. By accessing our platform or placing an order, you agree to be bound by these terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-lightText dark:text-darkText">2. Orders and Availability</h2>
          <p>
            All product orders are subject to stock availability and confirmation. While we strive to maintain accurate inventory levels on our website, item availability may change dynamically. In the rare event an item is out of stock, our team will notify you promptly before dispatch.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-lightText dark:text-darkText">3. Pricing and Payments</h2>
          <p>
            All prices listed on AJMart are in Pakistani Rupees (PKR) and include applicable product costs. We reserve the right to modify prices based on wholesale market fluctuations. The price charged will be the confirmed price at the time of your order confirmation. Payments can be settled via Cash on Delivery (COD) or verified electronic bank transfer.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-lightText dark:text-darkText">4. Delivery Policy</h2>
          <p>
            Deliveries are conducted within Rawalpindi & Islamabad and designated service areas. Delivery timeframes (standard next-day) are estimates. Delays caused by severe weather, traffic disruptions, or unforeseen events will be communicated to the customer at the earliest. Minimum order requirement is PKR 3,500.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-lightText dark:text-darkText">5. Returns, Replacements & Refunds</h2>
          <p>
            Customers are strongly encouraged to inspect all packages upon delivery with our courier. If any item is found damaged, opened, or substandard, you may reject the item upon arrival or report it within 24 hours of delivery with photographic evidence for a replacement or refund.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-lightText dark:text-darkText">6. User Responsibilities</h2>
          <p>
            You agree to provide accurate, complete delivery information including recipient contact numbers and clear street addresses to facilitate prompt delivery.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-lightText dark:text-darkText">7. Contact Information</h2>
          <p>
            For questions regarding these Terms & Conditions, please contact us via WhatsApp at 0335-7727555 (Aqib) / 0312-5637557 (Junaid) or email at info@ajmart.pk.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
