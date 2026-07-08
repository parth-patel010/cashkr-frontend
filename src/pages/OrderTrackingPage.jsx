import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/order.service';
import { userService } from '../services/user.service';
import { useAuth } from '../hooks/useAuth';
import { isSpecialModel } from '../utils/specialModels';
import { formatCurrency } from '../utils/formatCurrency';
import Loader from '../components/ui/Loader';
import NoIndexSEO from '../components/seo/NoIndexSEO';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showUpdatePayment, setShowUpdatePayment] = useState(false);

  const fetchOrder = () => {
    orderService.getOrder(orderId).then(res => {
      setOrder(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
    refreshUser();
  }, [orderId]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderService.cancelOrder(orderId);
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading) return <Loader />;
  if (!order) return <div className="text-center py-20 font-bold text-gray-500">Order not found.</div>;
  if (order.status === 'cancelled') {
    return (
      <div className="bg-[#F9FAFB] min-h-screen py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-12 rounded-[40px] shadow-sm border border-gray-100">
           <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
           </div>
           <h2 className="text-2xl font-black text-[#111827] mb-2">Order Cancelled</h2>
           <p className="text-sm font-bold text-gray-400 mb-8">This order has been cancelled successfully.</p>
           <button onClick={() => navigate('/dashboard')} className="w-full bg-[#111827] text-white font-black py-4 rounded-2xl hover:bg-black transition-all">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const pickupDateStr = order.pickup?.date ? new Date(order.pickup.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pending';

  const steps = [
    { label: 'Order Confirmed', status: 'placed' },
    { label: 'Vendor Assigned', status: 'assigned' },
    { label: 'Out For Pickup', status: 'picked' },
    { label: 'Pickup', status: 'completed' },
  ];

  const getStatusIndex = (status) => {
    if (['placed', 'scheduled'].includes(status)) return 0;
    if (status === 'assigned') return 1;
    if (['picked', 'verified'].includes(status)) return 2;
    if (['payment_initiated', 'completed'].includes(status)) return 3;
    return 0;
  };

  const currentIdx = getStatusIndex(order.status);

  return (
    <div className="bg-[#F9FAFB] min-h-screen py-10 sm:py-16 px-4">
      <NoIndexSEO title="Order Tracking" path={`/orders/${orderId}`} />
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 font-bold hover:text-[#111827] transition-colors mb-8"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>

        <div className="bg-white rounded-[40px] border border-gray-100 p-8 sm:p-12 shadow-sm space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-2xl font-black text-[#111827] mb-1">Order #: <span className="uppercase">{orderId}</span></h1>
              <p className="text-[#EF4444] font-black text-sm uppercase tracking-wider">PIN : 7803</p>
            </div>
            <button 
              onClick={() => setShowReport(true)}
              className="flex items-center gap-2 bg-[#F9FAFB] border border-gray-100 text-[#0565E6] px-6 py-3 rounded-2xl font-black text-sm hover:bg-white transition-all shadow-sm"
            >
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
               See Device Report
            </button>
          </div>

          <div className="flex flex-wrap gap-y-2 gap-x-8 text-sm font-bold">
             <p className="text-gray-400">Order date: <span className="text-[#111827]">{orderDate}</span></p>
             <p className="text-[#0565E6]">Pickup Date: <span className="font-black">{pickupDateStr} - {order.pickup?.timeSlot}</span></p>
          </div>

          <div className="border-t border-gray-50 pt-10">
            <h3 className="text-lg font-black text-[#111827] mb-10">Order Status: <span className="text-[#0565E6]">Generated</span></h3>
            
            {/* Progress Bar */}
            <div className="relative pt-12 pb-8">
              <div className="absolute top-[60px] left-0 right-0 h-1 bg-gray-100 rounded-full" />
              <div 
                className="absolute top-[60px] left-0 h-1 bg-[#0565E6] rounded-full transition-all duration-500" 
                style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
              />
              
              <div className="flex justify-between relative">
                {steps.map((step, i) => {
                  const isActive = i <= currentIdx;
                  return (
                    <div key={step.label} className="flex flex-col items-center">
                      <div className={`absolute -top-12 text-[11px] font-black uppercase tracking-tighter w-max
                        ${isActive ? 'text-[#0565E6]' : 'text-gray-300'}`}>
                        {step.label}
                      </div>
                      <div className={`w-6 h-6 rounded-full border-4 border-white shadow-sm relative z-10 transition-all duration-300
                        ${isActive ? 'bg-[#0565E6] scale-125' : 'bg-gray-200'}`} />
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-sm font-bold text-gray-500 text-center mt-6">Your order has been confirmed and ready for pickup.</p>
          </div>

          {/* Device Item */}
          <div className="bg-white border border-gray-100 rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-10">
             <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center p-4">
                <img 
                  src={order.device?.imageUrl || "https://img.freepik.com/free-photo/mobile-phone-with-blank-screen_23-2148151433.jpg"} 
                  alt={order.device?.modelName}
                  className="max-h-full object-contain"
                />
             </div>
             <div className="flex-1 text-center md:text-left">
                <h4 className="text-xl font-black text-[#111827] mb-1">{order.device?.modelName}</h4>
                <p className="text-sm font-bold text-gray-400">
                  {order.device?.category === 'laptop' 
                    ? `( ${order.device?.processor} / ${order.device?.ram} / ${order.device?.storage} )`
                    : `( ${order.device?.storage} / ${order.device?.ram || '8 GB'} )`
                  }
                </p>
             </div>
             <div className="text-center md:text-right">
                <p className="text-2xl font-black text-[#111827]">{formatCurrency(order.priceBreakdown?.finalPrice)}</p>
                <p className="text-xs font-bold text-gray-400">Qty: 1</p>
             </div>
          </div>

          {/* Logistics Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-gray-50">
            <div className="space-y-6">
              <div>
                <h5 className="text-sm font-black text-[#111827] mb-2">Payment Method</h5>
                <p className="text-xs font-bold text-gray-400 mb-3">Payment Type : <span className="text-[#0565E6] capitalize">{order.pickup?.paymentMethod}</span></p>
                {['placed', 'scheduled'].includes(order.status) && (
                  <button 
                    onClick={() => setShowUpdatePayment(true)}
                    className="text-xs font-black text-[#0565E6] border border-[#0565E6] rounded-xl px-4 py-2 hover:bg-[#0565E6] hover:text-white transition-all shadow-sm"
                  >
                    Update Payment Method
                  </button>
                )}
              </div>

              <div>
                 <h5 className="text-sm font-black text-[#111827] mb-4">Need Help</h5>
                 <div className="space-y-3">
                    <HelpLink label="Order issues" />
                    <HelpLink label="Pick Up" />
                    <HelpLink label="Contact Support" />
                 </div>
              </div>
            </div>

            <div className="space-y-6">
               <div>
                  <h5 className="text-sm font-black text-[#111827] mb-2">Pickup Address</h5>
                  <p className="text-xs font-bold text-gray-400 mb-4">Pickup Status: <span className="text-[#0565E6]">Order Generated</span></p>
                  
                  <div className="flex gap-3 mb-4">
                    {['placed', 'scheduled'].includes(order.status) && (
                      <>
                        <button 
                          onClick={() => setShowReschedule(true)}
                          className="flex items-center gap-2 bg-[#E8F1FF] text-[#0565E6] px-6 py-2.5 rounded-xl font-black text-xs hover:bg-[#0565E6] hover:text-white transition-all shadow-sm"
                        >
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                           Reschedule
                        </button>
                        <button 
                          onClick={handleCancel}
                          className="flex items-center gap-2 bg-red-50 text-red-500 px-6 py-2.5 rounded-xl font-black text-xs hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                           Cancel Order
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex gap-4 p-5 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm border border-gray-100">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                    </div>
                    <div>
                      <p className="font-black text-[#111827] text-xs mb-1">Home</p>
                      <p className="text-[11px] font-bold text-gray-500 leading-relaxed">{order.pickup?.address}, {order.pickup?.city}, {order.pickup?.pincode}</p>
                    </div>
                  </div>
               </div>

               <div>
                 <h5 className="text-sm font-black text-[#111827] mb-4">Order Summary</h5>
                 <div className="space-y-3 bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
                    <div className="flex justify-between text-xs font-bold text-gray-400">
                       <span>Subtotal</span>
                       <span className="text-[#111827]">{formatCurrency(order.priceBreakdown?.finalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-400">
                       <span>Pickup</span>
                       <span className="text-[#0565E6]">FREE</span>
                    </div>
                    <div className="pt-3 border-t border-gray-50 flex justify-between">
                       <span className="text-sm font-black text-[#111827]">Total Payout</span>
                       <span className="text-xl font-black text-[#111827]">{formatCurrency(order.priceBreakdown?.finalPrice)}</span>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {showReport && (
        <DeviceEvaluationReportModal order={order} onClose={() => setShowReport(false)} />
      )}

      {showReschedule && (
        <RescheduleModal 
          order={order} 
          onClose={() => setShowReschedule(false)} 
          onSuccess={() => {
            setShowReschedule(false);
            fetchOrder();
          }}
        />
      )}

      {showUpdatePayment && (
        <UpdatePaymentModal
          order={order}
          user={user}
          onClose={() => setShowUpdatePayment(false)}
          onSuccess={() => {
            setShowUpdatePayment(false);
            fetchOrder();
          }}
        />
      )}
    </div>
  );
}

const supportsESIM = (modelName) => {
  if (!modelName) return false;
  const name = modelName.toLowerCase();
  const allowed = [
    'iphone 13 pro', 'iphone 13 pro max',
    'iphone 14 pro', 'iphone 14 pro max',
    'iphone 15 pro', 'iphone 15 pro max',
    'iphone 16 pro', 'iphone 16 pro max',
    'iphone 17', 'iphone 17 air', 'iphone 17 pro', 'iphone 17 pro max'
  ];
  return allowed.some(pattern => name.includes(pattern));
};

function DeviceEvaluationReportModal({ order, onClose }) {
  const isLaptop = order.device?.category === 'laptop';
  
  const issueLabels = {
    // Physical issues
    'glass_crack': 'Glass Crack',
    'back_panel': 'Back Panel Damage/Scratches',
    'camera_glass_broken': 'Camera Glass Broken',
    
    // Technical issues
    'battery_service': 'Battery Warning / Service Required',
    'front_camera': 'Front Camera faulty',
    'back_camera': 'Back Camera faulty',
    'volume_button': 'Volume button issue',
    'wifi_issue': 'Wifi/Wireless issue',
    'finger_touch': 'Finger touch/Touch ID issue',
    'face_unlock': 'Face unlock/Face ID issue',
    'speaker_faulty': 'Speaker faulty',
    'power_button': 'Power button issue',
    'charging_port': 'Charging port issue',
    'audio_receiver': 'Audio receiver issue',
    'bluetooth': 'Bluetooth issue',
    'vibrator': 'Vibrator issue',
    'microphone': 'Microphone issue',
    'proximity_sensor': 'Proximity sensor issue',
  };

  const physicalIssues = order.device?.physicalIssues || [];
  const technicalIssues = order.device?.technicalIssues || [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden">
        <div className="p-8 text-center relative border-b border-gray-50">
          <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-900 transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <h2 className="text-2xl font-black text-[#111827] mb-2">Device Evaluation Report</h2>
          <p className="text-sm font-bold text-gray-400">This is the report that you filled while selling this device.</p>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar space-y-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-black text-[#0565E6] mb-1">Device Evaluation</h3>
              <p className="text-sm font-black text-[#111827]">Summary</p>
            </div>
            <div className="space-y-4">
              <ReportRow label="Device Category" value={isLaptop ? 'Laptop' : 'Mobile'} />
              {!isSpecialModel(order.device?.brand, order.device?.modelName) && (
                <ReportRow label="Device Age" value={order.device?.deviceAge || '3 - 6 Months'} />
              )}
              {isLaptop ? (
                <>
                  <ReportRow label="Processor" value={order.device?.processor || 'N/A'} />
                  <ReportRow label="Generation" value={order.device?.generation || 'N/A'} />
                  <ReportRow label="RAM" value={order.device?.ram || 'N/A'} />
                  <ReportRow label="Storage" value={order.device?.storage || 'N/A'} />
                  <ReportRow label="Graphics" value={order.device?.hasDedicatedGpu ? order.device?.graphicsCard : 'Integrated'} />
                  <ReportRow label="Screen Size" value={order.device?.screenSize || 'N/A'} />
                  <ReportRow label="Touch Screen" value={order.device?.hasTouchscreen ? 'Yes' : 'No'} />
                  <ReportRow label="Accessories" value={Array.isArray(order.device?.accessories) ? order.device.accessories.join(', ') : order.device?.accessories || 'None'} />
                </>
              ) : (
                <>
                  {!isSpecialModel(order.device?.brand, order.device?.modelName) && (
                    <ReportRow label="Under Warranty" value={order.device?.underWarranty ? 'Yes' : 'No'} isAlert={!order.device?.underWarranty} />
                  )}
                  {supportsESIM(order.device?.modelName) && order.device?.eSIMSupport && (
                    <ReportRow label="eSIM Support" value={order.device.eSIMSupport === 'esim_only_global' ? 'Dual eSIM Only' : 'Physical + eSIM'} />
                  )}
                  <ReportRow label="Calls Functional" value={order.device?.ableToMakeCalls ? 'Yes' : 'No'} isAlert={!order.device?.ableToMakeCalls} />
                  <ReportRow label="Touch screen working" value={order.device?.isTouchScreenWorking ? 'Yes' : 'No'} isAlert={!order.device?.isTouchScreenWorking} />
                  <ReportRow label="Screen Original" value={order.device?.isScreenOriginal ? 'Yes' : 'No'} isAlert={!order.device?.isScreenOriginal} />
                  <ReportRow label="Accessories" value={Array.isArray(order.device?.accessories) ? order.device.accessories.join(', ') : 'None'} />
                </>
              )}
            </div>
          </div>

          {/* Physical Condition Section (Mobile Only) */}
          {!isLaptop && (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-[#111827]">Physical Condition</h3>
              <div className="space-y-3">
                 {physicalIssues.length === 0 ? (
                   <p className="text-sm font-bold text-gray-400 italic">No physical issues reported</p>
                 ) : (
                   physicalIssues.map(id => (
                     <div key={id} className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                       <p className="text-sm font-black text-[#EF4444]">{issueLabels[id] || id}</p>
                     </div>
                   ))
                 )}
              </div>
            </div>
          )}

          {/* Technical Condition Section (Mobile Only) */}
          {!isLaptop && (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-[#111827]">Technical Condition</h3>
              <div className="space-y-3">
                 {technicalIssues.length === 0 ? (
                   <div className="p-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No technical issues reported</p>
                   </div>
                 ) : (
                   technicalIssues.map(id => (
                     <div key={id} className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                       <p className="text-sm font-black text-[#EF4444]">{issueLabels[id] || id}</p>
                     </div>
                   ))
                 )}
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-4">
           <button onClick={onClose} className="flex-1 bg-[#111827] text-white font-black py-4 rounded-2xl hover:bg-black transition-all">Close Report</button>
        </div>
      </div>
    </div>
  );
}

function ReportRow({ label, value, isAlert }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-black text-[#111827]">{label}</span>
      <span className={`text-sm font-black ${isAlert ? 'text-[#EF4444]' : 'text-gray-500'}`}>{value}</span>
    </div>
  );
}

function RescheduleModal({ order, onClose, onSuccess }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split('T')[0];
  });

  const slots = ['10:00 AM - 01:00 PM', '01:00 PM - 04:00 PM', '04:00 PM - 07:00 PM'];

  const handleReschedule = async () => {
    if (!selectedDate || !selectedSlot) return;
    setSubmitting(true);
    try {
      await orderService.rescheduleOrder(order.orderId, { date: selectedDate, timeSlot: selectedSlot });
      onSuccess();
    } catch (error) {
      console.error('Reschedule failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8">
        <h2 className="text-2xl font-black text-[#111827] mb-2">Reschedule Pickup</h2>
        <p className="text-sm font-bold text-gray-400 mb-8">Select a new date and time for your pickup.</p>

        <div className="space-y-6">
          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Select Date</label>
            <div className="grid grid-cols-3 gap-2">
              {dates.map(date => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`py-3 rounded-xl border text-xs font-black transition-all
                    ${selectedDate === date ? 'bg-[#0565E6] text-white border-[#0565E6]' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200'}`}
                >
                  {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Select Time Slot</label>
            <div className="space-y-2">
              {slots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`w-full py-4 px-6 rounded-2xl border text-sm font-black transition-all text-left flex items-center justify-between
                    ${selectedSlot === slot ? 'bg-[#E8F1FF] text-[#0565E6] border-[#0565E6]' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200'}`}
                >
                  {slot}
                  {selectedSlot === slot && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl hover:bg-gray-200 transition-all">Cancel</button>
            <button 
              onClick={handleReschedule}
              disabled={submitting || !selectedDate || !selectedSlot}
              className="flex-2 bg-[#0565E6] text-white font-black py-4 px-8 rounded-2xl hover:bg-black transition-all disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Confirm Reschedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HelpLink({ label }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#0565E6] transition-colors">
           {label === 'Order issues' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
           {label === 'Pick Up' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="1" y="3" width="15" height="13"/><polyline points="16 8 20 8 23 11 23 16 16 16"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>}
           {label === 'Contact Support' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
        </div>
        <span className="text-xs font-bold text-gray-500 group-hover:text-[#111827] transition-colors">{label}</span>
      </div>
      <svg className="text-gray-300 group-hover:text-[#0565E6] group-hover:translate-x-0.5 transition-all" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 17l10-10M7 7h10v10"/></svg>
    </div>
  );
}

function UpdatePaymentModal({ order, user, onClose, onSuccess }) {
  const [paymentType, setPaymentType] = useState('cash'); // 'cash', 'upi', 'bank'
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(null); // 'upi' or 'bank'
  const [submitting, setSubmitting] = useState(false);

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

  const handleConfirm = async () => {
    if (paymentType !== 'cash' && !selectedPaymentId) return;
    setSubmitting(true);

    let finalPaymentMethodStr = 'Cash';
    if (paymentType !== 'cash') {
      const pm = user.paymentMethods.find(p => p._id === selectedPaymentId);
      if (pm.type === 'upi') {
        finalPaymentMethodStr = `UPI - ${pm.upiId}`;
      } else if (pm.type === 'bank') {
        finalPaymentMethodStr = `Bank - ${pm.bankName} (${pm.accountNumber.slice(-4)})`;
      }
    }

    try {
      await orderService.updatePaymentMethod(order.orderId, finalPaymentMethodStr);
      onSuccess();
    } catch (error) {
      console.error('Update payment failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl p-10 max-h-[90vh] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 bg-gray-50 flex items-center justify-center rounded-full text-gray-400 hover:text-[#111827] hover:bg-gray-100 transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="mb-10">
           <h2 className="text-2xl font-black text-[#111827] mb-2">Update Payment Method</h2>
           <p className="text-sm font-bold text-gray-400">
             Order was placed with <span className="capitalize">{order.pickup?.paymentMethod}</span>. You can switch to UPI or Bank and save now.
           </p>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-[#F3F4F6] rounded-xl flex items-center justify-center text-[#111827] font-black">3</div>
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Select Payment Method</h3>
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

        <button 
          onClick={handleConfirm}
          disabled={submitting || (paymentType !== 'cash' && !selectedPaymentId)}
          className="w-full mt-8 bg-[#0565E6] text-white font-black py-5 rounded-[24px] hover:bg-[#044BA8] transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
        >
          {submitting ? 'Updating...' : 'Update Payment Method'}
        </button>
      </div>

      {showPaymentModal && (
        <CreatePaymentModal type={showPaymentModal} onClose={() => setShowPaymentModal(null)} />
      )}
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
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
            className="w-full mt-6 bg-[#0565E6] text-white font-black py-5 rounded-[24px] hover:bg-[#044BA8] transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
          >
            {loading ? 'Saving...' : 'Save Details'}
          </button>
        </form>
      </div>
    </div>
  );
}
