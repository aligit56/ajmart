import React from 'react';
import { Truck, Smartphone, ShieldCheck, Headphones } from 'lucide-react';

const TrustStrip = () => {
  const items = [
    {
      icon: <Truck size={28} className="text-darkBlue dark:text-cyan" />,
      title: "Next-Day Delivery",
      subtitle: "Fast delivery in Rawalpindi & Islamabad"
    },
    {
      icon: <Smartphone size={28} className="text-darkBlue dark:text-cyan" />,
      title: "Cash & WhatsApp Payment",
      subtitle: "Hassle-free ordering on WhatsApp or COD"
    },
    {
      icon: <ShieldCheck size={28} className="text-darkBlue dark:text-cyan" />,
      title: "Quality Checked",
      subtitle: "100% authentic brands & premium grains"
    },
    {
      icon: <Headphones size={28} className="text-darkBlue dark:text-cyan" />,
      title: "Easy Support",
      subtitle: "Friendly customer support 7 days a week"
    }
  ];

  return (
    <section className="my-12">
      <div className="bg-lightCard dark:bg-[#161616] rounded-2xl border border-lightBorder dark:border-[#2a2a2a] p-6 md:p-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-darkBlue/10 dark:bg-cyan/15 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-base text-lightText dark:text-darkText">
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
