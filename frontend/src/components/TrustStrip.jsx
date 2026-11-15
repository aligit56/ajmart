import React from 'react';
import { Truck, Smartphone, ShieldCheck, Headphones, Sparkles } from 'lucide-react';

const TrustStrip = () => {
  const items = [
    {
      icon: <Truck size={26} className="text-darkBlue dark:text-cyan" />,
      title: "Next-Day Delivery",
      subtitle: "Fast delivery in Rawalpindi & Islamabad"
    },
    {
      icon: <Smartphone size={26} className="text-darkBlue dark:text-cyan" />,
      title: "Cash & WhatsApp Payment",
      subtitle: "Hassle-free ordering on WhatsApp or COD"
    },
    {
      icon: <ShieldCheck size={26} className="text-darkBlue dark:text-cyan" />,
      title: "Quality Checked",
      subtitle: "100% authentic brands & premium grains"
    },
    {
      icon: <Headphones size={26} className="text-darkBlue dark:text-cyan" />,
      title: "Easy Support",
      subtitle: "Friendly customer support 7 days a week"
    }
  ];

  return (
    <section className="my-12">
      <div className="bg-lightCard dark:bg-[#161616] rounded-3xl border border-lightBorder dark:border-[#2a2a2a] p-6 sm:p-8 md:p-10 shadow-sm space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan text-xs font-bold uppercase tracking-wider">
            <Sparkles size={13} /> Why Choose AJTraders
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-lightText dark:text-darkText tracking-tight">
            Our Service & Quality Guarantees
          </h2>
          <p className="text-xs md:text-sm text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed">
            Direct wholesale prices, unadulterated food purity, and dependable customer service for your daily household needs
          </p>
        </div>

        {/* 4 Feature Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 group p-3 rounded-2xl transition-all hover:bg-black/5 dark:hover:bg-white/5">
              <div className="w-13 h-13 rounded-2xl bg-darkBlue/10 dark:bg-cyan/15 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-lightText dark:text-darkText">
                  {item.title}
                </h4>
                <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary mt-0.5 leading-snug">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
