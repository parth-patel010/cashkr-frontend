import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import NoIndexSEO from '../components/seo/NoIndexSEO';
import Loader from '../components/ui/Loader';
import { buyService } from '../services/buy.service';
import { formatCurrency } from '../utils/formatCurrency';

export default function BuyOrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buyService
      .getOrder(orderId)
      .then((res) => setOrder(res.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <Loader />;

  if (!order) {
    return (
      <div className="text-center py-20 font-bold text-gray-500">
        Order not found.
        <div className="mt-4">
          <Link to="/buy" className="text-primary no-underline">
            Browse devices
          </Link>
        </div>
      </div>
    );
  }

  const snap = order.productSnapshot || {};

  return (
    <div className="bg-[#F9FAFB] min-h-screen py-10 sm:py-16 px-4">
      <NoIndexSEO title="Buy Order Confirmation" path={`/buy/order-confirmation/${orderId}`} />
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-[32px] border border-gray-100 p-8 sm:p-10 shadow-sm">
          <div className="w-16 h-16 bg-[#0565E6] rounded-full flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-100">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111827] mb-2">
            Thank you, your order is placed
          </h1>
          <p className="text-sm font-bold text-gray-400 mb-6">
            Order ID: <span className="text-[#111827] uppercase">{order.orderId}</span>
          </p>

          <div className="bg-[#F9FAFB] rounded-2xl border border-gray-100 p-5 mb-6">
            <div className="flex gap-4 items-start">
              {snap.imageUrl ? (
                <img
                  src={snap.imageUrl}
                  alt={snap.title || snap.modelName}
                  className="w-16 h-16 object-contain rounded-xl bg-white border border-gray-100"
                />
              ) : null}
              <div>
                <p className="font-bold text-[#111827]">
                  {snap.title || `${snap.brand || ''} ${snap.modelName || ''}`.trim()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Condition: {snap.conditionLabel || snap.conditionKey}
                </p>
                <p className="text-base font-extrabold text-[#0565E6] mt-2">
                  {formatCurrency(snap.price || 0)}
                </p>
              </div>
            </div>
          </div>

          {order.shipping ? (
            <div className="mb-8">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-400 mb-2">
                Shipping to
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {order.shipping.name}
                <br />
                {order.shipping.address}
                <br />
                {order.shipping.city}, {order.shipping.state} {order.shipping.pincode}
                <br />
                {order.shipping.phone}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Link
              to="/buy"
              className="bg-primary text-white font-bold px-5 py-3 rounded-xl no-underline"
            >
              Continue shopping
            </Link>
            <Link
              to="/dashboard"
              className="border border-border text-text-primary font-bold px-5 py-3 rounded-xl no-underline"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
