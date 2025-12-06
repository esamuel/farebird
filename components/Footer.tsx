import React from 'react';
import { NavLink } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/farebird-logo.png" alt="Farebird" className="h-12 w-auto" />
            </div>
            <p className="text-slate-400 text-sm">
              Catch the best flight deals before they fly away.
            </p>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-slate-200">Support</h4>
            <ul className="space-y-2">
              <li>
                <NavLink to="/help" className="text-slate-400 hover:text-amber-400 text-sm transition-colors">
                  Help Center
                </NavLink>
              </li>
              <li>
                <NavLink to="/settings" className="text-slate-400 hover:text-amber-400 text-sm transition-colors">
                  Privacy Settings
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard" className="text-slate-400 hover:text-amber-400 text-sm transition-colors">
                  Log In
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-slate-200">Legal</h4>
            <ul className="space-y-2">
              <li>
                <NavLink to="/cookies" className="text-slate-400 hover:text-amber-400 text-sm transition-colors">
                  Cookie Policy
                </NavLink>
              </li>
              <li>
                <NavLink to="/privacy" className="text-slate-400 hover:text-amber-400 text-sm transition-colors">
                  Privacy Policy
                </NavLink>
              </li>
              <li>
                <NavLink to="/terms" className="text-slate-400 hover:text-amber-400 text-sm transition-colors">
                  Terms of Service
                </NavLink>
              </li>
              <li>
                <NavLink to="/company" className="text-slate-400 hover:text-amber-400 text-sm transition-colors">
                  Company Details
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-slate-200">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@farebird.app" className="text-slate-400 hover:text-amber-400 text-sm transition-colors">
                  support@farebird.app
                </a>
              </li>
              <li>
                <a href="mailto:hello@farebird.app" className="text-slate-400 hover:text-amber-400 text-sm transition-colors">
                  hello@farebird.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Farebird. All rights reserved.
          </p>
          <p className="text-slate-500 text-xs">
            Prices shown may change. Farebird earns commission from bookings.
          </p>
        </div>
      </div>
    </footer>
  );
};
