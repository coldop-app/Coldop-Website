import type { ReactNode } from 'react';

/* =====================================================
   HERO
===================================================== */

export interface CustomerImage {
  src: string;
  alt: string;
}

export interface CTAButton {
  text: string;
  link: string;
}

export interface HeroData {
  heading: string;
  description: string;
  ctaButtons: CTAButton[];
  customerImages: CustomerImage[];
  customerStats: {
    count: string;
    text: string;
  };
  heroImage: {
    webp: string;
    png: string;
    alt: string;
  };
}

export const heroData: HeroData = {
  heading: 'The Complete Cold Storage Management Platform.',
  description:
    'Mobile app, web dashboard, WhatsApp updates, and instant receipt printing — all in one system. Stay connected and in control. Anytime, anywhere.',
  ctaButtons: [
    { text: 'Start Today', link: '/store-admin/login' },
    { text: 'How It Works ↓', link: '/#how-it-works' },
  ],
  customerImages: [
    { src: './customers/customer-1.jpg', alt: 'Customer photo' },
    { src: './customers/customer-2.jpg', alt: 'Customer photo' },
    { src: './customers/customer-3.jpg', alt: 'Customer photo' },
    { src: './customers/customer-4.jpg', alt: 'Customer photo' },
    { src: './customers/customer-5.jpg', alt: 'Customer photo' },
    { src: './customers/customer-6.jpg', alt: 'Customer photo' },
  ],
  customerStats: {
    count: '300+ farmers',
    text: 'using Coldop to manage their harvests.',
  },
  heroImage: {
    webp: '/hero-min.webp',
    png: '/hero-min.webp',
    alt: 'Woman enjoying food, meals in storage container, and food bowls on a table',
  },
};

/* =====================================================
   PRICING
===================================================== */

export interface PricingPlan {
  name: string;
  price: string;
  currency: string;
  period: string;
  features: string[];
  cta: {
    text: string;
    link: string;
  };
  highlighted?: boolean;
}

export interface PricingFeature {
  title: string;
  description: string;
}

export interface PricingData {
  title: string;
  heading: string;
  plans: PricingPlan[];
  disclaimer: string;
  features: PricingFeature[];
}

export const pricingData: PricingData = {
  title: 'Pricing',
  heading: 'Smart pricing for complete control.',
  plans: [
    {
      name: 'Starter',
      price: '36,500',
      currency: '₹',
      period: 'per month.',
      features: [
        "Order Management<br/><span class='text-muted text-sm'>Handle incoming & outgoing orders seamlessly</span>",
        "Smart Analytics<br/><span class='text-muted text-sm'>Get detailed insights into your storage operations</span>",
        "Stock Tracking<br/><span class='text-muted text-sm'>Monitor inventory levels and movements</span>",
        "PDF Reports<br/><span class='text-muted text-sm'>Generate professional reports instantly</span>",
        "WhatsApp Updates<br/><span class='text-muted text-sm'>Stay updated with instant notifications</span>",
      ],
      cta: { text: 'Start storing', link: '#' },
    },
    {
      name: 'Complete',
      price: '50,000',
      currency: '₹',
      period: 'per month.',
      highlighted: true,
      features: [
        "Everything in Starter<br/><span class='text-muted text-sm'>All features from the Starter plan</span>",
        "Advanced Printing System<br/><span class='text-muted text-sm'>Print receipts and reports on demand</span>",
        "Financial Management Suite<br/><span class='text-muted text-sm'>Handle payments and transactions efficiently</span>",
        "Smart Rent Calculator<br/><span class='text-muted text-sm'>Automated rent calculations and billing</span>",
        "HR Management Tools<br/><span class='text-muted text-sm'>Manage employee salaries and records</span>",
      ],
      cta: { text: 'Start storing', link: '#' },
    },
  ],
  disclaimer:
    'Prices include all applicable taxes. You can cancel at any time. Both plans include the following:',
  features: [
    {
      title: 'Purity Pact',
      description:
        'A steadfast commitment to crop freshness, minimizing waste, and ensuring unparalleled quality.',
    },
    {
      title: 'Extended Shelf Life',
      description:
        'Optimal temperature control helps extend shelf life and reduce economic losses.',
    },
    {
      title: 'Loss Prevention',
      description:
        'Maintaining ideal storage conditions prevents deterioration and loss.',
    },
    {
      title: 'Efficient Inventory',
      description:
        'Smart inventory tracking to plan, manage, and optimize logistics.',
    },
  ],
};

/* =====================================================
   HOW IT WORKS
===================================================== */

export interface HowItWorksStep {
  number: string;
  heading: string;
  description: string;
  image: string;
}

export interface HowItWorksData {
  title: string;
  subtitle: string;
  steps: HowItWorksStep[];
}

export const howItWorksData: HowItWorksData = {
  title: 'How it works',
  subtitle: 'Your daily dose of 3 simple steps',
  steps: [
    {
      number: '01',
      heading: 'Create Farmer Accounts',
      description:
        'Add farmers with just a name and mobile number. Each farmer gets a digital ledger.',
      image: './app-screen-1.webp',
    },
    {
      number: '02',
      heading: 'Manage Orders',
      description:
        'Record incoming and outgoing stock via mobile or web. Balances update automatically.',
      image: './app-screen-2.webp',
    },
    {
      number: '03',
      heading: 'WhatsApp Confirmation',
      description:
        'Instant WhatsApp confirmation after every successful storage entry.',
      image: './app-screen-3.webp',
    },
  ],
};

/* =====================================================
   TESTIMONIALS
===================================================== */

export interface Testimonial {
  image: string;
  alt: string;
  quote: string;
  name: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface TestimonialsData {
  title: string;
  heading: string;
  testimonials: Testimonial[];
  galleryImages: GalleryImage[];
}

export const testimonialsData: TestimonialsData = {
  title: 'Testimonials',
  heading: "Once you try it, you won't go back.",
  testimonials: [
    {
      image: './customers/dave.jpg',
      alt: 'Photo of Dave Bryson',
      quote:
        'Affordable, nutritious, and perfectly preserved crops without manual handling.',
      name: 'Dave Bryson',
    },
    {
      image: './customers/ben.jpg',
      alt: 'Photo of Ben Hadley',
      quote: 'Efficient, reliable, and stress-free crop preservation.',
      name: 'Ben Hadley',
    },
  ],
  galleryImages: [
    { src: './gallery/gallery-1.jpg', alt: 'Food arrangement' },
    { src: './gallery/gallery-2.jpg', alt: 'Food arrangement' },
    { src: './gallery/gallery/gallery-3.jpg', alt: 'Food arrangement' },
  ],
};

/* =====================================================
   DEMO VIDEO
===================================================== */

export interface DemoVideoData {
  eyebrow: string;
  title: string;
  description: string;
  videoId: string;
  videoTitle: string;
  detailsTitle: string;
  detailsDescription: string;
  ctaText: string;
  ctaHref: string;
}

export const demoVideoData: DemoVideoData = {
  eyebrow: 'See it in action',
  title: 'Watch how Coldop works',
  description:
    'Get a quick overview of how our platform helps you manage your cold storage operations efficiently.',
  videoId: 'aCQ3rb-K_m0',
  videoTitle: 'Coldop Platform Demo',
  detailsTitle: 'Complete Cold Storage Management',
  detailsDescription:
    'Our platform provides everything you need to manage your cold storage operations, from inventory tracking to automated notifications.',
  ctaText: 'Get Started Today',
  ctaHref: '/signin',
};

/* =====================================================
   FOOTER
===================================================== */

export interface FooterNavLink {
  text: string;
  href: string;
}

export interface FooterNavColumn {
  title: string;
  links: FooterNavLink[];
}

export interface FooterSocialLink {
  icon: ReactNode;
  href: string;
  label: string;
}

export interface FooterContact {
  address: string;
  phones: string[];
  email: string;
}

export interface FooterData {
  companyName: string;
  year: string;
  logo: string;
  logoAlt: string;
  description: string;
  contact: FooterContact;
  navColumns: FooterNavColumn[];
  socialLinks: FooterSocialLink[];
}

export const footerData: FooterData = {
  companyName: 'Coldop',
  year: '2026',
  logo: '/coldop-logo.webp',
  logoAlt: 'Coldop Logo',
  description:
    'The complete cold storage management platform. Mobile app, web dashboard, WhatsApp updates, and instant receipt printing — all in one system.',
  contact: {
    address: '172 New Jawahar Nagar, Jalandhar',
    phones: ['+91 9877741375', '+91 98778069258'],
    email: 'coldop.app@gmail.com',
  },
  navColumns: [
    {
      title: 'Company',
      links: [
        { text: 'About', href: '#about' },
        { text: 'How it works', href: '#how-it-works' },
        { text: 'Pricing', href: '#pricing' },
        { text: 'Case Studies', href: '/case-studies' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { text: 'Help Center', href: '/support' },
        { text: 'Privacy & Terms', href: '/privacy' },
        { text: 'FAQs', href: '/faq' },
      ],
    },
  ],
  socialLinks: [],
};
