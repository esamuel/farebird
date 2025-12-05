import React from 'react';
import { FileText } from 'lucide-react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-amber-100 rounded-xl">
          <FileText className="text-amber-600" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
          <p className="text-slate-500">Last updated: December 2, 2025</p>
        </div>
      </div>

      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Acceptance of Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            By accessing and using Farebird, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Service Description</h2>
          <p className="text-slate-600 leading-relaxed">
            Farebird is a flight search and comparison platform that uses AI to help users find 
            flight deals. We are a metasearch engine and do not sell tickets directly. All bookings 
            are completed through our airline and travel agency partners.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Booking & Pricing</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>Prices displayed are provided by third-party partners and may change</li>
            <li>Final prices are confirmed on the booking partner's website</li>
            <li>Farebird is not responsible for price changes after you leave our site</li>
            <li>Mistake fares may be cancelled by airlines - book at your own risk</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">4. User Accounts</h2>
          <p className="text-slate-600 leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials. 
            You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Prohibited Uses</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>Automated scraping or data extraction</li>
            <li>Reselling or redistributing our data</li>
            <li>Attempting to circumvent security measures</li>
            <li>Using the service for illegal purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Limitation of Liability</h2>
          <p className="text-slate-600 leading-relaxed">
            Farebird provides information "as is" without warranties. We are not liable for 
            inaccurate pricing, missed flights, or booking issues with third-party partners. 
            Our maximum liability is limited to the amount you paid for our Pro subscription, if any.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Changes to Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            We may update these terms at any time. Continued use of Farebird after changes 
            constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            Questions about these terms? Contact us at: <br />
            <a href="mailto:legal@farebird.app" className="text-amber-600 hover:underline">
              legal@farebird.app
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};
