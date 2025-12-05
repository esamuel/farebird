import React from 'react';
import { NavLink } from 'react-router-dom';
import { Plane, CheckCircle2, Zap, Globe2, CloudSun, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-slate-50 opacity-90" />
          <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-sky-100/50 rounded-full blur-3xl" />
          <div className="absolute left-0 bottom-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-50/50 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-medium mb-8 border border-amber-100 shadow-sm">
            <Zap size={16} />
            <span>Now powered by Gemini 2.5 AI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
            Explore the world, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">
              without the markup.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
            Farebird uses advanced AI to monitor prices, predict drops, and find hidden deals that standard search engines miss.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <NavLink to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14 shadow-xl shadow-sky-200">
                Find Cheap Flights
              </Button>
            </NavLink>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 h-14">
              View Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-16 pt-8 border-t border-slate-200/60">
            <p className="text-sm font-medium text-slate-500 mb-6">TRUSTED BY TRAVELERS FROM</p>
            <div className="flex justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="text-xl font-bold text-slate-800">Expedia</span>
              <span className="text-xl font-bold text-slate-800">Skyscanner</span>
              <span className="text-xl font-bold text-slate-800">Kayak</span>
              <span className="text-xl font-bold text-slate-800">Momondo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why choose Farebird?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We don't just search flights; we manage your entire booking strategy.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <Globe2 className="text-sky-600" size={32} />,
                title: "Global Search",
                desc: "We scan 500+ airlines and booking sites in seconds to find the absolute lowest fare."
              },
              {
                icon: <CloudSun className="text-amber-500" size={32} />,
                title: "AI Predictions",
                desc: "Our Gemini-powered engine predicts if prices will drop in the next 7 days."
              },
              {
                icon: <MapPin className="text-sky-600" size={32} />,
                title: "Destination Discovery",
                desc: "Don't know where to go? Let our AI suggest destinations based on your budget and vibe."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-sky-50/50 p-8 rounded-2xl border border-sky-100 hover:border-sky-200 transition-colors group">
                <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};