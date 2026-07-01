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

// Admin (lazy)
const AdminLayout = lazy(() => import("@/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const AdminLogin = lazy(() => import("@/admin/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const AdminDashboard = lazy(() => import("@/admin/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const AdminPagesList = lazy(() => import("@/admin/pages/PagesListPage").then((m) => ({ default: m.PagesListPage })));
const AdminPageEditor = lazy(() => import("@/admin/pages/PageEditorPage").then((m) => ({ default: m.PageEditorPage })));
const AdminLeads = lazy(() => import("@/admin/pages/LeadsCRMPage").then((m) => ({ default: m.LeadsCRMPage })));
const AdminLeadDetail = lazy(() => import("@/admin/pages/LeadDetailPage").then((m) => ({ default: m.LeadDetailPage })));
const AdminProperties = lazy(() => import("@/admin/pages/PropertiesListPage").then((m) => ({ default: m.PropertiesListPage })));
const AdminPropertyEditor = lazy(() => import("@/admin/pages/PropertyEditorPage").then((m) => ({ default: m.PropertyEditorPage })));
const AdminBlog = lazy(() => import("@/admin/pages/BlogListPage").then((m) => ({ default: m.BlogListPage })));
const AdminBlogEditor = lazy(() => import("@/admin/pages/BlogEditorPage").then((m) => ({ default: m.BlogEditorPage })));
const AdminFaqs = lazy(() => import("@/admin/pages/FaqsPage").then((m) => ({ default: m.FaqsPage })));
const AdminTestimonials = lazy(() => import("@/admin/pages/TestimonialsPage").then((m) => ({ default: m.TestimonialsPage })));
const AdminUsers = lazy(() => import("@/admin/pages/UsersPage").then((m) => ({ default: m.UsersPage })));
const AdminTheme = lazy(() => import("@/admin/pages/ThemePage").then((m) => ({ default: m.ThemePage })));
const AdminMedia = lazy(() => import("@/admin/pages/MediaPage").then((m) => ({ default: m.MediaPage })));
const AdminSettings = lazy(() => import("@/admin/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const AdminForms = lazy(() => import("@/admin/pages/FormsListPage").then((m) => ({ default: m.FormsListPage })));
const AdminFormBuilder = lazy(() => import("@/admin/pages/FormBuilderPage").then((m) => ({ default: m.FormBuilderPage })));
const AdminLeadPages = lazy(() => import("@/admin/pages/LeadPagesListPage").then((m) => ({ default: m.LeadPagesListPage })));
const AdminLeadPageEditor = lazy(() => import("@/admin/pages/LeadPageEditorPage").then((m) => ({ default: m.LeadPageEditorPage })));
const AdminAnalytics = lazy(() => import("@/admin/pages/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })));
const AdminSeo = lazy(() => import("@/admin/pages/SeoManagerPage").then((m) => ({ default: m.SeoManagerPage })));
const AdminIntegrations = lazy(() => import("@/admin/pages/IntegrationsPage").then((m) => ({ default: m.IntegrationsPage })));
const PublicLeadPage = lazy(() => import("@/pages/LeadPage").then((m) => ({ default: m.LeadPage })));
const RequireAuth = lazy(() => import("@/admin/RequireAuth").then((m) => ({ default: m.RequireAuth })));

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
    <Suspense fallback={<div className="min-h-screen" />}>
      <Routes>
        {/* Admin routes (no public layout, no site chrome) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="pages" element={<AdminPagesList />} />
          <Route path="pages/:id" element={<AdminPageEditor />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="properties/:id" element={<AdminPropertyEditor />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="blog/:id" element={<AdminBlogEditor />} />
          <Route path="faqs" element={<AdminFaqs />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="leads/:id" element={<AdminLeadDetail />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="theme" element={<AdminTheme />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="forms" element={<AdminForms />} />
          <Route path="forms/:id" element={<AdminFormBuilder />} />
          <Route path="lead-pages" element={<AdminLeadPages />} />
          <Route path="lead-pages/:id" element={<AdminLeadPageEditor />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="seo" element={<AdminSeo />} />
          <Route path="integrations" element={<AdminIntegrations />} />
        </Route>

        {/* Public site */}
        <Route
          path="/*"
          element={
            <SiteLayout>
              <Routes>
          <Route
            path="/"
            element={
              <>
                <Seo title="Southeast Landmark Ltd — Planned Residential Plots & Township Development" description="Southeast Landmark Ltd is a Dhaka-based land development company offering planned residential plots, township projects and secure land investment." path="/" />
                <HomePage />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <Seo title="About — Southeast Landmark Ltd" description="Learn about Southeast Landmark Ltd, a Dhaka-based land development company delivering planned residential plots and township projects." path="/about" />
                <AboutPage />
              </>
            }
          />
          <Route
            path="/property"
            element={
              <>
                <Seo title="Projects — Southeast Landmark Ltd" description="Explore ongoing, upcoming and completed land development and residential plot projects by Southeast Landmark across Bangladesh." path="/property" />
                <PropertyPage />
              </>
            }
          />
          <Route
            path="/blog"
            element={
              <>
                <Seo title="Blog — Southeast Landmark Ltd" description="Land investment insights, township updates and news from Southeast Landmark." path="/blog" />
                <BlogPage />
              </>
            }
          />
          <Route
            path="/faq"
            element={
              <>
                <Seo title="FAQ — Southeast Landmark Ltd" description="Answers to common questions about our residential plots, land projects, booking and installment facilities." path="/faq" />
                <FAQPage />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <Seo title="Contact — Southeast Landmark Ltd" description="Book a site visit or request project details from the Southeast Landmark land development team in Mohammadpur, Dhaka." path="/contact" />
                <ContactPage />
              </>
            }
          />
          <Route path="/lead/:slug" element={<PublicLeadPage />} />
          <Route path="*" element={<NotFound />} />
              </Routes>
            </SiteLayout>
          }
        />
      </Routes>
    </Suspense>
  );
}