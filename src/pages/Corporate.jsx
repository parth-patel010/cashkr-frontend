import { useState } from "react";
import SEOHead from "../components/seo/SEOHead";
import { buildSchemaGraph, organizationSchema, websiteSchema } from "../utils/schema";
import { 
  Building2, TrendingUp, Zap, ShieldCheck, 
  ArrowRight, CheckCircle2, BarChart3, Users, 
  Briefcase, Mail, Phone, FileText
} from "lucide-react";

// ─── Data Arrays ─────────────────────────────────────────────────────────────

const CORPORATE_BENEFITS = [
  "Bulk device buyback solutions for enterprises",
  "Dedicated account manager for your organization",
  "Flexible pricing and customized payment terms",
  "Secure asset disposal with certified data wiping"
];

const CORPORATE_METRICS = [
  { value: "500+", label: "Corporate Clients" },
  { value: "₹1000Cr+", label: "Assets Liquidated" },
  { value: "4.8/5", label: "Client Rating" },
  { value: "24/7", label: "Support Available" }
];

const INDUSTRY_VERTICALS = [
  { icon: <Building2 size={22} className="text-blue-600" />, label: "IT & Software", bg: "bg-blue-50" },
  { icon: <Briefcase size={22} className="text-purple-600" />, label: "Financial Services", bg: "bg-purple-50" },
  { icon: <BarChart3 size={22} className="text-emerald-600" />, label: "Consulting Firms", bg: "bg-emerald-50" },
  { icon: <Users size={22} className="text-amber-600" />, label: "Educational Institutes", bg: "bg-amber-50" },
  { icon: <Building2 size={22} className="text-rose-600" />, label: "Government Bodies", bg: "bg-rose-50" },
  { icon: <TrendingUp size={22} className="text-indigo-600" />, label: "Corporate Offices", bg: "bg-indigo-50" }
];

const SOLUTION_FEATURES = [
  {
    icon: <Zap size={24} className="text-[#0565E6]" />,
    title: "Quick Turnaround",
    desc: "Process large volumes of devices in days, not months. Our streamlined operations ensure rapid asset liquidation."
  },
  {
    icon: <ShieldCheck size={24} className="text-[#0565E6]" />,
    title: "Data Security",
    desc: "Military-grade data wiping and certification. Complete compliance with data protection regulations."
  },
  {
    icon: <BarChart3 size={24} className="text-[#0565E6]" />,
    title: "Transparent Reporting",
    desc: "Detailed asset reports, pricing breakdowns, and real-time tracking of all devices."
  },
  {
    icon: <Users size={24} className="text-[#0565E6]" />,
    title: "Dedicated Support",
    desc: "Personal account manager ensures smooth handling of your enterprise requirements."
  }
];

// ─── Sub-component: Section Heading ──────────────────────────────────────────

function SectionHeading({ tag, title, subtitle, center = true }) {
  return (
    <div className={`mb-12 max-w-3xl ${center ? "text-center mx-auto" : "text-left"}`}>
      {tag && (
        <span className="inline-block bg-[#EEF4FF] text-[#0565E6] text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-full mb-4 border border-[#0565E6]/10">
          {tag}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

// ─── Main Corporate Component ─────────────────────────────────────────────────

export default function CorporatePage() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    deviceCount: "",
    industry: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Corporate Inquiry Submitted: ", formData);
    // Hook up corporate inquiry endpoint here
  };

  return (
    <div className="w-full bg-white antialiased">
      <SEOHead
        title="Corporate IT Asset Disposal — Bulk Device Buyback | DeviceKart"
        description="DeviceKart Corporate helps businesses dispose of laptops, desktops, and IT assets securely with bulk pickup, compliance documentation, and transparent pricing."
        path="/corporate"
        schema={buildSchemaGraph([organizationSchema(), websiteSchema()])}
      />
      
      {/* ─── 1. HERO & CORPORATE INQUIRY FORM ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#EEF4FF] via-white to-white pt-12 pb-20 px-4">
        <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#0565E6]/5 blur-3xl" />
        
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-start">
          
          {/* Left Column Content */}
          <div className="lg:sticky lg:top-8 mt-4">
            <div className="inline-flex items-center gap-2 bg-white border border-[#0565E6]/20 rounded-full pl-2 pr-4 py-1.5 text-xs font-bold text-[#0565E6] mb-6 shadow-sm">
              <span className="bg-[#0565E6] text-white text-[10px] uppercase px-2 py-0.5 rounded-md font-black">🏢</span>
              Enterprise Device Liquidation Solutions
            </div>
            
            <h1 className="text-[2.25rem] sm:text-[3rem] font-black text-gray-900 leading-[1.1] tracking-tight mb-6">
              Streamline Your <br />
              <span className="text-[#0565E6]">Device Disposal</span>
            </h1>
            
            <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-[540px]">
              Enterprise-grade solutions for disposing of IT assets, retired equipment, and bulk devices. Get the best market value with complete compliance and zero hassle.
            </p>

            {/* Core Benefits List */}
            <div className="space-y-3.5 mb-8 max-w-[500px]">
              {CORPORATE_BENEFITS.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 p-3.5 rounded-xl shadow-sm">
                  <div className="w-6 h-6 bg-[#EEF4FF] rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 size={15} className="text-[#0565E6]" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {CORPORATE_METRICS.map((m, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="text-xl font-black text-[#0565E6]">{m.value}</div>
                  <div className="text-xs font-bold text-gray-500 mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column Inquiry Form */}
          <div className="bg-white border border-gray-100 shadow-2xl rounded-[28px] p-6 sm:p-8 relative z-10">
            <div className="mb-6">
              <h3 className="text-lg font-black text-gray-900 mb-1">Request Corporate Quote</h3>
              <p className="text-xs text-gray-400">Get a customized proposal for your organization's needs.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Company Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#0565E6]" 
                  placeholder="Enter company name"
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Contact Person</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#0565E6]" 
                    placeholder="Full name"
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Industry</label>
                  <select 
                    required 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 focus:outline-none focus:border-[#0565E6]"
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  >
                    <option value="">Select Industry</option>
                    <option value="IT">IT & Software</option>
                    <option value="Finance">Financial Services</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Education">Education</option>
                    <option value="Government">Government</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#0565E6]" 
                  placeholder="corporate@company.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold border-r border-gray-200 pr-2">+91</span>
                    <input 
                      type="tel" 
                      required 
                      pattern="[0-9]{10}" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-16 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#0565E6]" 
                      placeholder="10-digit number"
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Device Count</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#0565E6]" 
                    placeholder="e.g. 500+"
                    onChange={(e) => setFormData({...formData, deviceCount: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#0565E6] text-white rounded-xl py-3 font-black text-sm shadow-lg shadow-[#0565E6]/20 hover:bg-blue-700 transition duration-200 mt-2"
              >
                Get Corporate Quote
              </button>

              <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
                Our team will contact you within 24 hours with a tailored proposal.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* ─── 2. WHY CHOOSE US ─── */}
      <section className="py-16 sm:py-24 bg-[#F8FAFF]">
        <div className="max-w-[1200px] mx-auto px-4">
          <SectionHeading
            tag="Why DeviceKart"
            title="Enterprise-Grade Asset Management"
            subtitle="Designed for organizations that value compliance, transparency, and maximum asset recovery."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {SOLUTION_FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="mb-4">{f.icon}</div>
                <h4 className="text-lg font-black text-gray-900 mb-3">{f.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. INDUSTRY VERTICALS ─── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <SectionHeading
            tag="Industries Served"
            title="Solutions for Every Sector"
            subtitle="From IT companies to educational institutions, we serve diverse organizational needs."
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {INDUSTRY_VERTICALS.map((ind, i) => (
              <div key={i} className={`${ind.bg} rounded-2xl p-6 text-center border border-gray-100 hover:shadow-md transition-all duration-300`}>
                <div className="flex justify-center mb-3">{ind.icon}</div>
                <p className="text-sm font-bold text-gray-700">{ind.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. CTA SECTION ─── */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-[#0565E6] to-[#0452B8] text-white relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        
        <div className="max-w-[1200px] mx-auto px-4 text-center relative z-10">
          <h2 className="text-2xl sm:text-4xl font-black mb-4 leading-tight">
            Ready to Liquidate Your Assets?
          </h2>
          <p className="text-base text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Contact our enterprise solutions team today for a personalized proposal and dedicated support.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="bg-white text-[#0565E6] font-black px-8 py-3.5 rounded-xl hover:bg-gray-100 transition shadow-lg flex items-center gap-2">
              Contact Sales
              <ArrowRight size={18} />
            </button>
            <button className="border-2 border-white text-white font-black px-8 py-3.5 rounded-xl hover:bg-white/10 transition">
              Call: +91-XXXXX-XXXXX
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
