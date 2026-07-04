import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CmsSeo } from "@/components/site/Seo";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { VisibilityGate } from "@/components/site/VisibilityGate";

const HomePage = lazy(() => import("@/pages/HomePage").then((m) => ({ default: m.HomePage })));
const AboutPage = lazy(() => import("@/pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const PropertyPage = lazy(() => import("@/pages/PropertyPage").then((m) => ({ default: m.PropertyPage })));
const PropertyDetailPage = lazy(() => import("@/pages/PropertyDetailPage").then((m) => ({ default: m.PropertyDetailPage })));
const BlogPage = lazy(() => import("@/pages/BlogPage").then((m) => ({ default: m.BlogPage })));
const BlogDetailPage = lazy(() => import("@/pages/BlogDetailPage").then((m) => ({ default: m.BlogDetailPage })));
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
const AdminAnalytics = lazy(() => import("@/admin/pages/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })));
const AdminSeo = lazy(() => import("@/admin/pages/SeoManagerPage").then((m) => ({ default: m.SeoManagerPage })));
const AdminIntegrations = lazy(() => import("@/admin/pages/IntegrationsPage").then((m) => ({ default: m.IntegrationsPage })));
const AdminNavigation = lazy(() => import("@/admin/pages/NavigationPage").then((m) => ({ default: m.NavigationPage })));
const AdminSmtp = lazy(() => import("@/admin/pages/SmtpPage").then((m) => ({ default: m.SmtpPage })));
const AdminVisibility = lazy(() => import("@/admin/pages/VisibilityPage").then((m) => ({ default: m.VisibilityPage })));
const AdminForgotPassword = lazy(() => import("@/admin/pages/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })));
const AdminSignup = lazy(() => import("@/admin/pages/SignupPage").then((m) => ({ default: m.SignupPage })));
const AdminResetPassword = lazy(() => import("@/admin/pages/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })));
const PublicLeadPage = lazy(() => import("@/pages/LeadPage").then((m) => ({ default: m.LeadPage })));
const DynamicPage = lazy(() => import("@/pages/DynamicPage").then((m) => ({ default: m.DynamicPage })));
const RequireAuth = lazy(() => import("@/admin/RequireAuth").then((m) => ({ default: m.RequireAuth })));

export default function App() {
  return (
    <ErrorBoundary scope="app">
      <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
        {/* Admin routes (no public layout, no site chrome) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <ErrorBoundary scope="admin"><AdminLayout /></ErrorBoundary>
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
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="seo" element={<AdminSeo />} />
          <Route path="integrations" element={<AdminIntegrations />} />
          <Route path="navigation" element={<AdminNavigation />} />
          <Route path="smtp" element={<AdminSmtp />} />
          <Route path="visibility" element={<AdminVisibility />} />
        </Route>

        {/* Public site */}
        <Route
          path="/*"
          element={
            <SiteLayout>
              <ErrorBoundary scope="site">
                <VisibilityGate>
                <Routes>
          <Route
            path="/"
            element={
              <>
                <CmsSeo slug="/" defaultTitle="Southeast Landmark Ltd — Planned Residential Plots & Township Development" defaultDescription="Southeast Landmark Ltd is a Dhaka-based land development company offering planned residential plots, township projects and secure land investment." />
                <HomePage />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <CmsSeo slug="/about" defaultTitle="About — Southeast Landmark Ltd" defaultDescription="Learn about Southeast Landmark Ltd, a Dhaka-based land development company delivering planned residential plots and township projects." />
                <AboutPage />
              </>
            }
          />
          <Route
            path="/property"
            element={
              <>
                <CmsSeo slug="/property" defaultTitle="Projects — Southeast Landmark Ltd" defaultDescription="Explore ongoing, upcoming and completed land development and residential plot projects by Southeast Landmark across Bangladesh." />
                <PropertyPage />
              </>
            }
          />
          <Route path="/property/:slug" element={<PropertyDetailPage />} />
          <Route
            path="/blog"
            element={
              <>
                <CmsSeo slug="/blog" defaultTitle="Blog — Southeast Landmark Ltd" defaultDescription="Land investment insights, township updates and news from Southeast Landmark." />
                <BlogPage />
              </>
            }
          />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route
            path="/faq"
            element={
              <>
                <CmsSeo slug="/faq" defaultTitle="FAQ — Southeast Landmark Ltd" defaultDescription="Answers to common questions about our residential plots, land projects, booking and installment facilities." />
                <FAQPage />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <CmsSeo slug="/contact" defaultTitle="Contact — Southeast Landmark Ltd" defaultDescription="Book a site visit or request project details from the Southeast Landmark land development team in Mohammadpur, Dhaka." />
                <ContactPage />
              </>
            }
          />
          <Route path="/lead/:slug" element={<PublicLeadPage />} />
          <Route path="*" element={<DynamicPage />} />
                </Routes>
                </VisibilityGate>
              </ErrorBoundary>
            </SiteLayout>
          }
        />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}