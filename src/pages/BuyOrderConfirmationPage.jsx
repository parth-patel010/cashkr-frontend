import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import NoIndexSEO from '../components/seo/NoIndexSEO';
import PageCanvas from '../components/layout/PageCanvas';
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
    <PageCanvas narrow>
      <NoIndexSEO title="Buy Order Confirmation" path={`/buy/order-confirmation/${orderId}`} />
      <div className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden mt-4">
        <div className="px-5 sm:px-8 pt-7 sm:pt-9 pb-6 border-b border-[#E8EEF5] bg-[#F4F7FB]">
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white mb-4 shadow-[0_4px_14px_rgba(5,101,230,0.25)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-[1.75rem] font-extrabold text-gray-900 tracking-tight">
            Thank you, your order is placed
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-2">
            Order ID: <span className="text-gray-900 uppercase">{order.orderId}</span>
          </p>
        </div>

        <div className="p-5 sm:p-8">
          <div className="bg-[#F7F9FC] rounded-2xl border border-[#E8EEF5] p-4 sm:p-5 mb-6">
            <div className="flex gap-4 items-start">
              {snap.imageUrl ? (
                <img
                  src={snap.imageUrl}
                  alt={snap.title || snap.modelName}
                  className="w-16 h-16 object-contain rounded-xl bg-white border border-gray-100"
                />
              ) : null}
              <div>
                <p className="font-extrabold text-gray-900">
                  {snap.title || `${snap.brand || ''} ${snap.modelName || ''}`.trim()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Condition: {snap.conditionLabel || snap.conditionKey}
                </p>
                <p className="text-base font-extrabold text-primary mt-2">
                  {formatCurrency(snap.price || 0)}
                </p>
              </div>
            </div>
          </div>

          {order.shipping ? (
            <div className="mb-8 rounded-2xl border border-[#E8EEF5] bg-[#F7F9FC] p-4 sm:p-5">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-primary mb-2">
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

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/buy"
              className="flex-1 text-center bg-primary hover:bg-primary-dark text-white font-extrabold px-5 py-3.5 rounded-xl no-underline transition-all shadow-[0_4px_14px_rgba(5,101,230,0.20)]"
            >
              Continue shopping
            </Link>
            <Link
              to="/dashboard"
              className="flex-1 text-center border border-[#E8EEF5] bg-white text-gray-700 font-bold px-5 py-3.5 rounded-xl no-underline hover:bg-[#F7F9FC] transition-all"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </PageCanvas>
  );
}
