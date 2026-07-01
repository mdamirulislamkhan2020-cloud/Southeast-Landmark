import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Seo } from "@/components/site/Seo";

const HomePage = lazy(() => import("@/pages/HomePage").then((m) => ({ default: m.HomePage })));
const AboutPage = lazy(() => import("@/pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const PropertyPage = lazy(() => import("@/pages/PropertyPage").then((m) => ({ default: m.PropertyPage })));
const BlogPage = lazy(() => import("@/pages/BlogPage").then((m) => ({ default: m.BlogPage })));
const FAQPage = lazy(() => import("@/pages/FAQPage").then((m) => ({ default: m.FAQPage })));
const ContactPage = lazy(() => import("@/pages/ContactPage").then((m) => ({ default: m.ContactPage })));

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-7xl font-bold text-foreground">404</h1>
      <p className="mt-4 text-muted-foreground">The page you're looking for doesn't exist.</p>
      <a href="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Go home</a>
    </div>
  );
}

export default function App() {
  return (
    <SiteLayout>
      <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Seo title="Southeast Landmark Ltd — Building Landmarks You Can Call Home" description="Southeast Landmark Ltd is a Dhaka real estate company delivering comfortable, high-quality residential spaces for plot owners and investors." path="/" />
                <HomePage />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <Seo title="About — Southeast Landmark Ltd" description="Learn about Southeast Landmark Ltd, a Dhaka real estate company dedicated to comfortable, lasting living spaces." path="/about" />
                <AboutPage />
              </>
            }
          />
          <Route
            path="/property"
            element={
              <>
                <Seo title="Properties — Southeast Landmark Ltd" description="Browse residential properties by Southeast Landmark across Dhaka." path="/property" />
                <PropertyPage />
              </>
            }
          />
          <Route
            path="/blog"
            element={
              <>
                <Seo title="Blog — Southeast Landmark Ltd" description="News, insights and stories from Southeast Landmark." path="/blog" />
                <BlogPage />
              </>
            }
          />
          <Route
            path="/faq"
            element={
              <>
                <Seo title="FAQ — Southeast Landmark Ltd" description="Answers to the questions we hear most about our properties and process." path="/faq" />
                <FAQPage />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <Seo title="Contact — Southeast Landmark Ltd" description="Get in touch with the Southeast Landmark team in Mohammadpur, Dhaka." path="/contact" />
                <ContactPage />
              </>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </SiteLayout>
  );
}