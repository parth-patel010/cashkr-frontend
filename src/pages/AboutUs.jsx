import {
  Smartphone,
  Laptop,
  Tv,
  Watch,
  Headphones,
  Award,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Users,
  Target,
  Eye,
  ArrowRight,
  Sparkles,
  Briefcase
} from "lucide-react";
import SEOHead from "../components/seo/SEOHead";
import { ENTITY_SUMMARY } from "../config/seo";
import { buildSchemaGraph, organizationSchema, websiteSchema } from "../utils/schema";

export default function AboutUs() {
  const schema = buildSchemaGraph([
    organizationSchema({
      founder: [
        { '@type': 'Person', name: 'Aditya Sekhar', jobTitle: 'Chairman & Co-Founder' },
        { '@type': 'Person', name: 'DeviceKart Founder', jobTitle: 'Founder' },
      ],
    }),
    websiteSchema(),
  ]);

  return (
    <div className="w-full bg-white">
      <SEOHead
        title="About DeviceKart — India's Trusted Device Buyback Platform"
        description="Learn about DeviceKart, operated by Swastika Innovation Private Limited. India's trusted platform to sell old phones, laptops, tablets and iMac online."
        path="/about-us"
        schema={schema}
      />
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#EEF4FF] via-white to-white pt-10 pb-12 px-4">
        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#0565E6]/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#0565E6]/5 blur-3xl" />

        <div className="max-w-[1000px] mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#EEF4FF] border border-[#0565E6]/20 rounded-full px-4 py-1.5 text-xs font-bold text-[#0565E6] mb-6 shadow-sm shadow-[#0565E6]/5">
            <Sparkles size={13} className="animate-pulse" />
            Trusted Tech Buyback Partner
          </div>
          
          <h1 className="text-[2.5rem] sm:text-[3.5rem] font-black text-gray-900 leading-tight tracking-tight mb-6">
            About <span className="text-[#0565E6]">Swastika Innovation</span>
          </h1>

          <p className="text-base sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto font-medium">
            Welcome to <strong className="text-gray-950 font-black">Swastika Innovation Private Limited</strong>, your trusted partner in the premium second-hand electronics market. We specialize in the sale and purchase of high-quality, pre-owned IT products, ensuring that premium technology is accessible, sustainable, and reliable.
          </p>
        </div>
      </section>

      {/* ── WHAT WE DO SECTION ── */}
      <section className="py-10 sm:py-16 bg-white border-t border-gray-50">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-block bg-[#EEF4FF] text-[#0565E6] text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-full mb-4 border border-[#0565E6]/10">
              Our Core Business
            </span>
            <h2 className="text-2xl sm:text-[2.25rem] font-extrabold text-gray-900 mb-4 tracking-tight">
              What We Do
            </h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
              At Swastika Innovation, we breathe new life into consumer electronics. We provide a seamless, trustworthy platform for buying and selling a wide range of second-hand tech.
            </p>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              {
                icon: <Smartphone size={28} className="text-[#0565E6]" />,
                title: "Mobile Phones & Laptops",
                desc: "Premium pre-owned smartphones and high-performance notebooks restored to flawless functionality.",
                color: "from-blue-50 to-indigo-50",
                iconBg: "bg-blue-50"
              },
              {
                icon: <Tv size={28} className="text-purple-600" />,
                title: "Televisions (TVs)",
                desc: "Certified home entertainment systems and smart televisions at a fraction of retail prices.",
                color: "from-purple-50 to-pink-50",
                iconBg: "bg-purple-50"
              },
              {
                icon: <Watch size={28} className="text-sky-600" />,
                title: "Smartwatches & EarPods",
                desc: "Wearables and audio accessories checked rigorously for battery health and acoustic precision.",
                color: "from-sky-50 to-blue-50",
                iconBg: "bg-sky-50"
              },
              {
                icon: <Headphones size={28} className="text-teal-600" />,
                title: "Other IT Accessories",
                desc: "Essential linked IT peripherals and accessories tested and backed by our guarantee.",
                color: "from-teal-50 to-emerald-50",
                iconBg: "bg-teal-50"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="group relative flex flex-col bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 hover:border-[#0565E6]/30 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#0565E6] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Mission Note Banner */}
          <div className="bg-[#F8FAFF] rounded-3xl p-8 sm:p-10 border border-[#0565E6]/10 flex flex-col sm:flex-row items-center gap-6 max-w-4xl mx-auto shadow-sm">
            <div className="w-14 h-14 bg-[#0565E6] text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-[#0565E6]/20">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-1.5">Our Sustainable Mission</h4>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Our mission is to deliver client-centric solutions that offer exceptional value while promoting a circular economy in the tech industry. We aim to minimize e-waste by extending the lifespan of premium hardware.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VISION & MISSION ── */}
      <section className="py-10 sm:py-16 bg-gradient-to-b from-white to-[#F8FAFF] border-t border-gray-50">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Vision Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-lg relative overflow-hidden group hover:border-[#0565E6]/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#EEF4FF] rounded-bl-full -z-10 group-hover:bg-[#0565E6]/5 transition-colors" />
              <div className="w-12 h-12 bg-[#EEF4FF] rounded-xl flex items-center justify-center text-[#0565E6] mb-6">
                <Eye size={24} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-4">Our Vision</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                To become the most trusted and innovative ecosystem for pre-owned technology, bridging the gap between premium electronics and affordability while leading the transition toward a zero-waste, sustainable digital future.
              </p>
            </div>

            {/* Mission Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-lg relative overflow-hidden group hover:border-[#0565E6]/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#EEF4FF] rounded-bl-full -z-10 group-hover:bg-[#0565E6]/5 transition-colors" />
              <div className="w-12 h-12 bg-[#EEF4FF] rounded-xl flex items-center justify-center text-[#0565E6] mb-6">
                <Target size={24} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-4">Our Mission</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                To revolutionize the second-hand IT market by delivering client-centric solutions grounded in transparency, meticulous quality assurance, and fair value. Combining decades of grassroots operational expertise with cutting-edge business strategies, we empower consumers to upgrade responsibly, maximize the lifecycle of everyday technology, and experience absolute peace of mind with every transaction.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── MEET OUR LEADERSHIP ── */}
      <section className="py-10 sm:py-16 bg-[#F8FAFF] border-t border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-block bg-[#EEF4FF] text-[#0565E6] text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-full mb-4 border border-[#0565E6]/10">
              Leadership
            </span>
            <h2 className="text-2xl sm:text-[2.25rem] font-extrabold text-gray-900 mb-4 tracking-tight">
              Meet Our Leadership
            </h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
              The strength of Swastika Innovation Private Limited lies in the unparalleled expertise and visionary leadership of our founding partners, who bring together a perfect blend of global business strategy and deep, hands-on industry experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            
            {/* Leader 2: Aditya Sekhar — Chairman & Co-Founder */}
            <div className="bg-white rounded-[28px] p-8 sm:p-10 border border-gray-100 shadow-md flex flex-col justify-between hover:shadow-xl transition-all duration-300">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md shadow-purple-200">
                    AS
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-none">Aditya Sekhar</h3>
                    <p className="text-xs sm:text-sm font-bold text-indigo-600 mt-1.5 uppercase tracking-wider">Chairman & Co-Founder</p>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-gray-600 mb-6 font-medium leading-relaxed">
                  Aditya Sekhar is a business leader, entrepreneur, and one of the youngest research scholars in Smart Cities. As the Chairman of Micro Cloud Computing Pvt. Ltd., he brings strong leadership and strategic vision to DeviceKart.
                </p>

                {/* Bullets/List */}
                <div className="space-y-4">
                  {[
                    "One of the youngest Research Scholars in Smart Cities, and serves as the Chairman of Micro Cloud Computing Pvt. Ltd.",
                    "Represented India at the BRICS Connect Conference in New York, contributing perspectives on global business and strategy.",
                    "Recognized with prestigious awards from Forbes and StarPlus for his contributions and leadership.",
                    "Holds a Master's degree in International Business, and is passionate about innovation, global expansion, and building customer-focused businesses with long-term impact."
                  ].map((bullet, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-gray-600">
                      <div className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        <CheckCircle2 size={13} strokeWidth={2.5} />
                      </div>
                      <span className="leading-relaxed">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-3 text-xs sm:text-sm font-semibold text-gray-400">
                <Briefcase size={16} /> Chairman & Co-Founder, DeviceKart
              </div>
            </div>

            {/* Leader 1: Pankaj Vinda — Founder */}
            <div className="bg-white rounded-[28px] p-8 sm:p-10 border border-gray-100 shadow-md flex flex-col justify-between hover:shadow-xl transition-all duration-300">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md shadow-[#0565E6]/20">
                    PV
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-none">Pankaj Vinda</h3>
                    <p className="text-xs sm:text-sm font-bold text-[#0565E6] mt-1.5 uppercase tracking-wider">Founder</p>
                  </div>
                </div>

                <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 mb-6">
                  <span className="text-xs font-bold text-[#0565E6] uppercase tracking-widest block mb-1">Expertise Accent</span>
                  <div className="text-base sm:text-lg font-extrabold text-gray-900">
                    25+ Years in Consumer Electronics
                  </div>
                  <div className="text-xs sm:text-sm text-[#0565E6] mt-1">
                    Including 5+ years of hands-on e-commerce leadership.
                  </div>
                </div>
                
                <p className="text-sm sm:text-base text-gray-600 mb-4 font-medium leading-relaxed">
                  With over 25 years of experience in the consumer electronics industry, Pankaj Vinda has built a career rooted in expertise and trust.
                </p>

                {/* Bullets/List */}
                <div className="space-y-4">
                  {[
                    "Began his journey in 2006 as a Team Leader at a Nokia Service Centre, gaining hands-on experience in mobile devices and customer service.",
                    "Over the years, expanded his expertise across mobile phones, laptops, TVs, and IT products.",
                    "Brings 5+ years of experience in e-commerce, founding DeviceKart to make buying and selling electronics simple, transparent, and reliable.",
                    "His vision is to deliver quality products, fair pricing, and a customer-first experience that people can trust."
                  ].map((bullet, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-gray-600">
                      <div className="w-5 h-5 bg-blue-50 text-[#0565E6] rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        <CheckCircle2 size={13} strokeWidth={2.5} />
                      </div>
                      <span className="leading-relaxed">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-3 text-xs sm:text-sm font-semibold text-gray-400">
                <Briefcase size={16} /> Founder, DeviceKart
              </div>
            </div>

            

          </div>
        </div>
      </section>

      {/* ── OUR COMMITMENT SECTION ── */}
      <section className="py-10 sm:py-16 bg-white relative overflow-hidden">
        <div className="max-w-[900px] mx-auto px-4 text-center relative z-10">
          <span className="inline-block bg-[#EEF4FF] text-[#0565E6] text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-full mb-6 border border-[#0565E6]/10">
            Our Guarantee
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6 tracking-tight">
            Our Commitment to Excellence
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8">
            By combining cutting-edge global business strategies with decades of grassroots industry experience, Swastika Innovation Private Limited is uniquely positioned to revolutionize the second-hand IT market. Whether you are looking to upgrade your lifestyle with a pre-owned smart device or seeking a reliable buyer for your used electronics, we are here to provide a transparent, profitable, and secure experience.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="inline-flex items-center gap-2 bg-[#EEF4FF] text-[#0565E6] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl border border-[#0565E6]/10 shadow-sm">
              <ShieldCheck size={16} /> Transparent Pricing
            </div>
            <div className="inline-flex items-center gap-2 bg-[#EEF4FF] text-[#0565E6] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl border border-[#0565E6]/10 shadow-sm">
              <CheckCircle2 size={16} /> Rigorous Quality Inspection
            </div>
            <div className="inline-flex items-center gap-2 bg-[#EEF4FF] text-[#0565E6] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl border border-[#0565E6]/10 shadow-sm">
              <Globe size={16} /> Ethical Circular Economy
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#F8FAFF] border-t border-gray-100">
        <div className="max-w-[800px] mx-auto px-4 text-center">
          <h2 className="text-lg font-black text-gray-900 mb-3">About DeviceKart in 30 seconds</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{ENTITY_SUMMARY}</p>
        </div>
      </section>
    </div>
  );
}