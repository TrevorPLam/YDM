export interface Industry {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  imageUrl: string;
  challenge: string;
  strategy: string;
  outcome: string;
}

export const industries: Industry[] = [
  {
    name: "Photographers",
    slug: "photographers",
    tagline: "Showcase Your Vision",
    description: "Portfolio-driven experiences that turn casual browsers into booked clients.",
    imageUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200",
    challenge: "Standing out in a saturated visual market with slow-loading galleries.",
    strategy: "High-performance, minimal framing that puts the image first while optimizing for local SEO.",
    outcome: "40% increase in qualified booking inquiries."
  },
  {
    name: "Plumbers",
    slug: "plumbers",
    tagline: "Flowing Digital Leads",
    description: "High-conversion local sites optimized for emergency calls and trust.",
    imageUrl: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1200",
    challenge: "Capturing immediate intent when customers face emergencies.",
    strategy: "Mobile-first, click-to-call driven design with deep local service page structuring.",
    outcome: "3x increase in emergency call volume."
  },
  {
    name: "HVAC",
    slug: "hvac",
    tagline: "Climate Controlled Growth",
    description: "Trust-building platforms that make seasonal maintenance easy to book.",
    imageUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200",
    challenge: "Overcoming seasonal revenue spikes and building year-round recurring business.",
    strategy: "Automated booking flows and membership-first UX architecture.",
    outcome: "65% higher conversion on annual maintenance plans."
  },
  {
    name: "DJs",
    slug: "djs",
    tagline: "The Perfect Mix",
    description: "Vibrant, audio-visual portfolios that sell the party before it starts.",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200",
    challenge: "Translating live energy into a static digital medium.",
    strategy: "Immersive video headers, integrated mix hosting, and seamless availability checkers.",
    outcome: "Fully booked wedding seasons 12 months in advance."
  },
  {
    name: "Hair Salons",
    slug: "hair-salons",
    tagline: "Styled for Success",
    description: "Chic, easy-to-use booking platforms that keep chairs full.",
    imageUrl: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200",
    challenge: "Reducing no-shows and simplifying complex service bookings.",
    strategy: "Integrated calendar systems with style-quiz onboarding to qualify clients.",
    outcome: "20% reduction in admin time spent on phones."
  },
  {
    name: "Daycares",
    slug: "daycares",
    tagline: "Nurturing Trust Online",
    description: "Warm, reassuring designs that give parents peace of mind.",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200",
    challenge: "Communicating safety, curriculum, and facility quality digitally.",
    strategy: "Virtual tour integrations, transparent pricing modules, and secure parent portals.",
    outcome: "Waitlists filled through organic search alone."
  },
  {
    name: "Bloggers",
    slug: "bloggers",
    tagline: "Content that Captivates",
    description: "Lightning-fast reading experiences optimized for ad revenue and subscriptions.",
    imageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200",
    challenge: "Balancing monetization with reader experience and core web vitals.",
    strategy: "Headless architecture, intelligent ad-placements, and aggressive caching.",
    outcome: "150% boost in ad RPMs due to improved viewability."
  },
  {
    name: "Restaurants",
    slug: "restaurants",
    tagline: "A Feast for the Eyes",
    description: "Appetizing interfaces that drive reservations and seamless online ordering.",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
    challenge: "Relying too heavily on third-party delivery apps with high fees.",
    strategy: "Native online ordering, gorgeous menu visuals, and integrated loyalty programs.",
    outcome: "Shifted 30% of delivery volume to fee-free native platform."
  },
  {
    name: "Fitness Studios",
    slug: "fitness-studios",
    tagline: "Power Your Presence",
    description: "High-energy sites that convert visitors into members.",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200",
    challenge: "Differentiating studio culture from big-box gyms.",
    strategy: "Instructor-first layouts, class sneak-peeks, and frictionless trial signups.",
    outcome: "Doubled trial-to-member conversion rate."
  },
  {
    name: "Real Estate",
    slug: "real-estate",
    tagline: "Properties that Pop",
    description: "Luxurious property showcases and IDX-integrated search platforms.",
    imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200",
    challenge: "Providing better search experiences than national aggregators.",
    strategy: "Hyper-local neighborhood guides paired with blazing fast map-based search.",
    outcome: "Increased exclusive listings by 25%."
  },
  {
    name: "Veterinarians",
    slug: "veterinarians",
    tagline: "Caring for the Digital Pet",
    description: "Compassionate, informative sites that reassure pet owners.",
    imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200",
    challenge: "Handling emergency triage vs routine booking online.",
    strategy: "Clear user flows separating urgent care from wellness, with integrated patient records.",
    outcome: "Streamlined clinic operations and reduced call wait times."
  },
  {
    name: "Accountants",
    slug: "accountants",
    tagline: "Calculated Digital Growth",
    description: "Professional, secure platforms that build authority and trust.",
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200",
    challenge: "Appearing modern and approachable while maintaining strict security optics.",
    strategy: "Clean typography, secure document portal integrations, and authoritative resource hubs.",
    outcome: "50% increase in high-net-worth client acquisitions."
  }
];
