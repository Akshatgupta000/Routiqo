import { Globe, Briefcase, Code, Mail, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  const links = {
    Product: ['Features', 'Integrations', 'Pricing', 'Changelog'],
    Company: ['About Us', 'Careers', 'Contact', 'Blog'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
  };

  return (
    <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
          
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-dark rounded-xl flex items-center justify-center">
                <div className="w-5 h-5 bg-primary rounded-md rotate-45" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-dark">Routiqo</span>
            </div>
            <p className="text-text-secondary text-lg max-w-xs mb-8">
              The next-generation logistics operating system for fast-growing delivery teams.
            </p>
            <div className="flex items-center gap-4">
              {[Globe, Briefcase, Code, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-dark hover:bg-dark hover:text-white hover:border-dark transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-bold text-dark mb-6">{title}</h4>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-text-secondary hover:text-dark transition-colors flex items-center gap-1 group">
                      {item} <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-text-secondary text-sm">
            © 2026 Routiqo Inc. All rights reserved. Built with ❤️ for logistics teams.
          </p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-text-secondary text-sm hover:text-dark">Status</a>
            <a href="#" className="text-text-secondary text-sm hover:text-dark">Support</a>
            <a href="#" className="text-text-secondary text-sm hover:text-dark">API Docs</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
