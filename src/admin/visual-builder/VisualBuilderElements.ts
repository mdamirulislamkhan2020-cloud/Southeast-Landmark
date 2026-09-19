import type { BlockType, PageBlock } from "../api/lead-pages";
import {
  Layout,
  Columns,
  Square,
  Minus,
  Type,
  AlignLeft,
  Image,
  Link,
  Sparkles,
  Video,
  Code,
  CheckSquare,
  Hash,
  HelpCircle,
  MessageSquare,
  Images,
  Building,
  FileText,
  ClipboardList,
  Phone,
  MapPin,
  Flame,
  Layers,
} from "lucide-react";

export interface VisualElementDefinition {
  id: string;
  type: BlockType;
  label: string;
  category: "Layout" | "Basic" | "Content" | "Dynamic";
  icon: typeof Layout;
  description: string;
  defaultData: Record<string, unknown>;
}

export const VISUAL_ELEMENTS: VisualElementDefinition[] = [
  // LAYOUT
  {
    id: "hero",
    type: "hero",
    label: "Hero Section",
    category: "Layout",
    icon: Flame,
    description: "High-impact banner with title, subtitle, CTA button and stats",
    defaultData: {
      title: "Landmark Living Awaits",
      subtitle: "Discover premium residences and residential plots in Dhaka.",
      crumb: "Home",
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
      ctaLabel: "Explore Projects",
      ctaHref: "/property",
    },
  },
  {
    id: "cta",
    type: "cta",
    label: "Call to Action",
    category: "Layout",
    icon: Sparkles,
    description: "High-conversion banner with bold headline and button",
    defaultData: {
      title: "Ready to Secure Your Plot?",
      subtitle: "Talk to our dedicated property advisors today for consultation and booking.",
      ctaLabel: "Contact Our Advisors",
      ctaHref: "/contact",
    },
  },
  {
    id: "spacing",
    type: "spacing",
    label: "Spacer",
    category: "Layout",
    icon: Square,
    description: "Adjustable vertical spacing between sections",
    defaultData: {
      height: 48,
    },
  },
  {
    id: "divider",
    type: "divider",
    label: "Divider",
    category: "Layout",
    icon: Minus,
    description: "Clean horizontal separator line",
    defaultData: {},
  },

  // BASIC
  {
    id: "text",
    type: "text",
    label: "Text / Heading",
    category: "Basic",
    icon: Type,
    description: "Rich text heading, subtitle, body paragraphs and link",
    defaultData: {
      eyebrow: "About Our Project",
      title: "Grow the Value of Your Land Portfolio",
      subtitle: "Planned township with wide roads and utility reservations.",
      body: "Southeast Landmark Ltd. develops communities with a focus on client satisfaction, legally verified titles, and seamless installments.",
      ctaLabel: "Read More",
      ctaHref: "/about",
    },
  },
  {
    id: "image",
    type: "image",
    label: "Image",
    category: "Basic",
    icon: Image,
    description: "Responsive photo or graphic with caption",
    defaultData: {
      src: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
      alt: "Southeast Landmark Community",
      caption: "Planned township landscape and road infrastructure",
    },
  },
  {
    id: "gallery",
    type: "gallery",
    label: "Gallery",
    category: "Basic",
    icon: Images,
    description: "Multi-column responsive image gallery grid",
    defaultData: {
      images: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=75",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=75",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=75",
      ],
    },
  },
  {
    id: "video",
    type: "video",
    label: "Video",
    category: "Basic",
    icon: Video,
    description: "Responsive YouTube or direct video player embed",
    defaultData: {
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
  },
  {
    id: "html",
    type: "html",
    label: "Custom HTML",
    category: "Basic",
    icon: Code,
    description: "Raw HTML code block for custom widgets or scripts",
    defaultData: {
      html: "<div class='p-6 bg-primary/5 rounded-xl border border-primary/20 text-center font-medium'>Custom HTML Component</div>",
    },
  },

  // CONTENT
  {
    id: "features",
    type: "features",
    label: "Features Grid",
    category: "Content",
    icon: CheckSquare,
    description: "Multi-column feature cards with icons and descriptions",
    defaultData: {
      eyebrow: "Why Choose Us",
      title: "Planned For Your Future",
      subtitle: "Designed with modern amenities, security, and connectivity.",
      items: [
        { title: "Mutation-Ready Land", text: "100% legally vetted plots with clear demarcation." },
        { title: "Easy Installments", text: "Flexible payment plans up to 60 months." },
        { title: "Prime Location", text: "Beside Mirpur National Zoo, Savar, Dhaka." },
        { title: "Wide Internal Roads", text: "30ft to 60ft planned road network with utilities." },
      ],
    },
  },
  {
    id: "counter",
    type: "counter",
    label: "Statistics Counter",
    category: "Content",
    icon: Hash,
    description: "Highlight milestone numbers, completed projects, and happy clients",
    defaultData: {
      title: "Proven Track Record",
      subtitle: "Over a decade of excellence in Bangladesh real estate development.",
      items: [
        { value: "14+", label: "Years Experience" },
        { value: "1,800+", label: "Happy Plot Owners" },
        { value: "100%", label: "Legally Verified Land" },
        { value: "500+", label: "Acres Masterplanned" },
      ],
    },
  },
  {
    id: "faq",
    type: "faq",
    label: "FAQ Accordion",
    category: "Content",
    icon: HelpCircle,
    description: "Interactive collapsible question and answer accordion",
    defaultData: {
      eyebrow: "Common Questions",
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about purchasing land with us.",
      items: [
        {
          q: "What documents do I receive upon booking a plot?",
          a: "You receive an official allotment letter, payment schedule receipt, and copies of verified land deed records.",
        },
        {
          q: "Are installment plans available?",
          a: "Yes, we provide flexible installment options ranging from 12 to 60 monthly installments without hidden charges.",
        },
        {
          q: "Can I visit the project site before booking?",
          a: "Absolutely! We arrange free guided transport for site visits every Friday and Saturday.",
        },
      ],
    },
  },
  {
    id: "testimonials",
    type: "testimonials",
    label: "Testimonials",
    category: "Content",
    icon: MessageSquare,
    description: "Client reviews and verified customer testimonials",
    defaultData: {
      eyebrow: "Client Stories",
      title: "What Our Plot Owners Say",
      source: "all",
      items: [
        {
          author: "Engr. Rafiqul Islam",
          role: "Plot Owner, Sector 3",
          quote: "The registration process was completely seamless and transparent. Highly recommended for genuine land buyers.",
        },
        {
          author: "Dr. Farhana Ahmed",
          role: "Investor",
          quote: "Southeast Landmark delivers on their commitment. Excellent road connectivity and utility planning.",
        },
      ],
    },
  },

  // DYNAMIC
  {
    id: "property_grid",
    type: "property_grid",
    label: "Property Grid",
    category: "Dynamic",
    icon: Building,
    description: "Live listings queried directly from the Supabase properties database",
    defaultData: {
      eyebrow: "Available Properties",
      title: "Featured Real Estate Listings",
      ctaLabel: "View All Projects",
      ctaHref: "/property",
      limit: 6,
    },
  },
  {
    id: "blog_grid",
    type: "blog_grid",
    label: "Blog Grid",
    category: "Dynamic",
    icon: FileText,
    description: "Latest news, land buying guides, and real estate articles",
    defaultData: {
      eyebrow: "Latest Insights",
      title: "Real Estate Articles & Guides",
      subtitle: "Expert tips on Bangladesh property law, valuation, and urban development.",
      ctaLabel: "Read More Articles",
      ctaHref: "/blog",
      limit: 3,
    },
  },
  {
    id: "lead_form",
    type: "lead_form",
    label: "Lead Capture Form",
    category: "Dynamic",
    icon: ClipboardList,
    description: "Embed dynamic forms created in the Forms Manager",
    defaultData: {
      title: "Request Site Visit & Price List",
      formId: null,
    },
  },
  {
    id: "contact",
    type: "contact",
    label: "Contact Cards",
    category: "Dynamic",
    icon: Phone,
    description: "Official phone, email, and corporate office address cards",
    defaultData: {
      phone: "+880 1700-000000",
      email: "info@southeastlandmark.com",
      address: "House #12, Road #4, Sector #3, Uttara, Dhaka-1230",
    },
  },
  {
    id: "map",
    type: "map",
    label: "Google Map",
    category: "Dynamic",
    icon: MapPin,
    description: "Interactive location map embed for project site or office",
    defaultData: {
      embed: "https://maps.google.com/maps?q=Dhaka,Bangladesh&t=&z=13&ie=UTF8&iwloc=&output=embed",
    },
  },
];

export function createBlockFromDefinition(def: VisualElementDefinition): PageBlock {
  const uid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  return {
    id: uid,
    type: def.type,
    data: JSON.parse(JSON.stringify(def.defaultData)),
  };
}
