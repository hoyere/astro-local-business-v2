/**
 * Shared component type definitions
 * Extracted from astro-component-library patterns
 */

import type { ImageMetadata } from 'astro';

// ============================================
// Common Types
// ============================================

/** Image props for Astro Image component */
export interface ImageProps {
  src: ImageMetadata | string;
  alt: string;
  width?: number;
  height?: number;
  class?: string;
  loading?: 'lazy' | 'eager';
}

/** Call-to-action button/link */
export interface Action {
  text: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'link';
  target?: '_blank' | '_self';
  icon?: string;
  class?: string;
}

// ============================================
// Button Types
// ============================================

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  fullWidth?: boolean;
  class?: string;
}

// ============================================
// Hero Types
// ============================================

export interface HeroProps {
  title?: string;
  subtitle?: string;
  tagline?: string;
  actions?: Action[];
  image?: ImageProps;
  variant?: 'simple' | 'centered' | 'split' | 'overlay';
  isReversed?: boolean;
  class?: string;
}

// ============================================
// Testimonial Types
// ============================================

export interface TestimonialAuthor {
  name: string;
  role?: string;
  company?: string;
  image?: ImageProps;
}

export interface TestimonialItem {
  content: string;
  author: TestimonialAuthor;
  rating?: number;
}

export interface TestimonialsProps {
  title?: string;
  subtitle?: string;
  testimonials?: TestimonialItem[];
  variant?: 'grid' | 'carousel' | 'featured';
  columns?: 1 | 2 | 3;
  class?: string;
}

// ============================================
// Card Types
// ============================================

export interface CardProps {
  title?: string;
  description?: string;
  image?: ImageProps;
  href?: string;
  variant?: 'default' | 'horizontal' | 'featured';
  hasHoverEffect?: boolean;
  class?: string;
}

// ============================================
// Section Types
// ============================================

export interface SectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  tagline?: string;
  alternate?: boolean;
  class?: string;
}

// ============================================
// Contact/Form Types
// ============================================

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  bluesky?: string;
  linkedin?: string;
  youtube?: string;
}

export interface BusinessHours {
  days: string;
  hours: string;
}

// ============================================
// Navigation Types
// ============================================

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  isExternal?: boolean;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}
