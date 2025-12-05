import React from 'react';
import { Shield } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-amber-100 rounded-xl">
          <Shield className="text-amber-600" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="text-slate-500">Last updated: December 2, 2025</p>
        </div>
      </div>

      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Information We Collect</h2>
          <p className="text-slate-600 leading-relaxed">
            Farebird collects information you provide directly, including search queries, saved flights, 
            and account information. We also automatically collect usage data such as pages visited, 
            search patterns, and device information to improve our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>To provide and personalize flight search results</li>
            <li>To send price alerts and deal notifications (with your consent)</li>
            <li>To improve our AI-powered recommendations</li>
            <li>To process bookings through our affiliate partners</li>
            <li>To communicate important service updates</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Data Sharing</h2>
          <p className="text-slate-600 leading-relaxed">
            We share data with airline booking partners only when you choose to book a flight. 
            We use Google's Gemini AI for search processing - queries are processed but not stored 
            by Google for training purposes. We do not sell your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Cookies & Tracking</h2>
          <p className="text-slate-600 leading-relaxed">
            We use essential cookies to remember your preferences and saved searches. 
            Analytics cookies help us understand how users interact with Farebird. 
            You can manage cookie preferences in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Data Security</h2>
          <p className="text-slate-600 leading-relaxed">
            Your data is stored securely using industry-standard encryption. API keys and 
            sensitive credentials are stored locally in your browser and never transmitted 
            to our servers. We use HTTPS for all data transmission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Your Rights</h2>
          <p className="text-slate-600 leading-relaxed">
            You have the right to access, correct, or delete your personal data. 
            You can export your saved flights at any time. To exercise these rights, 
            contact us at privacy@farebird.app.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Contact Us</h2>
          <p className="text-slate-600 leading-relaxed">
            For privacy-related questions, contact us at: <br />
            <a href="mailto:privacy@farebird.app" className="text-amber-600 hover:underline">
              privacy@farebird.app
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};
