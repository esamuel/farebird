import React from 'react';
import { Building2, MapPin, Mail, Globe } from 'lucide-react';

export const CompanyDetails: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-amber-100 rounded-xl">
          <Building2 className="text-amber-600" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Company Details</h1>
          <p className="text-slate-500">About Farebird</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Company Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Company Information</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Company Name</p>
              <p className="font-medium text-slate-800">Farebird Technologies</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-500">Business Type</p>
              <p className="font-medium text-slate-800">Travel Technology / Metasearch</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-500">Founded</p>
              <p className="font-medium text-slate-800">2025</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Globe className="text-amber-500 mt-1" size={18} />
              <div>
                <p className="text-sm text-slate-500">Website</p>
                <a href="https://farebird.app" className="font-medium text-amber-600 hover:underline">
                  farebird.app
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Mail className="text-amber-500 mt-1" size={18} />
              <div>
                <p className="text-sm text-slate-500">General Inquiries</p>
                <a href="mailto:hello@farebird.app" className="font-medium text-amber-600 hover:underline">
                  hello@farebird.app
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Mail className="text-amber-500 mt-1" size={18} />
              <div>
                <p className="text-sm text-slate-500">Support</p>
                <a href="mailto:support@farebird.app" className="font-medium text-amber-600 hover:underline">
                  support@farebird.app
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">About Farebird</h2>
        <div className="text-slate-600 space-y-4">
          <p>
            Farebird is an AI-powered flight search platform designed to help travelers find the 
            best deals. Unlike traditional flight search engines, we use advanced AI to understand 
            natural language queries, predict price trends, and catch mistake fares before they disappear.
          </p>
          <p>
            Our mission is to make flight booking transparent, affordable, and stress-free. 
            We believe everyone deserves access to the best flight deals, not just travel hackers.
          </p>
          <p>
            Farebird is a metasearch engine - we compare prices from airlines and travel agencies 
            but don't sell tickets directly. When you book, you're redirected to our trusted partners 
            to complete your purchase.
          </p>
        </div>
      </div>

      {/* Affiliate Disclosure */}
      <div className="mt-8 bg-amber-50 rounded-xl border border-amber-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Affiliate Disclosure</h2>
        <p className="text-slate-600 text-sm">
          Farebird earns commission from bookings made through our partner links. This comes at 
          no additional cost to you and helps us keep our basic service free. Our search results 
          are not influenced by commission rates - we always show you the best deals first.
        </p>
      </div>
    </div>
  );
};
