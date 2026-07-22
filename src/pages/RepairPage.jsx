import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Smartphone, CheckCircle2 } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import Loader from '../components/ui/Loader';
import { repairService } from '../services/repair.service';
import { useAuth } from '../hooks/useAuth';
import { setLoginContext } from '../utils/loginContext';
import { formatCurrency } from '../utils/formatCurrency';

const STEPS = ['Brand', 'Model', 'Issue', 'Book'];

export default function RepairPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const isLoggedIn = auth?.isAuthenticated;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [services, setServices] = useState([]);
  const [brand, setBrand] = useState(null);
  const [service, setService] = useState(null);
  const [issue, setIssue] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [doneOrder, setDoneOrder] = useState(null);
  const [pickup, setPickup] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: '',
    city: '',
    preferredDate: '',
    preferredSlot: 'Morning',
  });
  const [customerNote, setCustomerNote] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      repairService.getBrands('mobile'),
      repairService.getServices({ category: 'mobile' }),
    ])
      .then(([brandsRes, servicesRes]) => {
        setBrands(Array.isArray(brandsRes.data) ? brandsRes.data : []);
        setServices(Array.isArray(servicesRes.data) ? servicesRes.data : []);
      })
      .catch(() => {
        setBrands([]);
        setServices([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const modelsForBrand = useMemo(() => {
    if (!brand) return [];
    return services
      .filter((s) => s.brand?.toLowerCase() === brand.brand?.toLowerCase())
      .sort((a, b) => (a.modelName || '').localeCompare(b.modelName || ''));
  }, [brand, services]);

  const selectBrand = (b) => {
    setBrand(b);
    setService(null);
    setIssue(null);
    setStep(1);
  };

  const selectModel = (s) => {
    setService(s);
    setIssue(null);
    setStep(2);
  };

  const selectIssue = (i) => {
    setIssue(i);
    setStep(3);
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!service || !issue) return;

    if (!isLoggedIn) {
      setLoginContext({
        returnTo: '/repair',
        message: 'Login to book doorstep repair',
      });
      navigate('/login');
      return;
    }

    if (!pickup.name || !pickup.phone || !pickup.address || !pickup.pincode) {
      alert('Please fill name, phone, address and pincode');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await repairService.createOrder({
        serviceId: service._id,
        issueKey: issue.key,
        pickup,
        customerNote,
      });
      setDoneOrder(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  if (doneOrder) {
    return (
      <div className="max-w-[720px] mx-auto px-4 py-12 sm:py-16 text-center">
        <SEOHead title="Repair Booked — DeviceKart" path="/repair" />
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={36} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">Repair booked</h1>
        <p className="text-gray-500 mb-6">
          Order <span className="font-bold text-gray-800">{doneOrder.orderId}</span> for{' '}
          {doneOrder.snapshot?.brand} {doneOrder.snapshot?.modelName} — {doneOrder.snapshot?.issueLabel}
        </p>
        <p className="text-lg font-black text-[#0565E6] mb-8">{formatCurrency(doneOrder.snapshot?.price || 0)}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/dashboard" className="bg-[#0565E6] text-white px-6 py-3 rounded-xl font-bold no-underline">
            Go to dashboard
          </Link>
          <button
            type="button"
            className="border border-gray-200 px-6 py-3 rounded-xl font-bold text-gray-700"
            onClick={() => {
              setDoneOrder(null);
              setStep(0);
              setBrand(null);
              setService(null);
              setIssue(null);
            }}
          >
            Book another repair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <SEOHead
        title="Phone Repair — Doorstep Service | DeviceKart"
        description="Book doorstep mobile repair with transparent model-wise prices. Screen, battery, charging port and more."
        path="/repair"
      />

      {/* Repair banner creative */}
      <section className="w-full bg-[#E8F2FF]">
        <button
          type="button"
          onClick={() => {
            setStep(0);
            document.getElementById('repair-booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="block w-full p-0 border-0 bg-transparent cursor-pointer"
          aria-label="Book a repair now"
        >
          <img
            src="/bannerr.jpeg"
            alt="DeviceKart — Broken today? Fixed today! Book a repair now"
            className="w-full max-h-[280px] sm:max-h-[360px] lg:max-h-[420px] object-contain object-center"
          />
        </button>
      </section>

      <div id="repair-booking" className="max-w-[1100px] mx-auto px-4 sm:px-6 mt-6 mb-6 scroll-mt-24">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap gap-2 sm:gap-4">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`flex items-center gap-2 text-xs sm:text-sm font-bold ${
                i === step ? 'text-[#0565E6]' : i < step ? 'text-emerald-600' : 'text-gray-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                  i === step
                    ? 'bg-[#0565E6] text-white'
                    : i < step
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i + 1}
              </span>
              {label}
              {i < STEPS.length - 1 ? <ChevronRight size={14} className="text-gray-300 hidden sm:block" /> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-16">
        {step === 0 && (
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">Select brand</h2>
            {brands.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500">
                <Smartphone className="mx-auto mb-3 text-gray-300" size={40} />
                <p className="font-semibold">Repair prices coming soon</p>
                <p className="text-sm mt-1">Admin can add model-wise prices from the Repair panel.</p>
                <Link to="/contact-us" className="inline-block mt-4 text-[#0565E6] font-bold no-underline">
                  Contact support →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {brands.map((b) => (
                  <button
                    key={b.brand}
                    type="button"
                    onClick={() => selectBrand(b)}
                    className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:border-[#0565E6]/40 hover:shadow-md transition-all"
                  >
                    <div className="font-black text-gray-900 text-lg">{b.brand}</div>
                    <div className="text-xs text-gray-500 mt-1">{b.modelCount} models</div>
                    {b.minPrice > 0 ? (
                      <div className="text-sm font-bold text-[#0565E6] mt-3">From {formatCurrency(b.minPrice)}</div>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {step === 1 && (
          <section>
            <button type="button" className="text-sm font-bold text-[#0565E6] mb-4" onClick={() => setStep(0)}>
              ← Change brand
            </button>
            <h2 className="text-xl font-black text-gray-900 mb-1">{brand?.brand} models</h2>
            <p className="text-sm text-gray-500 mb-5">Choose your exact phone model for accurate pricing.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {modelsForBrand.map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => selectModel(s)}
                  className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 text-left hover:border-[#0565E6]/40 hover:shadow-md transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#F8FAFF] flex items-center justify-center overflow-hidden shrink-0">
                    {s.imageUrl ? (
                      <img src={s.imageUrl} alt="" className="max-h-full object-contain" />
                    ) : (
                      <Smartphone className="text-gray-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900 truncate">{s.modelName || s.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {s.minPrice != null ? `From ${formatCurrency(s.minPrice)}` : 'View prices'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && service && (
          <section>
            <button type="button" className="text-sm font-bold text-[#0565E6] mb-4" onClick={() => setStep(1)}>
              ← Change model
            </button>
            <h2 className="text-xl font-black text-gray-900 mb-1">
              What needs repair on {service.modelName}?
            </h2>
            <p className="text-sm text-gray-500 mb-5">Transparent prices for this model only.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(service.issues || []).map((i) => (
                <button
                  key={i.key}
                  type="button"
                  onClick={() => selectIssue(i)}
                  className={`bg-white border-2 rounded-2xl p-5 text-left transition-all ${
                    issue?.key === i.key
                      ? 'border-[#0565E6] bg-[#E8F1FF]'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-black text-gray-900">{i.label}</div>
                      {i.description ? <p className="text-xs text-gray-500 mt-1">{i.description}</p> : null}
                    </div>
                    <div className="font-black text-[#0565E6] whitespace-nowrap">{formatCurrency(i.price)}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && service && issue && (
          <section className="grid lg:grid-cols-[1fr_340px] gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
              <button type="button" className="text-sm font-bold text-[#0565E6] mb-4" onClick={() => setStep(2)}>
                ← Change issue
              </button>
              <h2 className="text-xl font-black text-gray-900 mb-4">Pickup details</h2>
              <form onSubmit={submitBooking} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0565E6]"
                    placeholder="Full name"
                    value={pickup.name}
                    onChange={(e) => setPickup((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0565E6]"
                    placeholder="Phone"
                    value={pickup.phone}
                    onChange={(e) => setPickup((p) => ({ ...p, phone: e.target.value }))}
                    required
                  />
                </div>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0565E6] min-h-[88px]"
                  placeholder="Pickup address"
                  value={pickup.address}
                  onChange={(e) => setPickup((p) => ({ ...p, address: e.target.value }))}
                  required
                />
                <div className="grid sm:grid-cols-3 gap-3">
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0565E6]"
                    placeholder="Pincode"
                    value={pickup.pincode}
                    onChange={(e) => setPickup((p) => ({ ...p, pincode: e.target.value }))}
                    required
                  />
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0565E6]"
                    placeholder="City"
                    value={pickup.city}
                    onChange={(e) => setPickup((p) => ({ ...p, city: e.target.value }))}
                  />
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0565E6] bg-white"
                    value={pickup.preferredSlot}
                    onChange={(e) => setPickup((p) => ({ ...p, preferredSlot: e.target.value }))}
                  >
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Evening</option>
                  </select>
                </div>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0565E6]"
                  value={pickup.preferredDate}
                  onChange={(e) => setPickup((p) => ({ ...p, preferredDate: e.target.value }))}
                />
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0565E6] min-h-[72px]"
                  placeholder="Anything else we should know? (optional)"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#0565E6] hover:bg-[#0454c4] text-white font-black py-3.5 rounded-xl transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Booking…' : isLoggedIn ? 'Confirm repair booking' : 'Login & book repair'}
                </button>
              </form>
            </div>

            <aside className="bg-white rounded-2xl border border-gray-100 p-5 h-fit sticky top-24">
              <h3 className="font-black text-gray-900 mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Device</span>
                  <span className="font-bold text-right text-gray-900">
                    {service.brand} {service.modelName}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Issue</span>
                  <span className="font-bold text-right text-gray-900">{issue.label}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-700">Repair price</span>
                  <span className="text-xl font-black text-[#0565E6]">{formatCurrency(issue.price)}</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                Final amount may change after technician diagnosis. Doorstep pickup included in serviceable areas.
              </p>
            </aside>
          </section>
        )}
      </div>
    </div>
  );
}
