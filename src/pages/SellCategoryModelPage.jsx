import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { deviceService } from '../services/device.service';
import Breadcrumb from '../components/ui/Breadcrumb';
import Loader from '../components/ui/Loader';
import { formatCurrency } from '../utils/formatCurrency';
import { getSellCategoryMeta } from '../constants/sellCategories';

export default function SellCategoryModelPage() {
  const { category, brand } = useParams();
  const meta = getSellCategoryMeta(category);
  const [models, setModels] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const brandName = brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : '';

  useEffect(() => {
    if (!meta || !brand) return;
    setLoading(true);
    deviceService
      .getModels(brand, category)
      .then((res) => setModels(res.data || []))
      .catch(() => setModels([]))
      .finally(() => setLoading(false));
  }, [brand, category, meta]);

  if (!meta) return <Navigate to="/" replace />;
  if (loading) return <Loader />;

  const filtered = models.filter((m) =>
    m.modelName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: meta.plural, href: `${meta.pathPrefix}/brand` },
          { label: brandName },
        ]}
      />

      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-2">
          Sell Old {brandName} {meta.plural} — Get Instant Price
        </h1>
        <p className="text-sm text-text-muted">Select your model below to get an accurate buyback price.</p>
      </div>

      <div className="relative max-w-md mb-8">
        <input
          type="text"
          placeholder={`Search ${brandName} models...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-4 pr-4 py-3 border-[1.5px] border-border rounded-xl text-sm bg-white focus:border-[#0565E6] focus:shadow-[0_0_0_3px_rgba(5,101,230,0.15)] outline-none transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg font-semibold mb-2">No models found</p>
          <p className="text-sm">Try a different search term, or add devices from Admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filtered.map((model) => (
            <Link
              key={model.slug}
              to={`${meta.pathPrefix}/${brand}/${model.slug}`}
              className="group bg-white rounded-2xl border border-border p-4 sm:p-5 transition-all duration-200 hover:border-[#0565E6] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(5,101,230,0.12)] no-underline flex flex-col"
            >
              <div className="h-32 sm:h-40 flex items-center justify-center mb-3 bg-gray-50 rounded-xl overflow-hidden">
                <img
                  src={
                    model.imageUrl ||
                    'https://img.freepik.com/free-photo/mobile-phone-with-blank-screen_23-2148151433.jpg'
                  }
                  alt={model.modelName}
                  className="max-h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="text-sm font-bold text-text-primary group-hover:text-[#0565E6] mb-1 line-clamp-2">
                {model.modelName}
              </h3>
              {model.maxPrice != null ? (
                <p className="text-xs text-text-muted font-semibold">
                  Up to {formatCurrency(model.maxPrice)}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
