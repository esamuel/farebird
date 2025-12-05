import React from 'react';
import { HelpCircle, Search, Bookmark, Bell, CreditCard, Mail } from 'lucide-react';

export const Help: React.FC = () => {
  const faqs = [
    {
      question: "How does Farebird find cheap flights?",
      answer: "Farebird uses AI-powered search to scan multiple sources and find the best deals. Our natural language search understands queries like 'beach trip under $500 in January' and our mistake fare alerts catch pricing errors before they're fixed."
    },
    {
      question: "Is Farebird free to use?",
      answer: "Yes! Basic flight search is completely free. Pro features like instant mistake fare alerts, price predictions, and unlimited saved searches require a subscription."
    },
    {
      question: "How do I book a flight?",
      answer: "When you find a flight you like, click 'Book Now' and you'll be redirected to our partner (Skyscanner) to complete your booking. We don't handle payments directly."
    },
    {
      question: "What are mistake fares?",
      answer: "Mistake fares are pricing errors made by airlines - sometimes offering 50-90% discounts. They're usually honored but can be fixed within hours. Our Pro alerts notify you instantly when we detect one."
    },
    {
      question: "How do I save a flight?",
      answer: "Click the bookmark icon on any flight card to save it. Access your saved flights from the 'Saved Trips' section in the sidebar."
    },
    {
      question: "Can I set price alerts?",
      answer: "Price alerts are coming soon! Pro users will be able to set alerts for specific routes and get notified when prices drop."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-amber-100 rounded-xl">
          <HelpCircle className="text-amber-600" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Help Center</h1>
          <p className="text-slate-500">Find answers to common questions</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <a href="#search" className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all text-center">
          <Search className="mx-auto mb-2 text-amber-500" size={24} />
          <span className="text-sm font-medium text-slate-700">Searching</span>
        </a>
        <a href="#booking" className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all text-center">
          <CreditCard className="mx-auto mb-2 text-amber-500" size={24} />
          <span className="text-sm font-medium text-slate-700">Booking</span>
        </a>
        <a href="#saved" className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all text-center">
          <Bookmark className="mx-auto mb-2 text-amber-500" size={24} />
          <span className="text-sm font-medium text-slate-700">Saved Trips</span>
        </a>
        <a href="#alerts" className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all text-center">
          <Bell className="mx-auto mb-2 text-amber-500" size={24} />
          <span className="text-sm font-medium text-slate-700">Alerts</span>
        </a>
      </div>

      {/* FAQs */}
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <details key={index} className="bg-white rounded-xl border border-slate-200 overflow-hidden group">
            <summary className="px-5 py-4 cursor-pointer font-medium text-slate-800 hover:bg-slate-50 transition-colors list-none flex justify-between items-center">
              {faq.question}
              <span className="text-amber-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="px-5 pb-4 text-slate-600">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>

      {/* Contact */}
      <div className="mt-10 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <div className="flex items-start gap-4">
          <Mail className="text-amber-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Still need help?</h3>
            <p className="text-slate-600 text-sm mb-3">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <a 
              href="mailto:support@farebird.app" 
              className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
