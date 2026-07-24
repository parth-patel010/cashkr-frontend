import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import Breadcrumb from '../components/ui/Breadcrumb';
import Loader from '../components/ui/Loader';
import PageCanvas from '../components/layout/PageCanvas';
import { formatBrandLabel, getBuyCategory } from '../constants/buyCategories';
import { useAuth } from '../hooks/useAuth';
import { buyService } from '../services/buy.service';
import { formatCurrency } from '../utils/formatCurrency';

const emptyShipping = {
  name: '',
  phone: '',
  address: '',
  pincode: '',
  city: '',
  state: '',
};

export default function BuyProductPage() {
  const { category = 'mobile', brand, slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const cat = getBuyCategory(category);
  const brandSlug = decodeURIComponent(brand || '');
  const brandName = location.state?.brandName || formatBrandLabel(brandSlug);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [shipping, setShipping] = useState(emptyShipping);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    buyService
      .getProduct(slug)
      .then((res) => {
        const data = res.data;
        const conditions = (data.conditions || []).filter((c) => Number(c.price) > 0);
        setProduct({ ...data, conditions });
        const first = conditions.find((c) => (c.stock ?? 0) > 0) || conditions[0];
        setSelectedKey(first?.key || '');
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!user) return;
    setShipping((prev) => ({
      ...prev,
      name: prev.name || user.name || user.fullName || '',
      phone: prev.phone || user.phone || '',
    }));
  }, [user]);

  const selected = useMemo(
    () => product?.conditions?.find((c) => c.key === selectedKey),
    [product, selectedKey],
  );

  const onBuyClick = () => {
    setError('');
    if (!selected) return;
    if ((selected.stock ?? 0) < 1) {
      setError('Selected condition is out of stock.');
      return;
    }
    if (!isAuthenticated) {
      navigate(`/login?returnUrl=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setShowCheckout(true);
  };

  const onPlaceOrder = async (e) => {
    e.preventDefault();
    if (!product || !selected || submitting) return;

    const required = ['name', 'phone', 'address', 'pincode', 'city', 'state'];
    for (const key of required) {
      if (!String(shipping[key] || '').trim()) {
        setError('Please fill all shipping details.');
        return;
      }
    }

    setSubmitting(true);
    setError('');
    try {
      const { data } = await buyService.placeOrder({
        productId: product._id,
        conditionKey: selected.key,
        shipping: {
          name: shipping.name.trim(),
          phone: shipping.phone.trim(),
          address: shipping.address.trim(),
          pincode: shipping.pincode.trim(),
          city: shipping.city.trim(),
          state: shipping.state.trim(),
        },
      });
      navigate(`/buy/order-confirmation/${data.orderId}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  if (!product) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-20 text-center text-text-muted">
        <p className="text-lg font-semibold mb-4">Product not found</p>
        <Link to={`/buy/${category}/brand`} className="text-primary font-bold no-underline">
          ← Back to brands
        </Link>
      </div>
    );
  }

  const title = product.title || `${product.brand} ${product.modelName}`;
  const displayBrand = product.brand || brandName;

  return (
    <PageCanvas>
      <SEOHead
        title={title}
        description={product.description || `Buy refurbished ${title} with warranty on DeviceKart.`}
        path={`/buy/${category}/${brandSlug}/${slug}`}
      />
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Buy', href: '/buy' },
          { label: cat.label, href: `/buy/${category}/brand` },
          {
            label: displayBrand,
            href: `/buy/${category}/${encodeURIComponent(brandSlug)}`,
          },
          { label: product.modelName || title },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-4">
        <div>
          <div className="bg-[#F4F7FB] rounded-2xl sm:rounded-[28px] border border-[#E8EEF5] h-72 sm:h-96 flex items-center justify-center mb-4 overflow-hidden shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={title} className="max-h-full object-contain p-6" />
            ) : (
              <span className="text-5xl font-extrabold text-gray-300">{title[0]}</span>
            )}
          </div>
          {product.videoUrl ? (
            <video
              src={product.videoUrl}
              controls
              className="w-full rounded-2xl border border-[#E8EEF5] bg-black"
            />
          ) : null}
        </div>

        <div className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="px-5 sm:px-7 pt-6 sm:pt-7 pb-5 border-b border-[#E8EEF5] bg-[#F4F7FB]">
            <span className="inline-block bg-primary-light text-primary text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full mb-3 border border-primary/10">
              Refurbished
            </span>
            <h1 className="text-2xl sm:text-[1.75rem] font-extrabold text-gray-900 tracking-tight mb-2">{title}</h1>
            {product.description ? (
              <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
            ) : null}
            <p className="text-sm font-semibold text-gray-500 mt-3">
              {product.warrantyMonths || 12} months warranty
            </p>
          </div>

          <div className="p-5 sm:p-7">
            {(product.descriptionImages || []).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {product.descriptionImages.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className="bg-[#F7F9FC] rounded-xl border border-[#E8EEF5] overflow-hidden aspect-square flex items-center justify-center"
                  >
                    <img
                      src={url}
                      alt={`${title} detail ${idx + 1}`}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <h2 className="text-base font-extrabold text-gray-900 mb-3">Choose condition</h2>
            <div className="space-y-3 mb-6">
              {(product.conditions || []).map((c) => {
                const active = c.key === selectedKey;
                const outOfStock = (c.stock ?? 0) < 1;
                return (
                  <button
                    key={c.key}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => setSelectedKey(c.key)}
                    className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                      active
                        ? 'border-primary bg-primary-light'
                        : 'border-[#E8EEF5] bg-[#F7F9FC] hover:border-gray-200'
                    } ${outOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-extrabold text-gray-900">{c.label}</span>
                      <span className="font-extrabold text-primary">{formatCurrency(c.price)}</span>
                    </div>
                    {c.description ? (
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{c.description}</p>
                    ) : null}
                    <p className="text-xs text-gray-400 mt-2">
                      {outOfStock ? 'Out of stock' : `In stock: ${c.stock}`}
                    </p>
                  </button>
                );
              })}
            </div>

            {error && !showCheckout ? (
              <p className="text-sm text-red-600 font-semibold mb-3">{error}</p>
            ) : null}

            {!showCheckout ? (
              <button
                type="button"
                onClick={onBuyClick}
                disabled={!selected || (selected.stock ?? 0) < 1}
                className="w-full bg-primary hover:bg-primary-dark text-white font-extrabold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(5,101,230,0.25)]"
              >
                {selected
                  ? `Buy now · ${formatCurrency(selected.price)}`
                  : 'Select a condition'}
              </button>
            ) : (
              <form onSubmit={onPlaceOrder} className="space-y-3 rounded-2xl border border-[#E8EEF5] p-4 sm:p-5 bg-[#F7F9FC]">
                <h3 className="text-base font-extrabold text-gray-900 mb-1">Shipping details</h3>
                <p className="text-xs text-gray-500 mb-3">
                  Order total: <strong className="text-primary">{formatCurrency(selected?.price || 0)}</strong> · {selected?.label}
                </p>
                {[
                  { key: 'name', label: 'Full name', type: 'text' },
                  { key: 'phone', label: 'Phone', type: 'tel' },
                  { key: 'address', label: 'Address', type: 'text' },
                  { key: 'pincode', label: 'Pincode', type: 'text' },
                  { key: 'city', label: 'City', type: 'text' },
                  { key: 'state', label: 'State', type: 'text' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      value={shipping[field.key]}
                      onChange={(e) =>
                        setShipping((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EEF5] rounded-xl text-sm outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>
                ))}
                {error ? <p className="text-sm text-red-600 font-semibold">{error}</p> : null}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 border border-[#E8EEF5] bg-white rounded-xl py-3 font-bold text-sm hover:bg-white transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] bg-primary hover:bg-primary-dark text-white rounded-xl py-3 font-extrabold text-sm disabled:opacity-50 shadow-[0_4px_14px_rgba(5,101,230,0.20)]"
                  >
                    {submitting ? 'Placing order...' : 'Place order'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageCanvas>
  );
}
