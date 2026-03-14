/**
 * Site Configuration
 *
 * Central place for all site-wide settings.
 * Edit this file to customize for each client.
 */

export const siteConfig = {
  // Basic Info
  name: "GrowthAutomations Pool Systems",
  tagline: "Crystal-clear water, precision-engineered maintenance",
  description: "Professional pool cleaning and maintenance services with systematic precision. We bring data-driven processes to every backyard oasis.",
  url: "https://ga-pool-systems.growthautomations.app",

  // Contact Information
  contact: {
    phone: "(512) 270-7665",
    email: "pools@growthautomations.app",
    address: {
      street: "4200 Aqua Systems Drive",
      city: "Austin",
      state: "TX",
      zip: "78745",
    },
  },

  // Social Media
  social: {
    facebook: "https://facebook.com/gapoolsystems",
    instagram: "https://instagram.com/gapoolsystems",
    bluesky: "https://bsky.app/profile/gapoolsystems.bsky.social",
    linkedin: "https://linkedin.com/company/growthautomations",
    youtube: "",
  },

  // Business Hours
  hours: [
    { days: "Monday - Friday", hours: "7:00 AM - 6:00 PM" },
    { days: "Saturday", hours: "8:00 AM - 4:00 PM" },
    { days: "Sunday", hours: "Emergency Only" },
  ],

  // Navigation Links
  navigation: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],

  // Footer Links
  footerLinks: {
    services: [
      { label: "Routine Maintenance", href: "/services/routine-maintenance" },
      { label: "Water Chemistry", href: "/services/water-chemistry" },
      { label: "Equipment Diagnostics", href: "/services/equipment-diagnostics" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
};

export type SiteConfig = typeof siteConfig;
