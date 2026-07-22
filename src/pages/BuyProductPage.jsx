import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import Breadcrumb from '../components/ui/Breadcrumb';
import Loader from '../components/ui/Loader';
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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div className="bg-gray-50 rounded-2xl border border-border h-72 sm:h-96 flex items-center justify-center mb-4 overflow-hidden">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={title} className="max-h-full object-contain p-6" />
            ) : (
              <span className="text-5xl font-black text-gray-300">{title[0]}</span>
            )}
          </div>
          {product.videoUrl ? (
            <video
              src={product.videoUrl}
              controls
              className="w-full rounded-2xl border border-border bg-black"
            />
          ) : null}
        </div>

        <div>
          <span className="inline-block bg-primary-light text-primary text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full mb-3">
            Refurbished
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-2">{title}</h1>
          {product.description ? (
            <p className="text-sm text-text-muted leading-relaxed mb-3">{product.description}</p>
          ) : null}
          {(product.descriptionImages || []).length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {product.descriptionImages.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className="bg-gray-50 rounded-xl border border-border overflow-hidden aspect-square flex items-center justify-center"
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
          <p className="text-sm font-semibold text-text-muted mb-6">
            {product.warrantyMonths || 12} months warranty
          </p>

          <h2 className="text-base font-extrabold text-text-primary mb-3">Choose condition</h2>
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
                  className={`w-full text-left rounded-2xl border p-4 transition-all ${
                    active
                      ? 'border-primary bg-primary-light/40 shadow-sm'
                      : 'border-border bg-white hover:border-primary/50'
                  } ${outOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-text-primary">{c.label}</span>
                    <span className="font-extrabold text-primary">{formatCurrency(c.price)}</span>
                  </div>
                  {c.description ? (
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">{c.description}</p>
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
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selected
                ? `Buy now · ${formatCurrency(selected.price)}`
                : 'Select a condition'}
            </button>
          ) : (
            <form onSubmit={onPlaceOrder} className="space-y-3 border border-border rounded-2xl p-5 bg-white">
              <h3 className="text-base font-extrabold text-text-primary mb-1">Shipping details</h3>
              <p className="text-xs text-text-muted mb-3">
                Order total: <strong>{formatCurrency(selected?.price || 0)}</strong> · {selected?.label}
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
                  <label className="block text-xs font-bold text-text-muted mb-1">{field.label}</label>
                  <input
                    type={field.type}
                    value={shipping[field.key]}
                    onChange={(e) =>
                      setShipping((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary"
                    required
                  />
                </div>
              ))}
              {error ? <p className="text-sm text-red-600 font-semibold">{error}</p> : null}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 border border-border rounded-xl py-3 font-bold text-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] bg-primary hover:bg-primary-dark text-white rounded-xl py-3 font-bold text-sm disabled:opacity-50"
                >
                  {submitting ? 'Placing order...' : 'Place order'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
