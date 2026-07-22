import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import {
  Search, ChevronLeft, ChevronRight, X, Plus, Trash2,
  Smartphone, Monitor, Laptop, FileText, Percent, Info, ToggleLeft, ToggleRight
} from 'lucide-react';
import './admin.css';

const DEFAULT_MULTIPLIERS = {
  conditionMultipliers: { likenew: 1.0, good: 0.95, average: 0.85, belowAverage: 0.70, fair: 0.72, poor: 0.55 },
  screenMultipliers: { noScratch: 1.0, minorScratch: 0.95, crackedWorks: 0.75, crackedBroken: 0.50, noIssue: 1.0, deadPixels: 0.82 },
  batteryDeductions: { above80: 0, above60: 1000, below60: 2500 },
  ageMultipliers: { lessThan3: 1.0, threeToEleven: 0.88, aboveEleven: 0.75, lessThan1: 0.92, oneToTwo: 0.78, twoToThree: 0.62 },
  functionalDeductions: {
    batteryLow: 2000, cameraIssue: 3000, speakerIssue: 1500, biometricIssue: 4000, chargingIssue: 1000,
    battery: 2000, keyboard: 2500, trackpad: 1500, speakers: 1000, webcam: 800, ports: 1200, hinge: 2000, overheat: 1500, gpu: 3000,
    screenChanged: 3000, wifi: 1200, biometric: 1500, charging: 1500, cdDrive: 1000, chargerIssue: 1200, hardDisk: 3500, displayIssue: 4000, motherboard: 6000
  },
  screenDeductions: { screenCracked: 18, lineDiscolour: 18 },
  bodyDeductions: { minorDentTop: 8, minorDentBase: 8, majorDentTop: 35, majorDentBase: 40, minorScratch: 5, majorScratch: 8 },
  screenSizeMultipliers: { '10-12': 0.95, '13-14': 1.0, '15-16': 1.05, '16+': 1.1 },
  dedicatedGpuBonus: { 'GTX 1650': 2000, 'RTX 2050': 2500, 'RTX 3050': 3500, 'RTX 4050': 5000, 'RTX 4060': 7000, 'RTX 4070': 10000, 'RTX 4080': 15000, 'RTX 4090': 25000 },
  accessoriesBonus: { bill: 300, box: 500, charger: 800, withBoxAndCharger: 800, originalCharger: 500, thirdPartyCharger: 200, none: 0 }
};

export default function AdminDevices() {
  const [devices, setDevices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [brandOptions, setBrandOptions] = useState([]);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDescImages, setUploadingDescImages] = useState(false);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState('core'); // core | variants | multipliers | deductions
  const [selectedDevice, setSelectedDevice] = useState(null); // null if creating
  const [formData, setFormData] = useState({});

  const loadBrandOptions = (cat) => {
    if (!cat) {
      setBrandOptions([]);
      return;
    }
    adminService
      .getBrands({ category: cat, offer: 'sell', active: 'true' })
      .then((res) => setBrandOptions(res.data.brands || []))
      .catch(() => setBrandOptions([]));
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch devices
  const fetchDevices = () => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (category) params.category = category;

    adminService.getDevices(params)
      .then((res) => {
        setDevices(res.data.devices);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load devices', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDevices();
  }, [debouncedSearch, category, page]);

  useEffect(() => {
    if (showModal && formData.category) {
      loadBrandOptions(formData.category);
    }
  }, [showModal, formData.category]);

  // Open modal for Create
  const handleCreateOpen = () => {
    setSelectedDevice(null);
    setFormData({
      category: 'mobile',
      brand: '',
      modelName: '',
      slug: '',
      imageUrl: '',
      descriptionImages: [],
      videoUrl: '',
      description: '',
      processorFamily: '',
      generation: '',
      gpuType: '',
      isGamingLaptop: false,
      tier: 'Mid-range',
      isActive: true,
      variants: [],
      ...JSON.parse(JSON.stringify(DEFAULT_MULTIPLIERS))
    });
    setModalTab('core');
    setShowModal(true);
  };

  // Open modal for Edit
  const handleEditOpen = (device) => {
    setSelectedDevice(device);
    // Deep clone with defaults merged
    const cloned = JSON.parse(JSON.stringify(device));
    const merged = {
      ...JSON.parse(JSON.stringify(DEFAULT_MULTIPLIERS)),
      ...cloned
    };
    setFormData(merged);
    setModalTab('core');
    setShowModal(true);
  };

  // Handle core field changes
  const handleInputChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      [field]: val
    }));
  };

  // Handle nested multipliers changes
  const handleNestedChange = (parent, child, val) => {
    const numeric = val === '' ? '' : parseFloat(val);
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: numeric
      }
    }));
  };

  // Auto-generate slug from brand + model name
  const handleGenerateSlug = () => {
    if (formData.brand && formData.modelName) {
      const generated = `${formData.brand}-${formData.modelName}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      handleInputChange('slug', generated);
    }
  };

  // Variants handlers
  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        { processor: '', generation: '', storage: '', ram: '', storageType: '', basePrice: 0 }
      ]
    }));
  };

  const handleRemoveVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== index)
    }));
  };

  const handleVariantChange = (index, field, val) => {
    const updated = formData.variants.map((v, idx) => {
      if (idx === index) {
        return {
          ...v,
          [field]: field === 'basePrice' ? (val === '' ? '' : Number(val)) : val
        };
      }
      return v;
    });
    setFormData(prev => ({ ...prev, variants: updated }));
  };

  // Submit Device Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.brand || !formData.modelName || !formData.slug) {
      alert('Brand, Model Name and Slug are required.');
      return;
    }

    try {
      if (selectedDevice) {
        await adminService.updateDevice(selectedDevice._id, formData);
      } else {
        await adminService.createDevice(formData);
      }
      setShowModal(false);
      fetchDevices();
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred while saving device');
    }
  };

  // Delete Device
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action is permanent.`)) {
      try {
        await adminService.deleteDevice(id);
        fetchDevices();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete device');
      }
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'laptop':
      case 'mac':
        return <Laptop className="w-4 h-4" />;
      case 'tablet':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Smartphone className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Filter and Actions Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              className="admin-search pl-10"
              placeholder="Search model or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          </div>

          <select
            className="admin-select"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          >
            <option value="">All Categories</option>
            <option value="mobile">Mobiles</option>
            <option value="tablet">Tablets</option>
            <option value="laptop">Laptops</option>
            <option value="mac">Macs</option>
            <option value="tv">TV</option>
            <option value="earbuds">Earbuds</option>
            <option value="refrigerator">Refrigerator</option>
            <option value="smartwatch">Smartwatch</option>
          </select>
        </div>

        {/* Add Device Button */}
        <button onClick={handleCreateOpen} className="admin-btn admin-btn-primary self-start">
          <Plus size={16} />
          <span>Add New Device</span>
        </button>
      </div>

      {/* Devices Catalog Grid */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div className="p-12 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 admin-skeleton w-full" />
            ))}
          </div>
        ) : devices.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No devices found matching current filters.
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Device Info</th>
                  <th>Category</th>
                  <th>Slug</th>
                  <th>Variants</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                          {device.imageUrl ? (
                            <img src={device.imageUrl} alt={device.modelName} className="object-contain w-full h-full p-1" />
                          ) : (
                            getCategoryIcon(device.category)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-black">{device.brand} {device.modelName}</div>
                          <div className="text-[10px] text-gray-500 font-mono">ID: {device._id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 capitalize text-xs">
                        {getCategoryIcon(device.category)}
                        <span>{device.category}</span>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-slate-400">{device.slug}</td>
                    <td>
                      <span className="admin-badge admin-badge-blue">
                        {device.variants?.length || 0} variants
                      </span>
                    </td>
                    <td>
                      <span className={device.isActive ? 'admin-badge admin-badge-green' : 'admin-badge admin-badge-red'}>
                        {device.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditOpen(device)}
                          className="admin-btn admin-btn-ghost text-xs py-1 px-2.5"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(device._id, `${device.brand} ${device.modelName}`)}
                          className="admin-btn admin-btn-danger text-xs py-1 px-2.5"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="admin-pagination">
              <div className="admin-pagination-info">
                Page {page} of {totalPages} (Total {total} devices)
              </div>
              <div className="admin-pagination-btns">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="admin-pagination-btn"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="admin-pagination-btn"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Device Modal */}
      {showModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="admin-modal max-w-4xl" onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="admin-modal-header">
              <h3>{selectedDevice ? 'Edit Device Properties' : 'Create New Device'}</h3>
              <button onClick={() => setShowModal(false)} className="admin-modal-close">
                <X size={16} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="px-6 pt-4">
              <div className="admin-tabs">
                <button
                  type="button"
                  className={`admin-tab ${modalTab === 'core' ? 'active' : ''}`}
                  onClick={() => setModalTab('core')}
                >
                  <Info size={14} className="inline mr-1" />
                  Core Details
                </button>
                <button
                  type="button"
                  className={`admin-tab ${modalTab === 'variants' ? 'active' : ''}`}
                  onClick={() => setModalTab('variants')}
                >
                  <FileText size={14} className="inline mr-1" />
                  Variants ({formData.variants?.length || 0})
                </button>
                <button
                  type="button"
                  className={`admin-tab ${modalTab === 'multipliers' ? 'active' : ''}`}
                  onClick={() => setModalTab('multipliers')}
                >
                  <Percent size={14} className="inline mr-1" />
                  Multipliers
                </button>
                <button
                  type="button"
                  className={`admin-tab ${modalTab === 'deductions' ? 'active' : ''}`}
                  onClick={() => setModalTab('deductions')}
                >
                  <Percent size={14} className="inline mr-1" />
                  Deductions & Bonuses
                </button>
              </div>
            </div>

            {/* Modal Body with Form */}
            <form onSubmit={handleSubmit} className="admin-modal-body pt-2 space-y-6">

              {/* TAB 1: CORE DETAILS */}
              {modalTab === 'core' && (
                <div className="space-y-4">
                  <div className="admin-field-row">
                    <div className="admin-field">
                      <label>Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => {
                          handleInputChange('category', e.target.value);
                          handleInputChange('brand', '');
                        }}
                      >
                        <option value="mobile">Mobile</option>
                        <option value="tablet">Tablet</option>
                        <option value="laptop">Laptop</option>
                        <option value="mac">Mac</option>
                        <option value="tv">TV</option>
                        <option value="earbuds">Earbuds</option>
                        <option value="refrigerator">Refrigerator</option>
                        <option value="smartwatch">Smartwatch</option>
                      </select>
                    </div>

                    <div className="admin-field">
                      <label>Brand</label>
                      <select
                        required
                        value={formData.brand || ''}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                      >
                        <option value="">Select brand</option>
                        {brandOptions.map((b) => (
                          <option key={b._id || b.name} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      {!brandOptions.length ? (
                        <p className="text-xs text-amber-500 mt-1">
                          No sell brands for this category. Add them under Brands first.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="admin-field-row">
                    <div className="admin-field">
                      <label>Model Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. iPhone 15 Pro, Titan GT77"
                        value={formData.modelName}
                        onChange={(e) => handleInputChange('modelName', e.target.value)}
                      />
                    </div>

                    <div className="admin-field">
                      <label>Slug (Unique Identifier)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="e.g. iphone-15-pro"
                          value={formData.slug}
                          onChange={(e) => handleInputChange('slug', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={handleGenerateSlug}
                          className="admin-btn admin-btn-ghost text-xs whitespace-nowrap"
                        >
                          Auto Generate
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="admin-field">
                    <label>Cover image (max 10MB)</label>
                    <div className="flex flex-wrap items-center gap-3">
                      {formData.imageUrl ? (
                        <img
                          src={formData.imageUrl}
                          alt="Cover"
                          className="w-16 h-16 object-contain rounded-lg border border-slate-200 bg-white"
                        />
                      ) : null}
                      <label className="admin-btn admin-btn-ghost cursor-pointer">
                        {uploadingImage ? 'Uploading...' : formData.imageUrl ? 'Change cover' : 'Upload cover'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingImage}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 10 * 1024 * 1024) {
                              alert('Image must be 10MB or less');
                              e.target.value = '';
                              return;
                            }
                            setUploadingImage(true);
                            try {
                              const { data } = await adminService.uploadImage(file);
                              handleInputChange('imageUrl', data.imageUrl);
                            } catch (err) {
                              alert(err.response?.data?.message || 'Image upload failed');
                            } finally {
                              setUploadingImage(false);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                      {formData.imageUrl ? (
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost text-xs text-red-500"
                          onClick={() => handleInputChange('imageUrl', '')}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="admin-field">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      placeholder="Short sell listing description"
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>

                  <div className="admin-field">
                    <label>Images in product description (multiple)</label>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {(formData.descriptionImages || []).map((url, idx) => (
                        <div key={`${url}-${idx}`} className="relative">
                          <img
                            src={url}
                            alt={`Description ${idx + 1}`}
                            className="w-16 h-16 object-contain rounded-lg border border-slate-200 bg-white"
                          />
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold"
                            onClick={() =>
                              handleInputChange(
                                'descriptionImages',
                                (formData.descriptionImages || []).filter((_, i) => i !== idx)
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="admin-btn admin-btn-ghost cursor-pointer inline-flex">
                      {uploadingDescImages ? 'Uploading...' : 'Upload description images'}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={uploadingDescImages}
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (!files.length) return;
                          const tooBig = files.find((f) => f.size > 10 * 1024 * 1024);
                          if (tooBig) {
                            alert('Each image must be 10MB or less');
                            e.target.value = '';
                            return;
                          }
                          setUploadingDescImages(true);
                          try {
                            const uploaded = [];
                            for (const file of files) {
                              const { data } = await adminService.uploadImage(file);
                              if (data.imageUrl) uploaded.push(data.imageUrl);
                            }
                            handleInputChange('descriptionImages', [
                              ...(formData.descriptionImages || []),
                              ...uploaded,
                            ]);
                          } catch (err) {
                            alert(err.response?.data?.message || 'Image upload failed');
                          } finally {
                            setUploadingDescImages(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="admin-field">
                    <label>Product video (max 10MB)</label>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        placeholder="Video URL"
                        value={formData.videoUrl || ''}
                        onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                      />
                      <label className="admin-btn admin-btn-ghost cursor-pointer">
                        {uploadingVideo ? 'Uploading...' : 'Upload video'}
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          disabled={uploadingVideo}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 10 * 1024 * 1024) {
                              alert('Video must be 10MB or less');
                              e.target.value = '';
                              return;
                            }
                            setUploadingVideo(true);
                            try {
                              const { data } = await adminService.uploadVideo(file);
                              handleInputChange('videoUrl', data.videoUrl);
                            } catch (err) {
                              alert(err.response?.data?.message || 'Video upload failed');
                            } finally {
                              setUploadingVideo(false);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Laptop-specific configurations */}
                  {(formData.category === 'laptop' || formData.category === 'mac') && (
                    <div className="border border-slate-800 p-4 rounded-xl space-y-4">
                      <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider block">Laptop Specific Configurations</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="admin-field">
                          <label>Processor Family</label>
                          <input
                            type="text"
                            placeholder="e.g. Core i7, M2 Max"
                            value={formData.processorFamily || ''}
                            onChange={(e) => handleInputChange('processorFamily', e.target.value)}
                          />
                        </div>
                        <div className="admin-field">
                          <label>Generation</label>
                          <input
                            type="text"
                            placeholder="e.g. 12th Gen, M2"
                            value={formData.generation || ''}
                            onChange={(e) => handleInputChange('generation', e.target.value)}
                          />
                        </div>
                        <div className="admin-field">
                          <label>GPU Type</label>
                          <input
                            type="text"
                            placeholder="Integrated / Dedicated"
                            value={formData.gpuType || ''}
                            onChange={(e) => handleInputChange('gpuType', e.target.value)}
                          />
                        </div>
                        <div className="admin-field">
                          <label>Tier</label>
                          <select
                            value={formData.tier || ''}
                            onChange={(e) => handleInputChange('tier', e.target.value)}
                          >
                            <option value="Budget">Budget</option>
                            <option value="Mid-range">Mid-range</option>
                            <option value="Premium">Premium</option>
                            <option value="Gaming">Gaming</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleInputChange('isGamingLaptop', !formData.isGamingLaptop)}
                          className="text-slate-400 hover:text-slate-100 flex items-center gap-2"
                        >
                          {formData.isGamingLaptop ? (
                            <ToggleRight size={28} className="text-blue-500" />
                          ) : (
                            <ToggleLeft size={28} className="text-slate-600" />
                          )}
                          <span className="text-xs font-bold uppercase tracking-wider">Gaming Laptop Category Tag</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange('isActive', !formData.isActive)}
                      className="text-slate-400 hover:text-slate-100 flex items-center gap-2"
                    >
                      {formData.isActive ? (
                        <ToggleRight size={28} className="text-emerald-500" />
                      ) : (
                        <ToggleLeft size={28} className="text-slate-600" />
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider">Device Is Active (Available for Trade-In)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: VARIANTS */}
              {modalTab === 'variants' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs text-slate-400 font-bold uppercase">Device Variants Matrix</span>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="admin-btn admin-btn-ghost text-xs py-1 px-3"
                    >
                      <Plus size={12} className="inline mr-1" />
                      Add Variant
                    </button>
                  </div>

                  {formData.variants?.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 bg-slate-950/40 border border-slate-900 rounded-xl">
                      No variants added. Click "Add Variant" to configure model options.
                    </div>
                  ) : (
                    <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3">
                      {formData.variants?.map((v, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center gap-3">
                          {['mobile', 'tablet', 'tv', 'earbuds', 'refrigerator', 'smartwatch'].includes(formData.category) ? (
                            <>
                              <div className="flex-1 min-w-[120px] admin-field mb-0">
                                <label className="text-[9px] mb-0.5">Storage</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. 128GB, 256GB"
                                  value={v.storage}
                                  onChange={(e) => handleVariantChange(idx, 'storage', e.target.value)}
                                />
                              </div>
                              <div className="w-[100px] admin-field mb-0">
                                <label className="text-[9px] mb-0.5">RAM (Optional)</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 6GB, 8GB"
                                  value={v.ram || ''}
                                  onChange={(e) => handleVariantChange(idx, 'ram', e.target.value)}
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-[110px] admin-field mb-0">
                                <label className="text-[9px] mb-0.5">Processor</label>
                                <input
                                  type="text"
                                  placeholder="Intel Core i5"
                                  value={v.processor || ''}
                                  onChange={(e) => handleVariantChange(idx, 'processor', e.target.value)}
                                />
                              </div>
                              <div className="w-[80px] admin-field mb-0">
                                <label className="text-[9px] mb-0.5">Gen</label>
                                <input
                                  type="text"
                                  placeholder="11th Gen"
                                  value={v.generation || ''}
                                  onChange={(e) => handleVariantChange(idx, 'generation', e.target.value)}
                                />
                              </div>
                              <div className="w-[90px] admin-field mb-0">
                                <label className="text-[9px] mb-0.5">Storage</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="512GB"
                                  value={v.storage}
                                  onChange={(e) => handleVariantChange(idx, 'storage', e.target.value)}
                                />
                              </div>
                              <div className="w-[80px] admin-field mb-0">
                                <label className="text-[9px] mb-0.5">RAM</label>
                                <input
                                  type="text"
                                  placeholder="16GB"
                                  value={v.ram || ''}
                                  onChange={(e) => handleVariantChange(idx, 'ram', e.target.value)}
                                />
                              </div>
                              <div className="w-[90px] admin-field mb-0">
                                <label className="text-[9px] mb-0.5">Storage Type</label>
                                <input
                                  type="text"
                                  placeholder="SSD"
                                  value={v.storageType || ''}
                                  onChange={(e) => handleVariantChange(idx, 'storageType', e.target.value)}
                                />
                              </div>
                            </>
                          )}
                          <div className="w-[120px] admin-field mb-0">
                            <label className="text-[9px] mb-0.5">Base Price (INR)</label>
                            <input
                              type="number"
                              required
                              placeholder="25000"
                              value={v.basePrice}
                              onChange={(e) => handleVariantChange(idx, 'basePrice', e.target.value)}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            className="admin-btn admin-btn-danger px-2 py-2 mt-3.5 self-center"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MULTIPLIERS */}
              {modalTab === 'multipliers' && (
                <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2">

                  {/* Condition Multipliers */}
                  <div>
                    <h4 className="admin-section-title">Condition Multipliers</h4>
                    <div className="admin-multiplier-grid">
                      {Object.keys(formData.conditionMultipliers || {}).map((cond) => (
                        <div key={cond} className="admin-multiplier-item">
                          <label>{cond}</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.conditionMultipliers[cond]}
                            onChange={(e) => handleNestedChange('conditionMultipliers', cond, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Screen Damage Multipliers */}
                  <div>
                    <h4 className="admin-section-title">Screen Assessment Multipliers</h4>
                    <div className="admin-multiplier-grid">
                      {Object.keys(formData.screenMultipliers || {}).map((scr) => (
                        <div key={scr} className="admin-multiplier-item">
                          <label>{scr}</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.screenMultipliers[scr]}
                            onChange={(e) => handleNestedChange('screenMultipliers', scr, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Laptop-specific configurations */}
                  {(formData.category === 'laptop' || formData.category === 'mac') && (
                    <>
                      {/* Age Multipliers */}
                      <div>
                        <h4 className="admin-section-title">Age Multipliers</h4>
                        <div className="admin-multiplier-grid">
                          {Object.keys(formData.ageMultipliers || {}).map((age) => (
                            <div key={age} className="admin-multiplier-item">
                              <label>{age}</label>
                              <input
                                type="number"
                                step="0.01"
                                value={formData.ageMultipliers[age]}
                                onChange={(e) => handleNestedChange('ageMultipliers', age, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Screen Size Multipliers */}
                      <div>
                        <h4 className="admin-section-title">Screen Size Multipliers</h4>
                        <div className="admin-multiplier-grid">
                          {Object.keys(formData.screenSizeMultipliers || {}).map((size) => (
                            <div key={size} className="admin-multiplier-item">
                              <label>{size} Inches</label>
                              <input
                                type="number"
                                step="0.01"
                                value={formData.screenSizeMultipliers[size]}
                                onChange={(e) => handleNestedChange('screenSizeMultipliers', size, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 4: DEDUCTIONS & BONUSES */}
              {modalTab === 'deductions' && (
                <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2">

                  {/* Functional Deductions */}
                  <div>
                    <h4 className="admin-section-title">Functional Deductions (Flat Deductions in INR)</h4>
                    <div className="admin-multiplier-grid">
                      {Object.keys(formData.functionalDeductions || {}).map((issue) => {
                        // Filter keys depending on category
                        const isLaptopIssue = ['battery', 'keyboard', 'trackpad', 'speakers', 'webcam', 'ports', 'hinge', 'overheat', 'gpu', 'screenChanged', 'wifi', 'biometric', 'charging', 'cdDrive', 'chargerIssue', 'hardDisk', 'displayIssue', 'motherboard'].includes(issue);
                        const isMobileIssue = ['batteryLow', 'cameraIssue', 'speakerIssue', 'biometricIssue', 'chargingIssue'].includes(issue);

                        if (['mobile', 'tablet', 'tv', 'earbuds', 'refrigerator', 'smartwatch'].includes(formData.category)) {
                          if (isLaptopIssue) return null;
                        } else {
                          if (isMobileIssue) return null;
                        }

                        return (
                          <div key={issue} className="admin-multiplier-item">
                            <label>{issue}</label>
                            <input
                              type="number"
                              value={formData.functionalDeductions[issue]}
                              onChange={(e) => handleNestedChange('functionalDeductions', issue, e.target.value)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Battery Deductions (Mobile) */}
                  {['mobile', 'tablet', 'tv', 'earbuds', 'refrigerator', 'smartwatch'].includes(formData.category) && (
                    <div>
                      <h4 className="admin-section-title">Battery Health Deductions (INR)</h4>
                      <div className="admin-multiplier-grid">
                        {Object.keys(formData.batteryDeductions || {}).map((b) => (
                          <div key={b} className="admin-multiplier-item">
                            <label>{b}% Health</label>
                            <input
                              type="number"
                              value={formData.batteryDeductions[b]}
                              onChange={(e) => handleNestedChange('batteryDeductions', b, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Screen & Body Deductions (Laptop) */}
                  {(formData.category === 'laptop' || formData.category === 'mac') && (
                    <>
                      <div>
                        <h4 className="admin-section-title">Screen Deductions (Percentage %)</h4>
                        <div className="admin-multiplier-grid">
                          {Object.keys(formData.screenDeductions || {}).map((sd) => (
                            <div key={sd} className="admin-multiplier-item">
                              <label>{sd}</label>
                              <input
                                type="number"
                                value={formData.screenDeductions[sd]}
                                onChange={(e) => handleNestedChange('screenDeductions', sd, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="admin-section-title">Body Assessment Deductions (Percentage %)</h4>
                        <div className="admin-multiplier-grid">
                          {Object.keys(formData.bodyDeductions || {}).map((bd) => (
                            <div key={bd} className="admin-multiplier-item">
                              <label>{bd}</label>
                              <input
                                type="number"
                                value={formData.bodyDeductions[bd]}
                                onChange={(e) => handleNestedChange('bodyDeductions', bd, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="admin-section-title">Dedicated GPU Pricing Bonus (INR)</h4>
                        <div className="admin-multiplier-grid">
                          {Object.keys(formData.dedicatedGpuBonus || {}).map((gpu) => (
                            <div key={gpu} className="admin-multiplier-item">
                              <label>{gpu}</label>
                              <input
                                type="number"
                                value={formData.dedicatedGpuBonus[gpu]}
                                onChange={(e) => handleNestedChange('dedicatedGpuBonus', gpu, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Accessories Bonus */}
                  <div>
                    <h4 className="admin-section-title">Accessories Bonus / Deductions (INR)</h4>
                    <div className="admin-multiplier-grid">
                      {Object.keys(formData.accessoriesBonus || {}).map((acc) => (
                        <div key={acc} className="admin-multiplier-item">
                          <label>{acc}</label>
                          <input
                            type="number"
                            value={formData.accessoriesBonus[acc]}
                            onChange={(e) => handleNestedChange('accessoriesBonus', acc, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="admin-btn admin-btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                >
                  {selectedDevice ? 'Save Changes' : 'Create Device'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
