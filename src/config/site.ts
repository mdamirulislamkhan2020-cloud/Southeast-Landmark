export const site = {
  name: "Southeast Landmark Ltd",
  short: "Southeast Landmark",
  tagline:
    "Southeast Landmark Ltd. is one of Bangladesh's fastest-growing land developers, established in 2010. We deliver safe, beautiful, and master-planned residential plots in Savar, Bonogram (near Mirpur Zoo), treating every client like family with transparent documentation and timely handover.",
  hours: "Sat – Thu 9:00 – 6:00, Friday CLOSED",
  address:
    "Corporate Office: 19/2-C, 4th floor, Ring Road, Adabor, Mohammadpur, Dhaka – 1207",
  projectAddress:
    "Project Location: Savar, Bonogram (Beside Mirpur National Zoo), Dhaka",
  phone: "01591-134357",
  email: "info@southeastlandmark.com",
  nav: [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/property", label: "Projects" },
    { to: "/career", label: "Career" },
    { to: "/blog", label: "Blog" },
    { to: "/faq", label: "FAQ" },
    { to: "/contact", label: "Contact" },
  ] as const,
};

export type NavItem = (typeof site.nav)[number];