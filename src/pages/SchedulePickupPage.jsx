import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuote } from '../hooks/useQuote';
import { useAuth } from '../hooks/useAuth';
import { orderService } from '../services/order.service';
import { userService } from '../services/user.service';
import { formatCurrency } from '../utils/formatCurrency';
import { getNextDays, formatDate, formatDateISO, TIME_SLOTS } from '../utils/dateUtils';
import PageCanvas from '../components/layout/PageCanvas';
import NoIndexSEO from '../components/seo/NoIndexSEO';
import { trackPhoneInitiateCheckout, isMobileQuote } from '../utils/metaPixel';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

export default function SchedulePickupPage() {
  const navigate = useNavigate();
  const { quote } = useQuote();
  const { user, refreshUser } = useAuth();
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [paymentType, setPaymentType] = useState('cash'); // 'cash', 'upi', 'bank'
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(null); // 'upi' or 'bank'
  const checkoutTracked = useRef(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (checkoutTracked.current) return;
    if (!isMobileQuote(quote?.device)) return;

    checkoutTracked.current = true;
    trackPhoneInitiateCheckout({
      brand: quote.device.brand,
      modelName: quote.device.modelName,
      value: quote.priceBreakdown?.finalPrice,
    });
  }, [quote]);

  // Sync selectedAddressId when user changes or first load
  useEffect(() => {
    if (!user?.addresses?.length) return;
    const ids = user.addresses.map((a) => String(a._id));
    if (!selectedAddressId || !ids.includes(String(selectedAddressId))) {
      setSelectedAddressId(String(user.addresses[user.addresses.length - 1]._id));
    }
  }, [user, selectedAddressId]);

  // Sync selectedPaymentId when paymentType changes
  useEffect(() => {
    if (paymentType === 'upi' || paymentType === 'bank') {
      const methods = user?.paymentMethods?.filter(pm => pm.type === paymentType) || [];
      if (methods.length > 0 && !selectedPaymentId) {
        setSelectedPaymentId(methods[0]._id);
      } else if (methods.length === 0) {
        setSelectedPaymentId(null);
      }
    } else {
      setSelectedPaymentId(null);
    }
  }, [paymentType, user, selectedPaymentId]);

  const days = getNextDays(7);

  const handleCreateOrder = async () => {
    if (submittingRef.current) return;

    if (!selectedAddressId || !selectedDate || !selectedSlot) {
      setError('Please complete all selections');
      return;
    }

    if (paymentType !== 'cash' && !selectedPaymentId) {
      setError(`Please select a ${paymentType.toUpperCase()} payment method`);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError('');
    try {
      const selectedAddr = user.addresses.find(a => String(a._id) === String(selectedAddressId));
      if (!selectedAddr) {
        throw new Error('Please select a pickup address');
      }
      
      let finalPaymentMethodStr = 'Cash';
      if (paymentType !== 'cash') {
        const pm = user.paymentMethods.find(p => p._id === selectedPaymentId);
        if (pm.type === 'upi') {
          finalPaymentMethodStr = `UPI - ${pm.upiId}`;
        } else if (pm.type === 'bank') {
          finalPaymentMethodStr = `Bank - ${pm.bankName} (${pm.accountNumber.slice(-4)})`;
        }
      }

      const { _id, isDefault, ...addressFields } = selectedAddr || {};
      const { data } = await orderService.createOrder({
        device: quote.device || {},
        priceBreakdown: quote.priceBreakdown || {},
        pickup: { 
          ...addressFields,
          phone: addressFields.phone || user.phone || '',
          alternatePhone: addressFields.alternatePhone || '',
          date: formatDateISO(selectedDate), 
          timeSlot: selectedSlot, 
          paymentMethod: finalPaymentMethodStr 
        },
      });
      navigate(`/order-confirmation/${data.orderId}`);
    } catch (err) {
      const payload = err.response?.data;
      if (err.response?.status === 409 && payload?.alreadyPlaced) {
        setError(
          payload.message ||
            'An order with the same device details is already placed for you.'
        );
        return;
      }
      setError(payload?.message || 'Failed to create order');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (!quote.device) {
    return <div className="text-center py-20 font-bold text-gray-500">No active quote found. Please start over.</div>;
  }

  return (
    <PageCanvas>
      <NoIndexSEO title="Schedule Pickup" path="/schedule-pickup" />
        {/* Header Progress */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>
          <div className="flex items-center gap-6 sm:gap-10 text-sm font-bold">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span className="text-gray-400 hidden sm:inline">Payment</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">2</span>
              <span className="text-gray-900">Pickup</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 sm:gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-5 sm:space-y-6">
            {/* Step 1: Select Address */}
            <div className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-4 sm:py-5 border-b border-[#E8EEF5] bg-[#F4F7FB]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white border border-[#E8EEF5] rounded-xl flex items-center justify-center text-gray-900 font-extrabold text-sm">1</div>
                  <h3 className="text-base sm:text-lg font-extrabold text-gray-900">Select Pickup Address</h3>
                </div>
                <button 
                  onClick={() => setShowAddressModal(true)}
                  className="flex items-center gap-1.5 bg-primary-light text-primary px-3.5 py-2 rounded-xl font-extrabold text-xs sm:text-sm hover:bg-primary hover:text-white transition-all shrink-0"
                >
                  <span className="text-base leading-none">+</span> Add New
                </button>
              </div>

              <div className="p-5 sm:p-7 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {user?.addresses?.length > 0 ? (
                  user.addresses.map((addr) => {
                    const addrId = String(addr._id);
                    const selected = String(selectedAddressId) === addrId;
                    return (
                    <label 
                      key={addrId}
                      className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 sm:gap-4
                        ${selected 
                          ? 'border-primary bg-primary-light' 
                          : 'border-[#E8EEF5] bg-[#F7F9FC] hover:border-gray-200'}`}
                    >
                      <input 
                        type="radio" 
                        name="address" 
                        checked={selected}
                        onChange={() => setSelectedAddressId(addrId)}
                        className="sr-only"
                      />
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
                        ${selected ? 'bg-primary text-white' : 'bg-white text-gray-400'}`}>
                        {addr.label === 'Home' ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-extrabold text-gray-900 mb-1">{addr.label}</p>
                        <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">{addr.address}, {addr.city}, {addr.pincode}</p>
                        {addr.alternatePhone && (
                          <p className="text-xs text-primary font-bold mt-2">Alt: +91 {addr.alternatePhone}</p>
                        )}
                      </div>
                      {selected && (
                        <div className="ml-auto w-5 h-5 bg-primary rounded-full flex items-center justify-center shrink-0">
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>
                        </div>
                      )}
                    </label>
                    );
                  })
                ) : (
                  <div className="col-span-full py-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-sm font-bold text-gray-400">No addresses saved. Please add one.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Select Date & Time */}
            <div className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden">
              <div className="flex items-center gap-3 px-5 sm:px-7 py-4 sm:py-5 border-b border-[#E8EEF5] bg-[#F4F7FB]">
                <div className="w-9 h-9 bg-white border border-[#E8EEF5] rounded-xl flex items-center justify-center text-gray-900 font-extrabold text-sm">2</div>
                <h3 className="text-base sm:text-lg font-extrabold text-gray-900">Select Pickup Date And Time</h3>
              </div>

              <div className="p-5 sm:p-7 space-y-6 sm:space-y-8">
                {/* Date Selection */}
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {days.map(d => {
                    const isSelected = selectedDate && formatDateISO(selectedDate) === formatDateISO(d);
                    const dateParts = formatDate(d).split(', ');
                    const dayName = dateParts[0];

                    return (
                      <button 
                        key={d.toISOString()} 
                        onClick={() => setSelectedDate(d)}
                        className={`min-w-[88px] p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-0.5
                          ${isSelected ? 'border-primary bg-primary-light' : 'border-[#E8EEF5] bg-[#F7F9FC] hover:border-gray-200'}`}
                      >
                        <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
                          {dayName}
                        </span>
                        <span className="text-2xl font-extrabold text-gray-900">{d.getDate()}</span>
                        <span className="text-xs font-bold text-gray-400">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {TIME_SLOTS.map(slot => (
                    <button 
                      key={slot.value} 
                      onClick={() => setSelectedSlot(slot.value)}
                      className={`p-4 rounded-2xl border-2 font-bold transition-all relative
                        ${selectedSlot === slot.value ? 'border-primary bg-primary-light text-primary' : 'border-[#E8EEF5] bg-[#F7F9FC] text-gray-500 hover:border-gray-200'}`}
                    >
                      {slot.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-[9px] font-extrabold text-white px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-white">Popular</span>
                      )}
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Select Payment Method */}
            <div className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden">
              <div className="flex items-center gap-3 px-5 sm:px-7 py-4 sm:py-5 border-b border-[#E8EEF5] bg-[#F4F7FB]">
                <div className="w-9 h-9 bg-white border border-[#E8EEF5] rounded-xl flex items-center justify-center text-gray-900 font-extrabold text-sm">3</div>
                <h3 className="text-base sm:text-lg font-extrabold text-gray-900">Select Payment Method</h3>
              </div>

              <div className="p-5 sm:p-7 space-y-3">
                {/* UPI */}
                <div className={`rounded-2xl border-2 p-4 sm:p-5 transition-all ${paymentType === 'upi' ? 'border-primary bg-primary-light' : 'border-[#E8EEF5] bg-[#F7F9FC] hover:border-gray-200 cursor-pointer'}`}>
                  <div className="flex items-center gap-6" onClick={() => setPaymentType('upi')}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 border ${paymentType === 'upi' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-100'}`}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-extrabold text-gray-900 text-lg">UPI</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Add UPI ID</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentType === 'upi' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                      {paymentType === 'upi' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                  </div>
                  
                  {paymentType === 'upi' && (
                    <div className="mt-6 pt-6 border-t border-primary/20">
                      <div className="space-y-3 mb-4">
                        {user?.paymentMethods?.filter(pm => pm.type === 'upi').map(pm => (
                          <label key={pm._id} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-primary/5 transition-colors">
                            <input 
                              type="radio" 
                              name="upiId" 
                              checked={selectedPaymentId === pm._id}
                              onChange={() => setSelectedPaymentId(pm._id)}
                              className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                            />
                            <span className="font-bold text-gray-900 text-sm">{pm.upiId}</span>
                          </label>
                        ))}
                      </div>
                      <button 
                        onClick={() => setShowPaymentModal('upi')}
                        className="text-sm font-extrabold text-primary hover:text-primary-dark flex items-center gap-2"
                      >
                        <span className="text-lg">+</span> Add New UPI ID
                      </button>
                    </div>
                  )}
                </div>

                {/* Bank */}
                <div className={`rounded-2xl border-2 p-4 sm:p-5 transition-all ${paymentType === 'bank' ? 'border-primary bg-primary-light' : 'border-[#E8EEF5] bg-[#F7F9FC] hover:border-gray-200 cursor-pointer'}`}>
                  <div className="flex items-center gap-6" onClick={() => setPaymentType('bank')}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 border ${paymentType === 'bank' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-100'}`}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-extrabold text-gray-900 text-lg">Bank</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Add Bank Details</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentType === 'bank' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                      {paymentType === 'bank' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                  </div>

                  {paymentType === 'bank' && (
                    <div className="mt-6 pt-6 border-t border-primary/20">
                      <div className="space-y-3 mb-4">
                        {user?.paymentMethods?.filter(pm => pm.type === 'bank').map(pm => (
                          <label key={pm._id} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-primary/5 transition-colors">
                            <input 
                              type="radio" 
                              name="bankId" 
                              checked={selectedPaymentId === pm._id}
                              onChange={() => setSelectedPaymentId(pm._id)}
                              className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                            />
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 text-sm">{pm.bankName} - {pm.accountNumber.slice(-4)}</span>
                              <span className="text-xs font-bold text-gray-500">{pm.accountName}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                      <button 
                        onClick={() => setShowPaymentModal('bank')}
                        className="text-sm font-extrabold text-primary hover:text-primary-dark flex items-center gap-2"
                      >
                        <span className="text-lg">+</span> Add New Bank Account
                      </button>
                    </div>
                  )}
                </div>

                {/* Cash */}
                <div 
                  className={`rounded-2xl border-2 p-4 sm:p-5 transition-all ${paymentType === 'cash' ? 'border-primary bg-primary-light' : 'border-[#E8EEF5] bg-[#F7F9FC] hover:border-gray-200 cursor-pointer'}`}
                  onClick={() => setPaymentType('cash')}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 border ${paymentType === 'cash' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-100'}`}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-extrabold text-gray-900 text-lg">Cash</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Cash Payment</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentType === 'cash' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                      {paymentType === 'cash' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* End Step 3 */}

          </div>

          {/* Sidebar Summary */}
          <div className="w-full lg:w-96 space-y-5">
            <div className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 p-5 sm:p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] lg:sticky lg:top-6">
              <div className="flex items-center gap-4 mb-5 bg-[#F7F9FC] p-3.5 rounded-2xl border border-[#E8EEF5]">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-2 border border-gray-100">
                  <img 
                    src={quote.device?.imageUrl || "https://img.freepik.com/free-photo/mobile-phone-with-blank-screen_23-2148151433.jpg"} 
                    className="max-h-full object-contain" 
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-gray-900 leading-tight text-sm">{quote.device?.modelName}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-wider">{quote.device?.storage}</p>
                </div>
              </div>

              <div className="space-y-4">
                <PriceRow label="Final Offer" value={quote.priceBreakdown?.finalPrice} />
                <div className="pt-4 border-t border-[#E8EEF5] flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">Free doorstep pickup</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">Instant payment at pickup</span>
                  </div>
                </div>
              </div>

              <button 
                disabled={submitting || !selectedAddressId || !selectedDate || !selectedSlot}
                onClick={handleCreateOrder}
                className="w-full mt-6 bg-primary text-white font-extrabold py-4 rounded-xl hover:bg-primary-dark transition-all shadow-[0_4px_14px_rgba(5,101,230,0.25)] disabled:opacity-50 disabled:shadow-none"
              >
                {submitting ? 'Scheduling...' : `Confirm Order — ${formatCurrency(quote.priceBreakdown?.finalPrice)}`}
              </button>
              {error && <p className="text-center text-red-500 text-xs font-bold mt-4">{error}</p>}
            </div>
          </div>
        </div>

      {/* Address Modal */}
      {showAddressModal && (
        <CreateAddressModal
          onClose={() => setShowAddressModal(false)}
          onSaved={(addresses) => {
            const latest = addresses?.[addresses.length - 1];
            if (latest?._id) setSelectedAddressId(String(latest._id));
          }}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <CreatePaymentModal type={showPaymentModal} onClose={() => setShowPaymentModal(null)} />
      )}
    </PageCanvas>
  );
}

function CreateAddressModal({ onClose, onSaved }) {
  const { user, refreshUser, setUserAddresses } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [pincodeServiceable, setPincodeServiceable] = useState(false);
  const [formError, setFormError] = useState('');
  const pincodeDebounce = useRef(null);

  const [form, setForm] = useState({
    label: 'Home',
    address: '',
    landmark: '',
    pincode: '',
    city: '',
    state: '',
    name: user?.name && user.name !== 'User' ? user.name : '',
    phone: user?.phone || '',
    alternatePhone: '',
  });

  const checkPincode = async (code) => {
    if (code.length !== 6) {
      setPincodeError('');
      setPincodeServiceable(false);
      return;
    }
    setPincodeChecking(true);
    setPincodeError('');
    setPincodeServiceable(false);
    try {
      const res = await fetch(`${API_BASE}/pincodes/check/${code}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.isServiceable) {
        setPincodeError('');
        setPincodeServiceable(true);
        setForm((f) => ({
          ...f,
          city: data.city || f.city,
          state: data.state || f.state,
        }));
      } else {
        setPincodeServiceable(false);
        setPincodeError(
          data.message || 'Pincode not available — we do not service this area yet. You can still save, but pickup may not be available.'
        );
      }
    } catch {
      setPincodeServiceable(false);
      setPincodeError('Could not verify pincode right now. You can still save the address.');
    } finally {
      setPincodeChecking(false);
    }
  };

  const handlePincodeChange = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setForm((f) => ({ ...f, pincode: cleaned }));
    setPincodeError('');
    setPincodeServiceable(false);
    setFormError('');
    if (pincodeDebounce.current) clearTimeout(pincodeDebounce.current);
    pincodeDebounce.current = setTimeout(() => checkPincode(cleaned), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.address?.trim() || !form.pincode?.trim() || !form.city?.trim()) {
      setFormError('Please fill address, pincode, and city.');
      return;
    }
    if (form.pincode.trim().length !== 6) {
      setFormError('Please enter a valid 6-digit pincode.');
      return;
    }
    if (form.alternatePhone && form.alternatePhone.length > 0 && form.alternatePhone.length !== 10) {
      setFormError('Alternative number must be 10 digits.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        label: form.label || 'Home',
        address: form.address.trim(),
        pincode: form.pincode.trim(),
        city: form.city.trim(),
        state: (form.state || '').trim(),
        name: (form.name || user?.name || 'Customer').trim() || 'Customer',
        phone: (form.phone || user?.phone || '').trim(),
      };
      if (form.landmark?.trim()) payload.landmark = form.landmark.trim();
      if (form.alternatePhone?.trim()) payload.alternatePhone = form.alternatePhone.trim();

      const { data: addresses } = await userService.addAddress(payload);
      if (Array.isArray(addresses)) {
        setUserAddresses?.(addresses);
        onSaved?.(addresses);
      } else {
        await refreshUser();
      }
      onClose();
    } catch (err) {
      const status = err.response?.status;
      const apiMessage =
        status === 401
          ? 'Your session expired. Please login again and then add the address.'
          : err.response?.data?.errors?.[0]?.msg ||
            err.response?.data?.message ||
            err.message ||
            'Failed to add address';
      setFormError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-2xl sm:rounded-[28px] shadow-[0_8px_30px_rgba(15,23,42,0.12)] p-6 sm:p-8 max-h-[90vh] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition-colors" type="button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-primary-light rounded-xl flex items-center justify-center text-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">Create New Address</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Address Type</label>
              <div className="flex gap-3">
                {['Home', 'Office', 'Other'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, label: type })}
                    className={`flex-1 py-4 rounded-2xl border-2 font-extrabold text-sm transition-all
                      ${form.label === type ? 'border-primary bg-primary-light text-primary' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Flat No / Building / Colony</label>
              <input
                type="text"
                placeholder="Enter building details"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full bg-[#F7F9FC] border border-[#E8EEF5] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Pincode</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter Pincode"
                  value={form.pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  maxLength={6}
                  className={`w-full bg-[#F7F9FC] border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none transition-all ${
                    pincodeError && !pincodeServiceable ? 'border-amber-400 focus:border-amber-400' : 'border-[#E8EEF5] focus:border-primary focus:bg-white'
                  }`}
                  required
                />
                {pincodeChecking && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {pincodeError && (
                <p className="mt-2 text-xs font-bold text-amber-600">{pincodeError}</p>
              )}
              {pincodeServiceable && !pincodeChecking && (
                <p className="mt-2 text-xs font-bold text-green-500">Pincode is serviceable!</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Landmark</label>
              <input
                type="text"
                placeholder="Enter landmark details"
                value={form.landmark}
                onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                className="w-full bg-[#F7F9FC] border border-[#E8EEF5] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">City</label>
              <input
                type="text"
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full bg-[#F7F9FC] border border-[#E8EEF5] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">State</label>
              <input
                type="text"
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full bg-[#F7F9FC] border border-[#E8EEF5] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">
                Alternative Number <span className="normal-case tracking-normal font-bold text-gray-300">(optional)</span>
              </label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Optional contact number for pickup"
                value={form.alternatePhone}
                onChange={(e) => setForm({ ...form, alternatePhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="w-full bg-[#F7F9FC] border border-[#E8EEF5] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-2xl px-4 py-3">
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || pincodeChecking}
            className="w-full mt-4 bg-primary text-white font-extrabold py-4 rounded-xl hover:bg-primary-dark transition-all shadow-[0_4px_14px_rgba(5,101,230,0.25)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? 'Saving...' : pincodeChecking ? 'Checking pincode...' : 'Save Address'}
          </button>
        </form>
      </div>
    </div>
  );
}

function CreatePaymentModal({ type, onClose }) {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(
    type === 'upi' 
      ? { type: 'upi', upiId: '' } 
      : { type: 'bank', accountName: '', accountNumber: '', ifscCode: '', bankName: '' }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.addPaymentMethod(form);
      await refreshUser();
      onClose();
    } catch (err) {
      alert('Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl sm:rounded-[28px] shadow-[0_8px_30px_rgba(15,23,42,0.12)] p-6 sm:p-8 max-h-[90vh] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-primary-light rounded-xl flex items-center justify-center text-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">
            {type === 'upi' ? 'Add UPI ID' : 'Add Bank Details'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'upi' ? (
            <div>
              <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">UPI ID</label>
              <input 
                type="text" 
                placeholder="e.g. 9876543210@ybl" 
                value={form.upiId}
                onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                className="w-full bg-[#F7F9FC] border border-[#E8EEF5] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary focus:bg-white transition-all"
                required
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Account Holder Name</label>
                <input 
                  type="text" 
                  placeholder="Name as per bank" 
                  value={form.accountName}
                  onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                  className="w-full bg-[#F7F9FC] border border-[#E8EEF5] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary focus:bg-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Account Number</label>
                <input 
                  type="text" 
                  placeholder="Enter Account Number" 
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                  className="w-full bg-[#F7F9FC] border border-[#E8EEF5] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary focus:bg-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">IFSC Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. HDFC0001234" 
                  value={form.ifscCode}
                  onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
                  className="w-full bg-[#F7F9FC] border border-[#E8EEF5] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary focus:bg-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Bank Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. HDFC Bank" 
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="w-full bg-[#F7F9FC] border border-[#E8EEF5] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary focus:bg-white transition-all"
                  required
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-primary text-white font-extrabold py-4 rounded-xl hover:bg-primary-dark transition-all shadow-[0_4px_14px_rgba(5,101,230,0.25)] flex items-center justify-center gap-2"
          >
            {loading ? 'Saving...' : 'Save Details'}
          </button>
        </form>
      </div>
    </div>
  );
}

function PriceRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="font-extrabold text-gray-900">{formatCurrency(value)}</span>
    </div>
  );
}
