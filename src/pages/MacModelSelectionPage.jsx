import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { deviceService } from '../services/device.service';
import Breadcrumb from '../components/ui/Breadcrumb';
import Loader from '../components/ui/Loader';
import { formatCurrency } from '../utils/formatCurrency';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IMacIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

export default function MacModelSelectionPage() {
  const { brand } = useParams();
  const [models, setModels] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);

  useEffect(() => {
    deviceService.getModels(brand, 'mac').then(res => {
      setModels(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [brand]);

  const filtered = models.filter(m =>
    m.modelName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'iMac / Mac', href: '/sell-imac/brand' },
        { label: brandName },
      ]} />

      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-2">
          Sell Old {brandName} iMac — Get Instant Price
        </h1>
        <p className="text-sm text-text-muted">Select your model below to get an accurate buyback price.</p>
      </div>

      <div className="relative max-w-md mb-8">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
        <input
          type="text"
          placeholder={`Search ${brandName} iMac models...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border-[1.5px] border-border rounded-xl text-sm bg-white focus:border-[#0565E6] focus:shadow-[0_0_0_3px_rgba(5,101,230,0.15)] outline-none transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg font-semibold mb-2">No models found</p>
          <p className="text-sm">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filtered.map(model => (
            <Link
              key={model.slug}
              to={`/sell-imac/${brand}/${model.slug}`}
              className="group bg-white rounded-2xl border border-border p-4 sm:p-5 transition-all duration-200 hover:border-[#0565E6] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(5,101,230,0.12)] no-underline flex flex-col"
            >
              <div className="bg-gray-50 rounded-xl h-28 sm:h-36 flex items-center justify-center mb-4 group-hover:bg-[#0565E6]/5 transition-colors relative">
                {model.imageUrl ? (
                  <img src={model.imageUrl} alt={model.modelName} className="h-24 sm:h-28 object-contain" />
                ) : (
                  <IMacIcon />
                )}
              </div>

              <h3 className="text-sm sm:text-base font-bold text-text-primary mb-1 leading-tight">{model.modelName}</h3>

              {model.processorFamily && (
                <span className="inline-block text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md mb-1 w-fit">
                  {model.processorFamily}
                </span>
              )}

              {model.ramOptions && model.ramOptions.length > 0 && (
                <p className="text-[10px] text-text-muted mb-2">
                  {model.ramOptions[0]} – {model.ramOptions[model.ramOptions.length - 1]} RAM
                </p>
              )}

              <p className="text-xs text-text-muted mb-3">Upto {formatCurrency(model.maxPrice)}</p>

              <div className="mt-auto">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0565E6] bg-[#0565E6]/5 px-3 py-1.5 rounded-lg group-hover:bg-[#0565E6] group-hover:text-white transition-colors">
                  Get Quote →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
