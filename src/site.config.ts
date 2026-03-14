/**
 * Site Configuration
 *
 * Central place for all site-wide settings.
 * Edit this file to customize for each client.
 */

export const siteConfig = {
  // Basic Info
  name: "Business Name",
  tagline: "Your tagline here",
  description: "A professional local business providing quality services to our community.",
  url: "https://example.com",

  // Contact Information
  contact: {
    phone: "(555) 123-4567",
    email: "info@example.com",
    address: {
      street: "123 Main Street",
      city: "Anytown",
      state: "ST",
      zip: "12345",
    },
  },

  // Social Media
  social: {
    facebook: "https://facebook.com/example",
    instagram: "https://instagram.com/example",
    bluesky: "https://bsky.app/profile/example.bsky.social",
    linkedin: "",
    youtube: "",
  },

  // Business Hours
  hours: [
    { days: "Monday - Friday", hours: "8:00 AM - 6:00 PM" },
    { days: "Saturday", hours: "9:00 AM - 4:00 PM" },
    { days: "Sunday", hours: "Closed" },
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
      { label: "Service One", href: "/services/service-one" },
      { label: "Service Two", href: "/services/service-two" },
      { label: "Service Three", href: "/services/service-three" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
};

export type SiteConfig = typeof siteConfig;
