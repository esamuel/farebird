import React from 'react';
import { Cookie } from 'lucide-react';

export const CookiePolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-amber-100 rounded-xl">
          <Cookie className="text-amber-600" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Cookie Policy</h1>
          <p className="text-slate-500">Last updated: December 2, 2025</p>
        </div>
      </div>

      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">What Are Cookies?</h2>
          <p className="text-slate-600 leading-relaxed">
            Cookies are small text files stored on your device when you visit a website. 
            They help us remember your preferences and improve your experience on Farebird.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Cookies We Use</h2>
          
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-slate-800 mb-2">Essential Cookies</h3>
            <p className="text-slate-600 text-sm">
              Required for the website to function. These store your saved flights, 
              search preferences, and API settings locally.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-slate-800 mb-2">Functional Cookies</h3>
            <p className="text-slate-600 text-sm">
              Remember your preferences like currency, language, and recent searches 
              to provide a personalized experience.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-slate-800 mb-2">Analytics Cookies</h3>
            <p className="text-slate-600 text-sm">
              Help us understand how visitors use Farebird so we can improve our service. 
              This data is anonymized and aggregated.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-2">Affiliate Cookies</h3>
            <p className="text-slate-600 text-sm">
              When you click through to book a flight, our partners may set cookies 
              to track the referral. This helps us earn commission at no extra cost to you.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Managing Cookies</h2>
          <p className="text-slate-600 leading-relaxed">
            You can control cookies through your browser settings. Note that disabling 
            essential cookies may affect the functionality of Farebird, including saved 
            flights and preferences.
          </p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-3">
            <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
            <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
            <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Contact Us</h2>
          <p className="text-slate-600 leading-relaxed">
            Questions about our cookie policy? Contact us at: <br />
            <a href="mailto:privacy@farebird.app" className="text-amber-600 hover:underline">
              privacy@farebird.app
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};
