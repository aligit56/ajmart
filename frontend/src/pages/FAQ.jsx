import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { WhatsAppIcon } from '../components/SocialIcons';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    q: 'How do I place an order?',
    a: 'You can easily place an order in two ways:\n1. Online: Browse our website, add products to your cart, proceed to checkout, and fill in your delivery details.\n2. WhatsApp: Click the WhatsApp button anywhere on the website or message us directly with your list of grocery items. Our team will promptly confirm availability and schedule delivery.'
  },
  {
    q: 'What are the delivery charges and times?',
    a: 'We offer standard next-day delivery across Rawalpindi & Islamabad. Orders placed before 6:00 PM are delivered the following day. Delivery fees vary from PKR 150 - 250 depending on your area, and orders above PKR 3,000 qualify for free standard delivery.'
  },
  {
    q: 'Can I pay with Cash on Delivery?',
    a: 'Yes, absolutely! Cash on Delivery (COD) is available on all standard grocery orders. You pay our rider directly upon receiving and inspecting your items. We also accept direct online bank transfers (Raast/EasyPaisa/JazzCash) upon request.'
  },
  {
    q: 'What is your return policy?',
    a: 'We stand by the quality and freshness of our products with a 100% satisfaction guarantee. If any item is damaged, defective, or not up to quality standards upon delivery, notify our rider immediately or message us on WhatsApp within 24 hours for a full replacement or refund.'
  },
  {
    q: 'Are the prices the same as in-store?',
    a: 'Yes, all our prices online match our wholesale in-store rates. We believe in complete pricing transparency with no hidden markups, giving you the best possible grocery prices in Karachi.'
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 py-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan text-xs font-bold uppercase tracking-wider">
          <HelpCircle size={13} /> Common Inquiries
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-lightText dark:text-darkText tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm md:text-base text-lightTextSecondary dark:text-darkTextSecondary max-w-lg mx-auto">
          Everything you need to know about ordering, delivery, payments, and product guarantees at AJTraders.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-lightCard dark:bg-darkCard rounded-2xl border border-lightBorder dark:border-darkBorder overflow-hidden transition-all duration-200 shadow-sm"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full p-5 md:p-6 text-left flex items-center justify-between gap-4 font-bold text-base md:text-lg text-lightText dark:text-darkText hover:text-darkBlue dark:hover:text-cyan transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={20}
                  className={`flex-shrink-0 text-darkBlue dark:text-cyan transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-6 md:px-6 pt-0 text-sm md:text-base text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed border-t border-lightBorder/50 dark:border-darkBorder/50 mt-1">
                  <div className="pt-4 whitespace-pre-line">
                    {faq.a}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still have questions card */}
      <div className="bg-lightCard dark:bg-darkCard p-6 md:p-8 rounded-2xl border border-lightBorder dark:border-darkBorder text-center space-y-4 shadow-sm">
        <h3 className="text-xl font-bold text-lightText dark:text-darkText">Still have questions?</h3>
        <p className="text-sm text-lightTextSecondary dark:text-darkTextSecondary max-w-md mx-auto">
          We are here to help! Chat directly with our customer support team on WhatsApp or drop us an inquiry.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
            <WhatsAppIcon size={18} /> Contact Customer Care
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
