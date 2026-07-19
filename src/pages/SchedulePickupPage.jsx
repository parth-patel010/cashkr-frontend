import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuote } from '../hooks/useQuote';
import { useAuth } from '../hooks/useAuth';
import { orderService } from '../services/order.service';
import { userService } from '../services/user.service';
import { formatCurrency } from '../utils/formatCurrency';
import { getNextDays, formatDate, formatDateISO, TIME_SLOTS } from '../utils/dateUtils';
import Input from '../components/ui/Input';
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
    if (user?.addresses?.length > 0 && !selectedAddressId) {
      setSelectedAddressId(user.addresses[0]._id);
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
      const selectedAddr = user.addresses.find(a => a._id === selectedAddressId);
      
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
    <div className="bg-[#F9FAFB] min-h-screen py-10 sm:py-16 px-4">
      <NoIndexSEO title="Schedule Pickup" path="/schedule-pickup" />
      <div className="max-w-6xl mx-auto">
        {/* Header Progress */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 font-bold hover:text-[#111827] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>
          <div className="flex items-center gap-12 text-sm font-bold">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0565E6]/20 text-[#0565E6] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span className="text-gray-400">Payment</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#0565E6] text-white flex items-center justify-center">2</span>
              <span className="text-[#111827]">Pickup</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Step 1: Select Address */}
            <div className="bg-white rounded-[40px] border border-gray-100 p-8 sm:p-10 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#F3F4F6] rounded-xl flex items-center justify-center text-[#111827] font-black">1</div>
                  <h3 className="text-xl font-black text-[#111827]">Select Pickup Address</h3>
                </div>
                <button 
                  onClick={() => setShowAddressModal(true)}
                  className="flex items-center gap-2 bg-[#E8F1FF] text-[#0565E6] px-5 py-2.5 rounded-xl font-black text-sm hover:bg-[#0565E6] hover:text-white transition-all"
                >
                  <span className="text-lg">+</span> Add New Address
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user?.addresses?.length > 0 ? (
                  user.addresses.map((addr) => (
                    <label 
                      key={addr._id}
                      className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all flex items-start gap-4
                        ${selectedAddressId === addr._id 
                          ? 'border-[#0565E6] bg-[#E8F1FF]' 
                          : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'}`}
                    >
                      <input 
                        type="radio" 
                        name="address" 
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                        className="sr-only"
                      />
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
                        ${selectedAddressId === addr._id ? 'bg-[#0565E6] text-white' : 'bg-white text-gray-400'}`}>
                        {addr.label === 'Home' ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-[#111827] mb-1">{addr.label}</p>
                        <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">{addr.address}, {addr.city}, {addr.pincode}</p>
                        {addr.alternatePhone && (
                          <p className="text-xs text-[#0565E6] font-bold mt-2">Alt: +91 {addr.alternatePhone}</p>
                        )}
                      </div>
                      {selectedAddressId === addr._id && (
                        <div className="ml-auto w-5 h-5 bg-[#0565E6] rounded-full flex items-center justify-center shrink-0">
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>
                        </div>
                      )}
                    </label>
                  ))
                ) : (
                  <div className="col-span-full py-10 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                    <p className="text-sm font-bold text-gray-400">No addresses saved. Please add one.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Select Date & Time */}
            <div className="bg-white rounded-[40px] border border-gray-100 p-8 sm:p-10 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-10 bg-[#F3F4F6] rounded-xl flex items-center justify-center text-[#111827] font-black">2</div>
                <h3 className="text-xl font-black text-[#111827]">Select Pickup Date And Time</h3>
              </div>

              <div className="space-y-10">
                {/* Date Selection */}
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                  {days.map(d => {
                    const isSelected = selectedDate && formatDateISO(selectedDate) === formatDateISO(d);
                    const dateParts = formatDate(d).split(', ');
                    const dayName = dateParts[0];

                    return (
                      <button 
                        key={d.toISOString()} 
                        onClick={() => setSelectedDate(d)}
                        className={`min-w-[100px] p-5 rounded-[28px] border-2 transition-all flex flex-col items-center gap-1
                          ${isSelected ? 'border-[#0565E6] bg-[#E8F1FF]' : 'border-gray-50 bg-gray-50/50 hover:border-gray-100'}`}
                      >
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-[#0565E6]' : 'text-gray-400'}`}>
                          {dayName}
                        </span>
                        <span className="text-2xl font-black text-[#111827]">{d.getDate()}</span>
                        <span className="text-xs font-bold text-gray-400">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {TIME_SLOTS.map(slot => (
                    <button 
                      key={slot.value} 
                      onClick={() => setSelectedSlot(slot.value)}
                      className={`p-5 rounded-2xl border-2 font-bold transition-all relative
                        ${selectedSlot === slot.value ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' : 'border-gray-50 bg-gray-50/50 text-gray-500 hover:border-gray-100'}`}
                    >
                      {slot.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-[9px] font-black text-white px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-white">Popular</span>
                      )}
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Select Payment Method */}
            <div className="bg-white rounded-[40px] border border-gray-100 p-8 sm:p-10 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-10 bg-[#F3F4F6] rounded-xl flex items-center justify-center text-[#111827] font-black">3</div>
                <h3 className="text-xl font-black text-[#111827] uppercase tracking-wide">Select Payment Method</h3>
              </div>

              <div className="space-y-4">
                {/* UPI */}
                <div className={`rounded-[32px] border-2 p-6 transition-all ${paymentType === 'upi' ? 'border-[#0565E6] bg-[#E8F1FF]' : 'border-gray-50 bg-white hover:border-gray-200 cursor-pointer'}`}>
                  <div className="flex items-center gap-6" onClick={() => setPaymentType('upi')}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 border ${paymentType === 'upi' ? 'bg-[#0565E6] text-white border-[#0565E6]' : 'bg-white text-gray-500 border-gray-100'}`}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-[#111827] text-lg">UPI</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Add UPI ID</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentType === 'upi' ? 'border-[#0565E6] bg-[#0565E6]' : 'border-gray-300'}`}>
                      {paymentType === 'upi' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                  </div>
                  
                  {paymentType === 'upi' && (
                    <div className="mt-6 pt-6 border-t border-[#0565E6]/20">
                      <div className="space-y-3 mb-4">
                        {user?.paymentMethods?.filter(pm => pm.type === 'upi').map(pm => (
                          <label key={pm._id} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-[#0565E6]/5 transition-colors">
                            <input 
                              type="radio" 
                              name="upiId" 
                              checked={selectedPaymentId === pm._id}
                              onChange={() => setSelectedPaymentId(pm._id)}
                              className="w-4 h-4 text-[#0565E6] focus:ring-[#0565E6] cursor-pointer"
                            />
                            <span className="font-bold text-[#111827] text-sm">{pm.upiId}</span>
                          </label>
                        ))}
                      </div>
                      <button 
                        onClick={() => setShowPaymentModal('upi')}
                        className="text-sm font-black text-[#0565E6] hover:text-[#044ab8] flex items-center gap-2"
                      >
                        <span className="text-lg">+</span> Add New UPI ID
                      </button>
                    </div>
                  )}
                </div>

                {/* Bank */}
                <div className={`rounded-[32px] border-2 p-6 transition-all ${paymentType === 'bank' ? 'border-[#0565E6] bg-[#E8F1FF]' : 'border-gray-50 bg-white hover:border-gray-200 cursor-pointer'}`}>
                  <div className="flex items-center gap-6" onClick={() => setPaymentType('bank')}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 border ${paymentType === 'bank' ? 'bg-[#0565E6] text-white border-[#0565E6]' : 'bg-white text-gray-500 border-gray-100'}`}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-[#111827] text-lg">Bank</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Add Bank Details</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentType === 'bank' ? 'border-[#0565E6] bg-[#0565E6]' : 'border-gray-300'}`}>
                      {paymentType === 'bank' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                  </div>

                  {paymentType === 'bank' && (
                    <div className="mt-6 pt-6 border-t border-[#0565E6]/20">
                      <div className="space-y-3 mb-4">
                        {user?.paymentMethods?.filter(pm => pm.type === 'bank').map(pm => (
                          <label key={pm._id} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-[#0565E6]/5 transition-colors">
                            <input 
                              type="radio" 
                              name="bankId" 
                              checked={selectedPaymentId === pm._id}
                              onChange={() => setSelectedPaymentId(pm._id)}
                              className="w-4 h-4 text-[#0565E6] focus:ring-[#0565E6] cursor-pointer"
                            />
                            <div className="flex flex-col">
                              <span className="font-bold text-[#111827] text-sm">{pm.bankName} - {pm.accountNumber.slice(-4)}</span>
                              <span className="text-xs font-bold text-gray-500">{pm.accountName}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                      <button 
                        onClick={() => setShowPaymentModal('bank')}
                        className="text-sm font-black text-[#0565E6] hover:text-[#044ab8] flex items-center gap-2"
                      >
                        <span className="text-lg">+</span> Add New Bank Account
                      </button>
                    </div>
                  )}
                </div>

                {/* Cash */}
                <div 
                  className={`rounded-[32px] border-2 p-6 transition-all ${paymentType === 'cash' ? 'border-[#0565E6] bg-[#E8F1FF]' : 'border-gray-50 bg-white hover:border-gray-200 cursor-pointer'}`}
                  onClick={() => setPaymentType('cash')}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 border ${paymentType === 'cash' ? 'bg-[#0565E6] text-white border-[#0565E6]' : 'bg-white text-gray-500 border-gray-100'}`}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-[#111827] text-lg">Cash</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Cash Payment</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentType === 'cash' ? 'border-[#0565E6] bg-[#0565E6]' : 'border-gray-300'}`}>
                      {paymentType === 'cash' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* End Step 3 */}

          </div>

          {/* Sidebar Summary */}
          <div className="w-full lg:w-96 space-y-6">
            <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
              <div className="flex items-center gap-6 mb-8 bg-gray-50/50 p-4 rounded-3xl">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-sm border border-gray-100">
                  <img 
                    src={quote.device?.imageUrl || "https://img.freepik.com/free-photo/mobile-phone-with-blank-screen_23-2148151433.jpg"} 
                    className="max-h-full object-contain" 
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-[#111827] leading-tight text-sm">{quote.device?.modelName}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-wider">{quote.device?.storage}</p>
                </div>
              </div>

              <div className="space-y-5">
                <PriceRow label="Final Offer" value={quote.priceBreakdown?.finalPrice} />
                <div className="pt-5 border-t border-gray-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#0565E6]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="text-[11px] font-black uppercase tracking-wider">Free doorstep pickup</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#0565E6]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="text-[11px] font-black uppercase tracking-wider">Instant payment at pickup</span>
                  </div>
                </div>
              </div>

              <button 
                disabled={submitting || !selectedAddressId || !selectedDate || !selectedSlot}
                onClick={handleCreateOrder}
                className="w-full mt-8 bg-[#0565E6] text-white font-black py-5 rounded-2xl hover:bg-[#044BA8] transition-all shadow-xl shadow-blue-100 disabled:opacity-50 disabled:shadow-none"
              >
                {submitting ? 'Scheduling...' : `Confirm Order — ${formatCurrency(quote.priceBreakdown?.finalPrice)}`}
              </button>
              {error && <p className="text-center text-red-500 text-xs font-bold mt-4">{error}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <CreateAddressModal onClose={() => setShowAddressModal(false)} />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <CreatePaymentModal type={showPaymentModal} onClose={() => setShowPaymentModal(null)} />
      )}
    </div>
  );
}

function CreateAddressModal({ onClose }) {
  const { user, refreshUser } = useAuth();
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
      const data = await res.json();
      if (res.ok && data.isServiceable) {
        setPincodeError('');
        setPincodeServiceable(true);
        setForm(f => ({
          ...f,
          city: data.city || f.city,
          state: data.state || f.state,
        }));
      } else {
        setPincodeServiceable(false);
        setPincodeError('Pincode not available — we do not service this area yet.');
      }
    } catch {
      setPincodeServiceable(false);
      setPincodeError('Could not verify pincode. Please try again.');
    } finally {
      setPincodeChecking(false);
    }
  };

  const handlePincodeChange = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setForm(f => ({ ...f, pincode: cleaned }));
    setPincodeError('');
    setPincodeServiceable(false);
    setFormError('');
    if (pincodeDebounce.current) clearTimeout(pincodeDebounce.current);
    pincodeDebounce.current = setTimeout(() => checkPincode(cleaned), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.address || !form.pincode || !form.city) {
      setFormError('Please fill address, pincode, and city.');
      return;
    }
    if (!form.state) {
      setFormError('Please enter state (or use a serviceable pincode to auto-fill).');
      return;
    }
    if (pincodeError || !pincodeServiceable) {
      setFormError('Please enter a serviceable pincode before saving.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        label: form.label || 'Home',
        address: form.address.trim(),
        landmark: form.landmark.trim(),
        pincode: form.pincode.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        name: (form.name || user?.name || 'Customer').trim() || 'Customer',
        phone: (form.phone || user?.phone || '').trim(),
      };
      if (form.alternatePhone?.trim()) {
        payload.alternatePhone = form.alternatePhone.trim();
      }

      await userService.addAddress(payload);
      await refreshUser();
      onClose();
    } catch (err) {
      const apiMessage =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Failed to add address';
      setFormError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl p-10 max-h-[90vh] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-[#111827] transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-[#E8F1FF] rounded-2xl flex items-center justify-center text-[#0565E6]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <h2 className="text-2xl font-black text-[#111827]">Create New Address</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
                Address Type
              </label>
              <div className="flex gap-3">
                {['Home', 'Office', 'Other'].map(type => (
                  <button 
                    key={type} 
                    type="button" 
                    onClick={() => setForm({ ...form, label: type })}
                    className={`flex-1 py-4 rounded-2xl border-2 font-black text-sm transition-all
                      ${form.label === type ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                Flat No / Building / Colony
              </label>
              <input 
                type="text" 
                placeholder="Enter building details" 
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#0565E6] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M2 12h20M12 2v20"/><circle cx="12" cy="12" r="10"/></svg>
                Pincode
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  inputMode="numeric"
                  placeholder="Enter Pincode" 
                  value={form.pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  maxLength={6}
                  className={`w-full bg-white border-2 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none transition-all ${
                    pincodeError ? 'border-red-400 focus:border-red-400' : 'border-gray-100 focus:border-[#0565E6]'
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
                <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  {pincodeError}
                </p>
              )}
              {pincodeServiceable && !pincodeChecking && (
                <p className="mt-2 text-xs font-bold text-green-500 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  Pincode is serviceable!
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                Landmark
              </label>
              <input 
                type="text" 
                placeholder="Enter landmark details" 
                value={form.landmark}
                onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#0565E6] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">City</label>
              <input 
                type="text" 
                placeholder="City" 
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">State</label>
              <input 
                type="text" 
                placeholder="State" 
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                Alternative Number <span className="normal-case tracking-normal font-bold text-gray-300">(optional)</span>
              </label>
              <input 
                type="tel" 
                inputMode="numeric"
                maxLength={10}
                placeholder="Optional contact number for pickup"
                value={form.alternatePhone}
                onChange={(e) => setForm({ ...form, alternatePhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#0565E6] transition-all"
              />
              <p className="mt-2 text-xs font-medium text-gray-400">
                Used as an extra contact when the agent calls for pickup.
              </p>
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-2xl px-4 py-3">
              {formError}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !!pincodeError || pincodeChecking || !pincodeServiceable}
            className="w-full mt-6 bg-[#0565E6] text-white font-black py-5 rounded-[24px] hover:bg-[#044ab8] transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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
      <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 max-h-[90vh] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-[#111827] transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-[#E8F1FF] rounded-2xl flex items-center justify-center text-[#0565E6]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h2 className="text-2xl font-black text-[#111827]">
            {type === 'upi' ? 'Add UPI ID' : 'Add Bank Details'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'upi' ? (
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">UPI ID</label>
              <input 
                type="text" 
                placeholder="e.g. 9876543210@ybl" 
                value={form.upiId}
                onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#0565E6] transition-all"
                required
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Account Holder Name</label>
                <input 
                  type="text" 
                  placeholder="Name as per bank" 
                  value={form.accountName}
                  onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#0565E6] transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Account Number</label>
                <input 
                  type="text" 
                  placeholder="Enter Account Number" 
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#0565E6] transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">IFSC Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. HDFC0001234" 
                  value={form.ifscCode}
                  onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#0565E6] transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Bank Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. HDFC Bank" 
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#0565E6] transition-all"
                  required
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 bg-[#0565E6] text-white font-black py-5 rounded-[24px] hover:bg-[#044ab8] transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
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
      <span className="font-black text-[#111827]">{formatCurrency(value)}</span>
    </div>
  );
}
