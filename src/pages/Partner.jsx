import { useState } from "react";
import api from "../services/api";
import SEOHead from "../components/seo/SEOHead";
import { buildSchemaGraph, organizationSchema, websiteSchema } from "../utils/schema";
import {
  Handshake,
  Smartphone,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Download,
  ArrowRight,
  CheckCircle2,
  UserPlus,
  FileText,
  Store,
  Laptop,
  Wrench,
  Trash2,
  Network,
  AppWindow,
} from "lucide-react";

// ─── Data Arrays ─────────────────────────────────────────────────────────────

const METRICS = [
  { value: "3K+", label: "Active Partners" },
  { value: "₹500Cr+", label: "Assets Processed" },
  { value: "4.9/5", label: "Partner Rating" },
  { value: "100+", label: "Cities Covered" },
];

const BENEFIT_BULLETS = [
  "Daily pre-qualified leads from your area",
  "High profit margins guaranteed on every device",
  "Instant secure payouts via UPI or bank transfer",
  "Zero marketing setup costs or hidden entry cuts",
];

const LIVE_LEADS = [
  {
    title: "iPhone 13 Pro - New Lead",
    time: "Posted 20s ago",
    value: "₹42,000",
    tag: "New Lead",
    color: "border-blue-500 bg-blue-50/40",
  },
  {
    title: "MacBook Air M1 - Pickup",
    time: "Posted 4 mins ago",
    value: "₹55,000",
    tag: "In Progress",
    color: "border-amber-500 bg-amber-50/40",
  },
  {
    title: 'iPad Pro 11" - Completed',
    time: "Posted 10 mins ago",
    value: "₹28,000",
    tag: "Completed",
    color: "border-emerald-500 bg-emerald-50/40",
  },
];

const HIGHLIGHT_METRICS = [
  { val: "89%", label: "Partner Retention Rate" },
  { val: "24hrs", label: "Average Approval Time" },
  { val: "Rs.0", label: "Joining Fee" },
];

const VALUE_PROPS = [
  {
    icon: <TrendingUp size={24} className="text-[#0565E6]" />,
    title: "Steady Stream of Motivated Sellers",
    desc: "With DeviceKart massive active user base and established online presence, you will receive a consistent structural flow of local device sellers.",
    bullets: [
      "Pre-qualified leads sent directly to you",
      "Customers already agree to online quoted price",
    ],
  },
  {
    icon: <ShieldCheck size={24} className="text-[#0565E6]" />,
    title: "Complete System Autonomy",
    desc: "Forget wasting hours formatting custom customer invoices or manually building outreach files. Our system handles data overhead natively.",
    bullets: [
      "All legal paperwork handled by our system",
      "Real-time automated alerts on Partner App",
    ],
  },
];

const WORKFLOW_STEPS = [
  {
    num: "1",
    title: "Download Partner App",
    desc: "Get the secure DeviceKart Partner application build straight from the Google Play Store.",
  },
  {
    num: "2",
    title: "Submit Application",
    desc: "Tap 'Become Partner' inside the dashboard UI and cleanly fill in basic business details.",
  },
  {
    num: "3",
    title: "Start Earning Daily",
    desc: "Enjoy our accelerated KYC validation loop. Gain immediate backend access to nearby marketplace sellers.",
  },
];

const COHORTS = [
  {
    icon: <Store size={22} className="text-blue-600" />,
    label: "Mobile Repair Shops",
    bg: "bg-blue-50",
  },
  {
    icon: <Laptop size={22} className="text-purple-600" />,
    label: "Laptop Retailers",
    bg: "bg-purple-50",
  },
  {
    icon: <Network size={22} className="text-emerald-600" />,
    label: "Refurbishing Units",
    bg: "bg-emerald-50",
  },
  {
    icon: <Wrench size={22} className="text-amber-600" />,
    label: "Freelance Technicians",
    bg: "bg-amber-50",
  },
  {
    icon: <Trash2 size={22} className="text-rose-600" />,
    label: "E-waste Collectors",
    bg: "bg-rose-50",
  },
  {
    icon: <AppWindow size={22} className="text-indigo-600" />,
    label: "Service Aggregators",
    bg: "bg-indigo-50",
  },
];

// ─── Sub-component: Section Heading ──────────────────────────────────────────

function SectionHeading({ tag, title, subtitle, center = true }) {
  return (
    <div
      className={`mb-12 max-w-3xl ${center ? "text-center mx-auto" : "text-left"}`}
    >
      {tag && (
        <span className="inline-block bg-[#EEF4FF] text-[#0565E6] text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-full mb-4 border border-[#0565E6]/10">
          {tag}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Main Partner Component ───────────────────────────────────────────────────

export default function PartnerPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    contactPerson: "",
    email: "",
    mobile: "",
    city: "",
    shopType: "",
  });
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);
    try {
      await api.post("/partners", formData);
      setSubmitStatus("success");
      setFormData({
        businessName: "",
        contactPerson: "",
        email: "",
        mobile: "",
        city: "",
        shopType: "",
      });
    } catch (err) {
      setSubmitStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white antialiased">
      <SEOHead
        title="Become a DeviceKart Partner — Join Our Pickup Network"
        description="Join DeviceKart as a partner. Local shops, refurbishers, and e-waste collectors can earn by handling device pickups across India."
        path="/partner"
        schema={buildSchemaGraph([organizationSchema(), websiteSchema()])}
      />
      {/* ─── 1. HERO & ONBOARDING APPLICATION ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#EEF4FF] via-white to-white pt-12 pb-20 px-4">
        <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#0565E6]/5 blur-3xl" />

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-start">
          {/* Left Column Content */}
          <div className="lg:sticky lg:top-8 mt-4">
            <div className="inline-flex items-center gap-2 bg-white border border-[#0565E6]/20 rounded-full pl-2 pr-4 py-1.5 text-xs font-bold text-[#0565E6] mb-6 shadow-sm">
              <span className="bg-[#0565E6] text-white text-[10px] uppercase px-2 py-0.5 rounded-md font-black">
                🤝
              </span>
              Partner With DeviceKart - Device Buyback Solutions
            </div>

            <h1 className="text-[2.25rem] sm:text-[3rem] font-black text-gray-900 leading-[1.1] tracking-tight mb-6">
              Join India's Fastest-Growing <br />
              <span className="text-[#0565E6]">Buyback Platform</span>
            </h1>

            <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-[540px]">
              Our established infrastructure and highly trusted consumer
              footprint mean more customers, consistent transactions, and
              premium revenue pipelines for your local workshop. **Earn up to
              ₹3,00,000 monthly.**
            </p>

            {/* Direct Core Advantages List */}
            <div className="space-y-3.5 mb-8 max-w-[500px]">
              {BENEFIT_BULLETS.map((bullet, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white border border-gray-100 p-3.5 rounded-xl shadow-sm"
                >
                  <div className="w-6 h-6 bg-[#EEF4FF] rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 size={15} className="text-[#0565E6]" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">
                    {bullet}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button className="bg-gray-900 text-white font-black text-xs px-6 py-3.5 rounded-xl hover:bg-gray-800 transition shadow-md">
                Download Partner App
              </button>
              <button className="border border-gray-200 text-gray-600 bg-white font-black text-xs px-6 py-3.5 rounded-xl hover:bg-gray-50 transition">
                Learn More
              </button>
            </div>
          </div>

          {/* Right Column Intake Form Container */}
          <div className="bg-white border border-gray-100 shadow-2xl rounded-[28px] p-6 sm:p-8 relative z-10">
            <div className="mb-6">
              <h3 className="text-lg font-black text-gray-900 mb-1">
                Become Device Buyback Partner
              </h3>
              <p className="text-xs text-gray-400">
                Lock in regional processing priority. Submit your storefront
                data below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                  Business Name / Firm
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#0565E6]"
                  placeholder="e.g. Om Electronics"
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#0565E6]"
                    placeholder="Full name"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactPerson: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                    Business Type
                  </label>
                  <select
                    required
                    value={formData.shopType}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 focus:outline-none focus:border-[#0565E6]"
                    onChange={(e) =>
                      setFormData({ ...formData, shopType: e.target.value })
                    }
                  >
                    <option value="">Select Category</option>
                    <option value="repair">Mobile Repair Shop</option>
                    <option value="retailer">Laptop Retailer</option>
                    <option value="mobile_retailer">Mobile Retailer</option>
                    <option value="refurb">Refurbishing Unit</option>
                    <option value="collector">E-waste Collector</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#0565E6]"
                  placeholder="contact@yourfirm.com"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold border-r border-gray-200 pr-2">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={formData.mobile}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-16 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#0565E6]"
                      placeholder="WhatsApp Active"
                      onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                    City / Hub Location
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#0565E6]"
                    placeholder="e.g. Mumbai"
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full rounded-xl py-3 font-black text-sm shadow-lg transition duration-200 mt-2 ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#0565E6] hover:bg-blue-700 shadow-[#0565E6]/20"} text-white`}
              >
                {submitting ? "Submitting..." : "Register Storefront Profile"}
              </button>

              {submitStatus === "success" && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-3 rounded-xl text-center mt-3">
                  ✅ Application submitted successfully! We'll get back to you
                  soon.
                </div>
              )}
              {submitStatus === "error" && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-4 py-3 rounded-xl text-center mt-3">
                  ❌ Something went wrong. Please try again.
                </div>
              )}

              <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
                By registering, you verify that your entity possesses legitimate
                business operation clearance tags across your respective
                handling state.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* ─── 2. PLATFORM TRAFFIC STRIP ─── */}
      <section className="bg-gray-50 border-t border-b border-gray-100 py-10 px-4">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Global Ecosystem Reach
            </h4>
            <p className="text-sm font-bold text-gray-600 mt-1">
              Backed by high conversion ratios and systematic pan-India growth
              structures.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-6 sm:gap-12">
            {METRICS.map((m, idx) => (
              <div key={idx} className="text-center">
                <div className="text-xl sm:text-2xl font-black text-[#0565E6]">
                  {m.value}
                </div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. LIVE LEADS FEED MOCK & CONVERSION GAINS ─── */}
      <section className="py-16 sm:py-24 px-4 bg-white">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
          {/* Live Stream Panel Mock */}
          <div className="bg-gray-900 rounded-[2rem] p-6 sm:p-8 text-white relative shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />

            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="text-[10px] bg-red-500 text-white font-black px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                  Live
                </span>
                <h4 className="text-base font-black mt-1">
                  Partner App Leads Feed
                </h4>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Avg Monthly Leads</div>
                <div className="text-sm font-black text-[#0565E6]">
                  50+ Per Node
                </div>
              </div>
            </div>

            {/* Simulated Activity Stream */}
            <div className="space-y-3.5">
              {LIVE_LEADS.map((lead, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-white/20 transition"
                >
                  <div>
                    <div className="text-xs font-bold text-white">
                      {lead.title}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {lead.time}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-400">
                      {lead.value}
                    </div>
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider">
                      Pre-Quoted
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Simulated Live Analytics Badge Row */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 mt-6 pt-6 text-center">
              <div>
                <div className="text-lg font-black text-white">6M+</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                  Consumer App Base
                </div>
              </div>
              <div>
                <div className="text-lg font-black text-[#0565E6]">50K+</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                  Monthly Success Drops
                </div>
              </div>
            </div>
          </div>

          {/* Value Props Presentation */}
          <div>
            <SectionHeading
              tag="Earning Ecosystem"
              title="Secure Ongoing Orders Without Marketing Capital"
              subtitle="We've streamlined customer onboarding loops so local tech operations can focus strictly on device diagnostic workflows and physical updates."
              center={false}
            />

            <div className="space-y-8 mt-6">
              {VALUE_PROPS.map((prop, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-12 h-12 bg-[#EEF4FF] rounded-xl flex items-center justify-center shrink-0">
                    {prop.icon}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 mb-1.5">
                      {prop.title}
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed mb-3">
                      {prop.desc}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                      {prop.bullets.map((b, bIdx) => (
                        <span
                          key={bIdx}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100"
                        >
                          <CheckCircle2 size={12} className="text-[#0565E6]" />
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. HOW IT WORKS ─── */}
      <section className="py-16 sm:py-24 px-4 bg-gray-50 border-t border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto">
          <SectionHeading
            tag="Onboarding Guide"
            title="Three Simple Steps to Launch"
            subtitle="Our programmatic validation network removes standard corporate processing blockades so you can hit active status rapidly."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {WORKFLOW_STEPS.map((step, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200/60 rounded-2xl p-6 relative flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#EEF4FF] text-[#0565E6] flex items-center justify-center font-bold text-xs mb-4">
                    0{step.num}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="absolute bottom-4 right-5 text-4xl font-black text-gray-50 select-none pointer-events-none">
                  {step.num}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. WHO CAN JOIN (GRID GROUP COHORTS) ─── */}
      <section className="py-16 sm:py-24 px-4 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <SectionHeading
            tag="Ecosystem Profiles"
            title="Who Can Benefit From Our Network?"
            subtitle="Whether you maintain high-capacity commercial spaces or act as a specialized local technician, DeviceKart adapts natively to fuel your business."
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            {COHORTS.map((c, idx) => (
              <div
                key={idx}
                className="border border-gray-100 rounded-xl p-5 text-center bg-white shadow-sm hover:shadow-md transition hover:border-[#0565E6]/30"
              >
                <div
                  className={`w-11 h-11 ${c.bg} rounded-xl flex items-center justify-center mx-auto mb-3.5 shadow-sm`}
                >
                  {c.icon}
                </div>
                <div className="text-xs font-bold text-gray-800 leading-snug">
                  {c.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. RETENTION PERFORMANCE METRICS STRIP ─── */}
      <section className="py-14 px-4 bg-gray-900 text-white rounded-[2rem] max-w-[1200px] mx-auto mb-16 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(5,101,230,0.15),transparent_50%)]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <span className="text-[#0565E6] text-xs font-bold uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
            Performance Frameworks
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-4 mb-10">
            Predictable Parameters for Scale Operations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {HIGHLIGHT_METRICS.map((hm, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
              >
                <div className="text-3xl font-black text-white mb-1">
                  {hm.val}
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {hm.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
