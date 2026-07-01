export const site = {
  name: "Southeast Landmark Ltd",
  short: "Southeast Landmark",
  tagline:
    "Southeast Landmark is a land development company committed to delivering thoughtfully planned residential plots and township projects for families and investors across Bangladesh.",
  hours: "Sat – Thu 9:00 – 6:00, Friday CLOSED",
  address:
    "Corporate Office: 19/2-C, 4th floor, Ring Road, Adabor, Mohammadpur, Dhaka – 1207",
  phone: "01591-134357",
  email: "info@southeastlandmark.com",
  nav: [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/property", label: "Projects" },
    { to: "/blog", label: "Blog" },
    { to: "/faq", label: "FAQ" },
    { to: "/contact", label: "Contact" },
  ] as const,
};

export type NavItem = (typeof site.nav)[number];