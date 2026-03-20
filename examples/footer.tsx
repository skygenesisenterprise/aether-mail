'use client';

import Link from 'next/link';
import { Linkedin as LinkedinIcon, Twitter as TwitterIcon, Github as GithubIcon, Mail, MessageCircle, Camera, Globe, Youtube, Twitch } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  // Security: Sanitize user input
  const sanitizeText = (text: string): string => {
    return text.replace(/[<>'"&]/g, '').trim().substring(0, 100);
  };

  // Security: Validate URLs for external links
  const isValidUrl = (url: string): boolean => {
    try {
      // Allow relative URLs, same-origin absolute URLs, and specific external domains
      if (url.startsWith('/')) return true;
      if (url.startsWith('http')) {
        const parsed = new URL(url);
        const allowedDomains = [
          'skygenesisenterprise.com',
          'linkedin.com',
          'twitter.com',
          'github.com',
          'youtube.com',
          'twitch.tv',
          'instagram.com',
          'mastodon.social'
        ];
        return allowedDomains.some(domain => 
          parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
        );
      }
      return false;
    } catch {
      return false;
    }
  };

  // Security: Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Main Navigation Links
  const navigationLinks = [
    { name: 'Home', href: '/' },
    { name: 'Aether Office', href: '/aether-office' },
    { name: 'Governance', href: '/governance' },
    { name: 'Company', href: '/company' },
    { name: 'Vision', href: '/vision' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
  ];

  // Resources Links
  const resourcesLinks = [
    { name: 'Documentation', href: '/docs' },
    { name: 'API Reference', href: '/api/docs' },
    { name: 'Guides & Tutorials', href: '/guides' },
    { name: 'Changelog', href: '/changelog' },
    { name: 'Whitepapers', href: '/whitepaper' },
    { name: 'Developer Portal', href: 'https://developer.skygenesisenterprise.com' },
    { name: 'Newsletter', href: '/newsletter'},
    { name: 'Certificates', href: '/certificates'}
  ];

  // Enterprise Solutions
  const enterpriseSolutions = [
    { 
      name: 'Security & Compliance', 
      href: '/solutions/security',
      description: 'GDPR compliance tools and enterprise security standards'
    },
    { 
      name: 'Scalable Infrastructure', 
      href: '/solutions/infrastructure',
      description: 'Cloud-native architecture and high-availability solutions'
    },
    { 
      name: 'Deployment Options', 
      href: '/solutions/deployment',
      description: 'SaaS, on-premises, and hybrid cloud integration'
    },
  ];

  // Contact & Support Links
  const contactSupportLinks = [
    { name: 'Support Portal', href: 'https://support.skygenesisenterprise.com' },
    { name: 'Sales Inquiry', href: '/contact/sales' },
    { name: 'Office Locations', href: '/contact/locations' },
  ];

  // Legal Links
  const legalLinks = [
    { name: 'Privacy Policy', href: '/policies/privacy' },
    { name: 'Terms of Service', href: '/policies/terms' },
    { name: 'Cookie Policy', href: '/policies/cookies' },
    { name: 'GDPR Compliance', href: '/policies/gdpr' },
    { name: 'Legal Notice', href: '/policies/legal' },
    { name: 'License', href: '/license'}
  ];

  // Social Media Links
  const socialLinks = [
    { name: 'LinkedIn', href: 'https://linkedin.com/company/skygenesisenterprise', icon: <LinkedinIcon className="w-5 h-5" /> },
    { name: 'Twitter', href: 'https://twitter.com/skyGenterprise', icon: <TwitterIcon className="w-5 h-5" /> },
    { name: 'GitHub', href: 'https://github.com/skygenesisenterprise', icon: <GithubIcon className="w-5 h-5" /> },
    { name: 'YouTube', href: 'https://youtube.com/@skygenesisenterprise', icon: <Youtube className="w-5 h-5" /> },
    { name: 'Twitch', href: 'https://twitch.tv/skygenesisenterprise', icon: <Twitch className="w-5 h-5" /> },
    { name: 'Discord', href: '/discord', icon: <MessageCircle className="w-5 h-5" /> },
    { name: 'Instagram', href: 'https://instagram.com/skygenesisenterprise', icon: <Camera className="w-5 h-5" /> },
    { name: 'Mastodon', href: 'https://mastodon.social/@skygenesisenterprise', icon: <Globe className="w-5 h-5" /> },
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Security: Validate email before processing
    const sanitizedEmail = sanitizeText(email);
    
    if (!isValidEmail(sanitizedEmail)) {
      // Handle invalid email (show error message, etc.)
      console.error('Invalid email format');
      return;
    }
    
    // Handle newsletter subscription logic here
    // TODO: Replace with actual API call
    // console.log('Newsletter subscription:', sanitizedEmail);
    setEmail('');
  };

  return (
    <footer className="relative bg-black overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-20">
              
              {/* Brand Section - Left */}
              <div className="lg:col-span-1">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
                    Sky Genesis Enterprise
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-sm mb-2">
                    Empowering European digital sovereignty through enterprise-grade solutions
                  </p>
                  <p className="text-gray-500 leading-relaxed text-xs">
                    Building secure, scalable digital infrastructure for the modern European enterprise
                  </p>
                </div>
                
                {/* Contact Information */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-gray-400 hover:text-white transition-colors duration-200">
                    <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">contact@skygenesisenterprise.com</span>
                  </div>
                </div>
                
                {/* Social Media */}
                <div className="flex space-x-3 mb-4">
                   {socialLinks.map((social) => (
                     <Button
                       key={social.name}
                       variant="outline"
                       size="icon"
                       asChild
                       className="w-10 h-10 bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 hover:bg-gray-800"
                     >
                       <a
                         href={isValidUrl(social.href) ? social.href : '#'}
                         target="_blank"
                         rel="noopener noreferrer"
                         aria-label={sanitizeText(social.name)}
                       >
                         {social.icon}
                       </a>
                     </Button>
                   ))}
                </div>

                 {/* Service Status */}
                 <div>
                    <a 
                      href={isValidUrl("https://status.skygenesisenterprise.com") ? "https://status.skygenesisenterprise.com" : "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                     <span className="text-sm">All services are online</span>
                   </a>
                 </div>
              </div>

              {/* Navigation Links - Right */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
                  {/* Navigation Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                      Navigation
                    </h4>
                    <ul className="space-y-3">
                       {navigationLinks.map((link) => (
                         <li key={sanitizeText(link.name)}>
                           <Link
                             href={isValidUrl(link.href) ? link.href : '/'}
                             className="text-sm text-gray-400 hover:text-white transition-colors duration-200 group flex items-center"
                           >
                             <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">
                               {sanitizeText(link.name)}
                             </span>
                           </Link>
                         </li>
                       ))}
                    </ul>
                  </div>

                  {/* Resources Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                      Resources
                    </h4>
                    <ul className="space-y-3">
                       {resourcesLinks.map((link) => (
                         <li key={sanitizeText(link.name)}>
                           <Link
                             href={isValidUrl(link.href) ? link.href : '/docs'}
                             className="text-sm text-gray-400 hover:text-white transition-colors duration-200 group flex items-center"
                           >
                             <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">
                               {sanitizeText(link.name)}
                             </span>
                           </Link>
                         </li>
                       ))}
                    </ul>
                  </div>

                  {/* Enterprise Solutions Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                      Enterprise Solutions
                    </h4>
                    <ul className="space-y-3">
                       {enterpriseSolutions.map((solution) => (
                         <li key={sanitizeText(solution.name)}>
                           <Link
                             href={isValidUrl(solution.href) ? solution.href : '/solutions/security'}
                             className="text-sm text-gray-400 hover:text-white transition-colors duration-200 group flex items-center"
                           >
                             <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">
                               {sanitizeText(solution.name)}
                             </span>
                           </Link>
                         </li>
                       ))}
                    </ul>
                  </div>

                  {/* Contact & Support Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                      Contact & Support
                    </h4>
                    <ul className="space-y-3">
                       {contactSupportLinks.map((link) => (
                         <li key={sanitizeText(link.name)}>
                           <Link
                             href={isValidUrl(link.href) ? link.href : '/contact/sales'}
                             className="text-sm text-gray-400 hover:text-white transition-colors duration-200 group flex items-center"
                           >
                             <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">
                               {sanitizeText(link.name)}
                             </span>
                           </Link>
                         </li>
                       ))}
                    </ul>
                  </div>

                  {/* Legal & Policies Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                      Legal & Policies
                    </h4>
                    <ul className="space-y-3">
                       {legalLinks.map((link) => (
                         <li key={sanitizeText(link.name)}>
                           <Link
                             href={isValidUrl(link.href) ? link.href : '/policies/privacy'}
                             className="text-sm text-gray-400 hover:text-white transition-colors duration-200 group flex items-center"
                           >
                             <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">
                               {sanitizeText(link.name)}
                             </span>
                           </Link>
                         </li>
                       ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Section - Dedicated Space */}
          <div className="py-12 border-t border-gray-900">
            <div className="max-w-2xl mx-auto text-center space-y-4 md:space-y-6">
              
              <h4 className="text-lg font-semibold text-white">
                Stay Connected
              </h4>

              <p className="text-sm text-gray-400 leading-relaxed">
                Get updates on our latest solutions and enterprise insights delivered directly to your inbox
              </p>

              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                 <input
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(sanitizeText(e.target.value))}
                   placeholder="Enter your email address"
                   required
                   maxLength={100}
                   className="flex-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 focus:bg-gray-800 transition-all duration-200"
                 />
                <button
                  type="submit"
                  className="bg-white text-black px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors duration-200 transform hover:scale-105 whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="py-8 border-t border-gray-900">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm text-gray-400">
                <span>© {currentYear} Sky Genesis Enterprise. All rights reserved.</span>
              </div>
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
                <span>Liège, Belgium (HQ)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}