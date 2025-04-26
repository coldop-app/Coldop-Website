// Hero section data types
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

// Hero section data
export const heroData: HeroData = {
  heading: "All-in-one app for cold storage and farmers.",
  description: "Say goodbye to paperwork — Coldop is your all-in-one mobile ERP for cold storage, logging every transaction from arrival to release, ready to print or sync anytime.",
  ctaButtons: [
    { text: "Start managing", link: "#" },
    { text: "How it works ↓", link: "#" }
  ],
  customerImages: [
    { src: "./customers/customer-1.jpg", alt: "Customer photo" },
    { src: "./customers/customer-2.jpg", alt: "Customer photo" },
    { src: "./customers/customer-3.jpg", alt: "Customer photo" },
    { src: "./customers/customer-4.jpg", alt: "Customer photo" },
    { src: "./customers/customer-5.jpg", alt: "Customer photo" },
    { src: "./customers/customer-6.jpg", alt: "Customer photo" }
  ],
  customerStats: {
    count: "300+ farmers",
    text: "using Coldop to manage their harvests."
  },
  heroImage: {
    webp: "./hero.webp",
    png: "./hero-min.png",
    alt: "Woman enjoying food, meals in storage container, and food bowls on a table"
  }
};


// Pricing data types
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

// Pricing data
export const pricingData: PricingData = {
  title: "Pricing",
  heading: "Smart crop storage that's easy on the wallet",
  plans: [
    {
      name: "Starter",
      price: "399",
      currency: "$",
      period: "per month.",
      features: [
        "1 crop per day",
        "Order from 11am to 9pm",
        "Recovery is free",
        ""
      ],
      cta: {
        text: "Start storing",
        link: "#"
      }
    },
    {
      name: "Complete",
      price: "649",
      currency: "$",
      period: "per month.",
      features: [
        "<strong>2 crops</strong> per day",
        "Order <strong>24/7</strong>",
        "Recovery is free",
        "Get access to all storages"
      ],
      cta: {
        text: "Start storing",
        link: "#"
      },
      highlighted: true
    }
  ],
  disclaimer: "Prices include all applicable taxes. You can cancel at any time. Both plans include the following:",
  features: [
    {
      title: "Purity Pact",
      description: "The crop cold-storage app, a steadfast commitment to crop freshness, minimizing waste, and ensuring unparalleled quality."
    },
    {
      title: "Extended Shelf Life",
      description: "Optimal temperature control in the app helps extend the shelf life of stored crops, reducing economic losses to farmers."
    },
    {
      title: "Loss Prevention:",
      description: "By maintaining ideal storage conditions, the app prevents deterioration, contributing to reduced economic loss for farmers."
    },
    {
      title: "Efficient Inventory",
      description: "The app facilitates smart inventory management, aiding farmers in tracking, planning, and optimizing supply chain logistics."
    }
  ]
};

// How it works data types
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

// How it works data
export const howItWorksData: HowItWorksData = {
  title: "How it works",
  subtitle: "Your daily dose of 3 simple steps",
  steps: [
    {
      number: "01",
      heading: "Register with your store-Admin",
      description: "Start your farming journey by swiftly registering with a dedicated store admin. This personalized connection unlocks tailored features, ensuring efficient communication and setting the stage for a productive farming experience.",
      image: "./app-screen-1.png"
    },
    {
      number: "02",
      heading: "Fill in details about the crop",
      description: "Next, farmers input crucial details about themselves and the stored crop. This ensures accurate records and personalized assistance, contributing to efficient crop management tailored to individual needs.",
      image: "./app-screen-2.png"
    },
    {
      number: "03",
      heading: "Receive confirmation on WhatsApp",
      description: "Upon successful storage of your crops, you'll instantly receive a confirmation on WhatsApp. This ensures swift acknowledgment and provides peace of mind, allowing you to proceed confidently with the knowledge that your harvest is securely stored and ready for future use.",
      image: "./app-screen-3.png"
    }
  ]
};





// Testimonials data types
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

// Testimonials data
export const testimonialsData: TestimonialsData = {
  title: "Testimonials",
  heading: "Once you try it, you won't go back to the old ways.",
  testimonials: [
    {
      image: "./customers/dave.jpg",
      alt: "Photo of customer Dave Bryson",
      quote: "Affordable, nutritious, and deliciously preserved crops, without the need for manual handling! It's like experiencing a frosty enchantment for your harvest.",
      name: "Dave Bryson"
    },
    {
      image: "./customers/ben.jpg",
      alt: "Photo of customer Ben Hadley",
      quote: "The cold storage app is remarkably efficient, selecting the optimal crops every time. It's incredible to be free from concerns about crop preservation!",
      name: "Ben Hadley"
    },
    {
      image: "./customers/steve.jpg",
      alt: "Photo of customer Steve Miller",
      quote: "ChillHarbor, the cold storage app, is a game-changer! It streamlines my crop storage, making it effortless and ensuring my produce stays fresh. Truly a lifesaver!",
      name: "Steve Miller"
    },
    {
      image: "./customers/hannah.jpg",
      alt: "Photo of customer Hannah Smith",
      quote: "ChillHarbor is a crop storage gem! Stress-free and efficient, it's the perfect companion for modern farmers, allowing focus on other farm aspects.",
      name: "Hannah Smith"
    }
  ],
  galleryImages: [
    { src: "./gallery/gallery-1.jpg", alt: "Photo of beautifully arranged food" },
    { src: "./gallery/gallery-2.jpg", alt: "Photo of beautifully arranged food" },
    { src: "./gallery/gallery-3.jpg", alt: "Photo of beautifully arranged food" },
    { src: "./gallery/gallery-4.jpg", alt: "Photo of beautifully arranged food" },
    { src: "./gallery/gallery-5.jpg", alt: "Photo of beautifully arranged food" },
    { src: "./gallery/gallery-6.jpg", alt: "Photo of beautifully arranged food" },
    { src: "./gallery/gallery-7.jpg", alt: "Photo of beautifully arranged food" },
    { src: "./gallery/gallery-8.jpg", alt: "Photo of beautifully arranged food" },
    { src: "./gallery/gallery-9.jpg", alt: "Photo of beautifully arranged food" },
    { src: "./gallery/gallery-10.jpg", alt: "Photo of beautifully arranged food" },
    { src: "./gallery/gallery-11.jpg", alt: "Photo of beautifully arranged food" },
    { src: "./gallery/gallery-12.jpg", alt: "Photo of beautifully arranged food" }
  ]
};


// Footer data types
export interface SocialLink {
  icon: string;
  href: string;
}

export interface FooterNavLink {
  text: string;
  href: string;
}

export interface FooterNavColumn {
  title: string;
  links: FooterNavLink[];
}

export interface FooterData {
  companyName: string;
  year: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  socialLinks: SocialLink[];
  navColumns: FooterNavColumn[];
}

// Footer data
export const footerData: FooterData = {
  companyName: "Coldstorage",
  year: "2027",
  logo: "omnifood-logo.png",
  address: "623 Harrison St., 2nd Floor, San Francisco, CA 94107",
  phone: "415-201-6370",
  email: "hello@omnifood.com",
  socialLinks: [
    { icon: "I1", href: "#" },
    { icon: "I1", href: "#" },
    { icon: "I1", href: "#" }
  ],
  navColumns: [
    {
      title: "Account",
      links: [
        { text: "Create account", href: "#" },
        { text: "Sign In", href: "#" },
        { text: "iOS app", href: "#" },
        { text: "Android app", href: "#" }
      ]
    },
    {
      title: "Company",
      links: [
        { text: "About Cold Storage", href: "#" },
        { text: "For Business", href: "#" },
        { text: "Our partners", href: "#" },
        { text: "Careers", href: "#" }
      ]
    },
    {
      title: "Resources",
      links: [
        { text: "Recipe directory", href: "#" },
        { text: "Help center", href: "#" },
        { text: "Privacy & terms", href: "#" }
      ]
    }
  ]
};