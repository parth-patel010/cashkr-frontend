import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/order.service';
import { formatCurrency } from '../utils/formatCurrency';
import Loader from '../components/ui/Loader';
import NoIndexSEO from '../components/seo/NoIndexSEO';
import { trackPhonePurchase } from '../utils/metaPixel';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePayment, setActivePayment] = useState('cash');
  const purchaseTracked = useRef(false);

  useEffect(() => {
    orderService.getOrder(orderId).then(res => {
      setOrder(res.data);
      setLoading(false);
      if (res.data.pickup?.paymentMethod) {
        setActivePayment(res.data.pickup.paymentMethod);
      }
      if (!purchaseTracked.current && res.data.device?.category === 'mobile') {
        purchaseTracked.current = true;
        trackPhonePurchase({
          orderId: res.data.orderId,
          brand: res.data.device.brand,
          modelName: res.data.device.modelName,
          value: res.data.priceBreakdown?.finalPrice,
        });
      }
    }).catch(() => setLoading(false));
  }, [orderId]);

  if (loading) return <Loader />;
  if (!order) return <div className="text-center py-20 font-bold text-gray-500">Order not found.</div>;

  const pickupDate = order.pickup?.date ? new Date(order.pickup.date) : new Date();
  const dayName = pickupDate.toLocaleDateString('en-IN', { weekday: 'long' });
  const dayNum = pickupDate.getDate();
  const monthName = pickupDate.toLocaleDateString('en-IN', { month: 'short' });

  return (
    <div className="bg-[#F9FAFB] min-h-screen py-10 sm:py-16 px-4">
      <NoIndexSEO title="Order Confirmation" path={`/order-confirmation/${orderId}`} />
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Success Banner */}
        <div className="bg-white rounded-[40px] border border-gray-100 p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-[#0565E6] rounded-full flex items-center justify-center text-white shrink-0 shadow-xl shadow-blue-100">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-black text-[#111827] mb-2">Thank you, your pickup is scheduled</h1>
              <p className="text-sm font-bold text-gray-400">Order ID: <span className="text-[#111827] uppercase">{orderId}</span></p>
              <p className="text-sm font-bold text-gray-400 mt-1">A confirmation has been sent to <span className="text-[#111827]">{order.pickup?.email || 'user@example.com'}</span></p>
              
              <div className="flex flex-wrap gap-3 mt-6">
                 {['On-spot verification', 'Instant payment after check', 'Pickup at your chosen slot'].map(tag => (
                   <div key={tag} className="flex items-center gap-2 bg-[#F9FAFB] px-4 py-2 rounded-xl border border-gray-100">
                     <div className="w-4 h-4 rounded-full border-2 border-[#0565E6] flex items-center justify-center">
                       <div className="w-1.5 h-1.5 bg-[#0565E6] rounded-full" />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">{tag}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          <div className="bg-[#E8F1FF] p-6 rounded-[32px] border border-[#0565E6]/10 max-w-xs relative group">
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#0565E6] rounded-full flex items-center justify-center border-4 border-white">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-[#0565E6] rounded-xl flex items-center justify-center text-white">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div>
                <h4 className="text-sm font-black text-[#111827]">Want to chat with your pickup partner?</h4>
              </div>
            </div>
            <p className="text-[11px] font-bold text-gray-500 leading-relaxed mb-4">Download the DeviceKart app for real-time chat & live order tracking</p>
            <button className="w-full bg-[#0565E6] text-white py-3.5 rounded-2xl font-black text-sm hover:bg-[#044ab8] transition-all flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download App to Chat
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="flex-1 space-y-8">
            {/* Order Details */}
            <div className="bg-white rounded-[40px] border border-gray-100 p-8 sm:p-10 shadow-sm relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-[#111827]">Order Details</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1">Order ID: <span className="uppercase">{orderId}</span></p>
                </div>
                <Link to={`/orders/${orderId}`} className="text-[#0565E6] font-black text-sm bg-[#E8F1FF] px-5 py-2.5 rounded-xl border border-[#0565E6]/10 hover:bg-[#0565E6] hover:text-white transition-all">
                  Track Order
                </Link>
              </div>

              <div className="bg-gray-50/50 rounded-[32px] p-8 sm:p-10 border border-gray-100/50 flex flex-col md:flex-row items-center gap-10">
                <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center p-4 shadow-sm border border-gray-100">
                  <img src={order.device?.imageUrl || "https://img.freepik.com/free-photo/mobile-phone-with-blank-screen_23-2148151433.jpg"} alt={order.device?.modelName} className="max-h-full object-contain" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <span className="text-[#0565E6] text-[10px] font-black uppercase tracking-[2px] mb-2 block">Final Value</span>
                  <h4 className="text-xl font-black text-[#111827] mb-2">{order.device?.modelName} {order.device?.storage}</h4>
                  <p className="text-4xl font-black text-[#111827] mb-6">{formatCurrency(order.priceBreakdown?.finalPrice)}</p>
                  
                  <div className="flex items-center gap-3 bg-[#E8F1FF] px-4 py-3 rounded-2xl border border-[#0565E6]/10">
                    <div className="w-5 h-5 bg-[#0565E6] rounded-full flex items-center justify-center text-white shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <p className="text-[11px] font-bold text-[#166534]">Your device is valued at {formatCurrency(order.priceBreakdown?.finalPrice)}. Payment is released right after on-spot verification.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 w-fit">
                <div className="w-2 h-2 rounded-full bg-[#0565E6]" />
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Please confirm the pickup partner ID at the door</p>
              </div>
            </div>

            {/* Update Payment Method */}
            <div className="bg-white rounded-[40px] border border-gray-100 p-8 sm:p-10 shadow-sm">
              <h3 className="text-xl font-black text-[#111827]">Update Payment Method</h3>
              <p className="text-xs font-bold text-gray-400 mt-1 mb-8">Order was placed with <span className="capitalize">{order.pickup?.paymentMethod}</span>. You can switch to UPI or Bank and save now.</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                  <div className="w-8 h-8 bg-[#F3F4F6] rounded-lg flex items-center justify-center text-[#111827]">3</div>
                  Select Payment Method
                </div>

                <div className="space-y-4">
                  <PaymentCard 
                    label="UPI" 
                    desc="Add UPI ID" 
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>}
                    active={activePayment === 'upi'}
                    onClick={() => setActivePayment('upi')}
                    expanded={activePayment === 'upi'}
                  >
                    <div className="mt-6 flex flex-col gap-2">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">UPI ID</p>
                       <div className="flex gap-2">
                         <input type="text" placeholder="Enter your UPI ID (e.g., name@upi)" className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#0565E6]" />
                         <button className="bg-[#0565E6] text-white px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                           Accept
                         </button>
                       </div>
                    </div>
                  </PaymentCard>

                  <PaymentCard 
                    label="Bank" 
                    desc="Add Bank Details" 
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M2 10l10-8 10 8"/></svg>}
                    active={activePayment === 'bank'}
                    onClick={() => setActivePayment('bank')}
                  />

                  <PaymentCard 
                    label="Cash" 
                    desc="Cash Payment" 
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>}
                    active={activePayment === 'cash'}
                    onClick={() => setActivePayment('cash')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-96 space-y-6">
            {/* Pickup Details */}
            <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
              <h3 className="text-xl font-black text-[#111827] mb-8">Pickup Details</h3>
              
              <div className="space-y-8">
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-[2px] mb-4">Pickup Date</p>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-24 bg-white border-2 border-[#F3F4F6] rounded-3xl flex flex-col items-center overflow-hidden shadow-sm">
                      <div className="w-full bg-[#F3F4F6] py-1.5 text-[9px] font-black text-gray-400 text-center uppercase tracking-widest">{dayName}</div>
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-[#111827]">{dayNum}</span>
                        <span className="text-[11px] font-bold text-gray-400 uppercase">{monthName}</span>
                      </div>
                    </div>
                    <div>
                       <p className="text-xs font-bold text-gray-400 mb-1">Time Slot</p>
                       <p className="text-lg font-black text-[#111827]">{order.pickup?.timeSlot}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-[2px] mb-4">Pickup Address</p>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-[#E8F1FF] rounded-2xl flex items-center justify-center text-[#0565E6] shrink-0 border border-[#0565E6]/5">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                    </div>
                    <div>
                      <p className="font-black text-[#111827] text-sm mb-1">{order.pickup?.label || 'Home'}</p>
                      <p className="text-xs font-medium text-gray-500 leading-relaxed">{order.pickup?.address}, {order.pickup?.city}, {order.pickup?.pincode}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
              <h3 className="text-lg font-black text-[#111827] mb-6">Quick Actions</h3>
              <div className="space-y-2">
                <ActionLink to={`/orders/${orderId}`} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>} label="Track Order" />
                <ActionLink to="/dashboard" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} label="View Profile" />
                <ActionLink to="/" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>} label="Sell Another Mobile" />
              </div>
            </div>

            {/* Support */}
            <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
              <h3 className="text-lg font-black text-[#111827] mb-2">Need a hand?</h3>
              <p className="text-xs font-bold text-gray-500 leading-relaxed mb-6">We are here if you want to reschedule, update details, or ask anything.</p>
              <button className="w-full bg-[#0565E6] text-white py-4 rounded-2xl font-black text-sm hover:bg-[#044BA8] transition-all shadow-lg shadow-blue-50">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentCard({ label, desc, icon, active, onClick, children, expanded }) {
  return (
    <div className={`p-6 rounded-[32px] border-2 transition-all ${active ? 'border-[#0565E6] bg-[#E8F1FF]' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'} cursor-pointer`} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${active ? 'bg-[#0565E6] text-white' : 'bg-white text-gray-400'}`}>
             {icon}
           </div>
           <div>
             <p className="font-black text-[#111827] text-sm">{label}</p>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{desc}</p>
           </div>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'border-[#0565E6] bg-[#0565E6]' : 'border-gray-200'}`}>
          {active && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
      </div>
      {expanded && children}
    </div>
  );
}

function ActionLink({ to, icon, label }) {
  return (
    <Link to={to} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all group">
      <div className="flex items-center gap-4">
        <div className="text-gray-400 group-hover:text-[#0565E6] transition-colors">{icon}</div>
        <span className="text-sm font-bold text-gray-600 group-hover:text-[#111827]">{label}</span>
      </div>
      <svg className="text-gray-300 group-hover:text-[#0565E6] transition-all group-hover:translate-x-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
    </Link>
  );
}
