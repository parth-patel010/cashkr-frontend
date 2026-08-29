import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  getLaptopProcessorOptions,
  MASTER_RAM,
  MASTER_STORAGE,
} from '../../utils/laptopSpecs';
import {
  LAPTOP_STEPS,
  LAPTOP_AGE_OPTIONS,
  LAPTOP_SCREEN_SIZE_OPTIONS,
  LAPTOP_FUNCTIONAL_OPTIONS,
  LAPTOP_SCREEN_OPTIONS,
  LAPTOP_BODY_OPTIONS,
  LAPTOP_ACCESSORY_OPTIONS,
  DEFAULT_LAPTOP_QUIZ,
} from '../../data/quiz/laptopQuiz';
import {
  MOBILE_STEPS,
  MOBILE_ACCESSORIES,
  MOBILE_PHYSICAL_ISSUES,
  MOBILE_TECHNICAL_ISSUES,
  MOBILE_AGE_OPTIONS,
  DEFAULT_MOBILE_QUIZ,
  supportsESIM,
} from '../../data/quiz/mobileQuiz';
import './admin.css';

const STATUS_LABELS = {
  connected: 'Cashify connected',
  disconnected: 'Disconnected',
  authentication_required: 'Auth required',
  otp_sent: 'OTP sent',
  error: 'Error',
};

function toggleInList(list, id) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export default function AdminValuationTest() {
  const [category, setCategory] = useState('laptop');
  const [modelSummary, setModelSummary] = useState(null);
  const [brand, setBrand] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [laptopQuiz, setLaptopQuiz] = useState({ ...DEFAULT_LAPTOP_QUIZ });
  const [mobileQuiz, setMobileQuiz] = useState({ ...DEFAULT_MOBILE_QUIZ });
  const [quoteResult, setQuoteResult] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  const [cashifyStatus, setCashifyStatus] = useState({ status: 'disconnected' });
  const [authOpen, setAuthOpen] = useState(false);
  const [authStep, setAuthStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  const [lastRuns, setLastRuns] = useState([]);
  const [lastRunLoading, setLastRunLoading] = useState(false);
  const [showLastRun, setShowLastRun] = useState(false);
  const [expandedRunId, setExpandedRunId] = useState(null);

  const steps = category === 'mobile' ? MOBILE_STEPS : LAPTOP_STEPS;
  const currentStep = steps[stepIndex];

  const laptopProcessorOptions = useMemo(
    () => getLaptopProcessorOptions(selectedDevice),
    [selectedDevice],
  );

  const laptopRamOptions = useMemo(() => {
    const fromVariants = (selectedDevice?.variants || []).map((v) => v.ram).filter(Boolean);
    return [...new Set([...MASTER_RAM, ...fromVariants])];
  }, [selectedDevice]);

  const laptopStorageOptions = useMemo(() => {
    const fromVariants = (selectedDevice?.variants || []).map((v) => v.storage).filter(Boolean);
    return [...new Set([...MASTER_STORAGE, ...fromVariants])];
  }, [selectedDevice]);

  const brandOptions = useMemo(() => {
    if (!modelSummary?.[category]?.brands) return [];
    return modelSummary[category].brands;
  }, [modelSummary, category]);

  const refreshCashifyStatus = useCallback(async (verify = false) => {
    try {
      const { data } = verify
        ? await adminService.valuationVerifyCashifySession()
        : await adminService.valuationCashifyStatus();
      setCashifyStatus(data);
    } catch {
      setCashifyStatus({ status: 'disconnected' });
    }
  }, []);

  useEffect(() => {
    adminService.getValuationTestModels().then(({ data }) => setModelSummary(data)).catch(console.error);
    refreshCashifyStatus(false);
  }, [refreshCashifyStatus]);

  useEffect(() => {
    if (!brand) {
      setDevices([]);
      setSelectedSlug('');
      setSelectedDevice(null);
      return;
    }
    adminService.getValuationTestDevices({ category, brand }).then(({ data }) => {
      setDevices(data.devices || []);
      setSelectedSlug('');
      setSelectedDevice(null);
    }).catch(console.error);
  }, [category, brand]);

  useEffect(() => {
    const device = devices.find((d) => d.slug === selectedSlug) || null;
    setSelectedDevice(device);
    setStepIndex(0);
    setQuoteResult(null);
    setQuoteError('');
    if (device) {
      const firstVariant = device.variants?.[0];
      const processors = getLaptopProcessorOptions(device);
      if (category === 'laptop') {
        setLaptopQuiz({
          ...DEFAULT_LAPTOP_QUIZ,
          processor: processors.includes(firstVariant?.processor) ? firstVariant.processor : (processors[0] || ''),
          ram: MASTER_RAM.includes(firstVariant?.ram) ? firstVariant.ram : (MASTER_RAM[2] || '8GB'),
          storage: MASTER_STORAGE.includes(firstVariant?.storage) ? firstVariant.storage : (MASTER_STORAGE.find((s) => s.includes('512 GB SSD')) || MASTER_STORAGE[0] || ''),
        });
      } else {
        setMobileQuiz({
          ...DEFAULT_MOBILE_QUIZ,
          storage: firstVariant?.storage || '',
          eSIMSupport: supportsESIM(device.modelName) ? null : 'physical+esim',
        });
      }
    }
  }, [selectedSlug, devices, category]);

  const onCategoryChange = (next) => {
    setCategory(next);
    setBrand('');
    setDevices([]);
    setSelectedSlug('');
    setSelectedDevice(null);
    setStepIndex(0);
    setQuoteResult(null);
    setQuoteError('');
  };

  const buildQuotePayload = () => {
    if (!selectedDevice) throw new Error('Select a device first.');
    if (category === 'laptop') {
      return {
        slug: selectedDevice.slug,
        ...laptopQuiz,
        yearBracket: laptopQuiz.age,
        functionalIssues: laptopQuiz.issuesList,
        screenIssues: laptopQuiz.screenIssuesList,
        bodyIssues: laptopQuiz.bodyIssuesList,
        hasGpu: laptopQuiz.hasGpu === 'yes',
        isGpuWorking: laptopQuiz.hasGpu === 'yes' ? laptopQuiz.isGpuWorking === 'yes' : false,
      };
    }
    return {
      slug: selectedDevice.slug,
      ...mobileQuiz,
      accessories: mobileQuiz.accessories,
    };
  };

  const runQuote = async () => {
    setQuoteError('');
    setQuoteLoading(true);
    try {
      const payload = buildQuotePayload();
      const { data } = await adminService.runValuationTestQuote(payload);
      setQuoteResult(data);
      if (showLastRun) loadAllRuns(false);
    } catch (err) {
      setQuoteError(err.response?.data?.error || err.message || 'Quote failed');
    } finally {
      setQuoteLoading(false);
    }
  };

  const loadAllRuns = async (toggleShow = true) => {
    setLastRunLoading(true);
    try {
      const { data } = await adminService.getValuationLastRun();
      setLastRuns(data.runs || []);
      if (toggleShow) setShowLastRun(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Could not load agent test runs');
    } finally {
      setLastRunLoading(false);
    }
  };

  const downloadAllRuns = async () => {
    try {
      const response = await adminService.downloadValuationLastRun();
      const blob = new Blob(
        [response.data],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = response.headers['content-disposition'] || '';
      const match = disposition.match(/filename="(.+)"/);
      a.download = match?.[1] || 'agent-test-runs.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.error || 'Download failed');
    }
  };

  const sendOtp = async () => {
    setAuthError('');
    if (!/^\d{10}$/.test(phone.trim())) {
      setAuthError('Enter a valid 10-digit mobile number.');
      return;
    }
    setAuthBusy(true);
    try {
      await adminService.valuationRequestOtp({ phone: phone.trim() });
      setAuthStep('otp');
      await refreshCashifyStatus(false);
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Failed to request OTP');
    } finally {
      setAuthBusy(false);
    }
  };

  const verifyOtp = async () => {
    setAuthError('');
    if (!otp.trim()) {
      setAuthError('Enter the OTP.');
      return;
    }
    setAuthBusy(true);
    try {
      await adminService.valuationVerifyOtp({ otp: otp.trim() });
      await refreshCashifyStatus(false);
      setAuthOpen(false);
      setAuthStep('phone');
      setOtp('');
    } catch (err) {
      setAuthError(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setAuthBusy(false);
    }
  };

  const logoutCashify = async () => {
    try {
      await adminService.valuationCashifyLogout();
      await refreshCashifyStatus(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Logout failed');
    }
  };

  const renderLaptopStep = () => {
    switch (currentStep?.id) {
      case 'specs':
        return (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Full spec lists match the customer laptop quiz (not limited to catalog variants).</p>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="block">
                <span className="text-sm text-gray-600">Processor</span>
                <select
                  className="admin-input mt-1 w-full"
                  value={laptopQuiz.processor}
                  onChange={(e) => setLaptopQuiz({ ...laptopQuiz, processor: e.target.value })}
                >
                  <option value="">Select processor</option>
                  {laptopProcessorOptions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">RAM</span>
                <select
                  className="admin-input mt-1 w-full"
                  value={laptopQuiz.ram}
                  onChange={(e) => setLaptopQuiz({ ...laptopQuiz, ram: e.target.value })}
                >
                  <option value="">Select RAM</option>
                  {laptopRamOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">Storage</span>
                <select
                  className="admin-input mt-1 w-full"
                  value={laptopQuiz.storage}
                  onChange={(e) => setLaptopQuiz({ ...laptopQuiz, storage: e.target.value })}
                >
                  <option value="">Select storage</option>
                  {laptopStorageOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        );
      case 'power':
        return (
          <div className="flex gap-3">
            {['on', 'off'].map((val) => (
              <button key={val} type="button" className={`admin-btn ${laptopQuiz.powerStatus === val ? 'admin-btn-primary' : ''}`} onClick={() => setLaptopQuiz({ ...laptopQuiz, powerStatus: val })}>
                {val === 'on' ? 'Powers on' : 'Does not power on'}
              </button>
            ))}
          </div>
        );
      case 'screenSize':
        return (
          <div className="space-y-4">
            <div className="grid gap-2 md:grid-cols-2">
              {LAPTOP_SCREEN_SIZE_OPTIONS.map((opt) => (
                <button key={opt.key} type="button" className={`admin-btn ${laptopQuiz.screenSize === opt.key ? 'admin-btn-primary' : ''}`} onClick={() => setLaptopQuiz({ ...laptopQuiz, screenSize: opt.key })}>
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              {['yes', 'no'].map((val) => (
                <button key={val} type="button" className={`admin-btn ${laptopQuiz.hasGpu === val ? 'admin-btn-primary' : ''}`} onClick={() => setLaptopQuiz({ ...laptopQuiz, hasGpu: val, isGpuWorking: val === 'no' ? null : laptopQuiz.isGpuWorking })}>
                  {val === 'yes' ? 'Has dedicated GPU' : 'No dedicated GPU'}
                </button>
              ))}
            </div>
            {laptopQuiz.hasGpu === 'yes' && (
              <div className="flex gap-3">
                {['yes', 'no'].map((val) => (
                  <button key={val} type="button" className={`admin-btn ${laptopQuiz.isGpuWorking === val ? 'admin-btn-primary' : ''}`} onClick={() => setLaptopQuiz({ ...laptopQuiz, isGpuWorking: val })}>
                    GPU {val === 'yes' ? 'working' : 'not working'}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      case 'functional':
        return (
          <div className="grid gap-2 md:grid-cols-2">
            {LAPTOP_FUNCTIONAL_OPTIONS.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={laptopQuiz.issuesList.includes(opt.id)} onChange={() => setLaptopQuiz({ ...laptopQuiz, issuesList: toggleInList(laptopQuiz.issuesList, opt.id) })} />
                {opt.label}
              </label>
            ))}
          </div>
        );
      case 'screen':
        return (
          <div className="grid gap-2">
            {LAPTOP_SCREEN_OPTIONS.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={laptopQuiz.screenIssuesList.includes(opt.id)} onChange={() => setLaptopQuiz({ ...laptopQuiz, screenIssuesList: toggleInList(laptopQuiz.screenIssuesList, opt.id) })} />
                {opt.label}
              </label>
            ))}
          </div>
        );
      case 'body':
        return (
          <div className="grid gap-2 md:grid-cols-2">
            {LAPTOP_BODY_OPTIONS.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={laptopQuiz.bodyIssuesList.includes(opt.id)} onChange={() => setLaptopQuiz({ ...laptopQuiz, bodyIssuesList: toggleInList(laptopQuiz.bodyIssuesList, opt.id) })} />
                {opt.label}
              </label>
            ))}
          </div>
        );
      case 'accessories':
        return (
          <div className="grid gap-2">
            {LAPTOP_ACCESSORY_OPTIONS.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={laptopQuiz.accessories.includes(opt.id)} onChange={() => setLaptopQuiz({ ...laptopQuiz, accessories: toggleInList(laptopQuiz.accessories, opt.id) })} />
                {opt.label}
              </label>
            ))}
          </div>
        );
      case 'age':
        return (
          <div className="grid gap-2">
            {LAPTOP_AGE_OPTIONS.map((opt) => (
              <button key={opt.key} type="button" className={`admin-btn ${laptopQuiz.age === opt.key ? 'admin-btn-primary' : ''}`} onClick={() => setLaptopQuiz({ ...laptopQuiz, age: opt.key })}>
                {opt.label}
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const renderMobileStep = () => {
    switch (currentStep?.id) {
      case 'warranty':
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              {MOBILE_AGE_OPTIONS.map((age) => (
                <button key={age} type="button" className={`admin-btn ${mobileQuiz.deviceAge === age ? 'admin-btn-primary' : ''}`} onClick={() => setMobileQuiz({ ...mobileQuiz, deviceAge: age, underWarranty: age === 'Above 11 Months' ? false : mobileQuiz.underWarranty })}>
                  {age}
                </button>
              ))}
            </div>
            {mobileQuiz.deviceAge !== 'Above 11 Months' && (
              <div className="flex gap-3">
                <button type="button" className={`admin-btn ${mobileQuiz.underWarranty ? 'admin-btn-primary' : ''}`} onClick={() => setMobileQuiz({ ...mobileQuiz, underWarranty: true })}>Under warranty</button>
                <button type="button" className={`admin-btn ${mobileQuiz.underWarranty === false ? 'admin-btn-primary' : ''}`} onClick={() => setMobileQuiz({ ...mobileQuiz, underWarranty: false })}>Out of warranty</button>
              </div>
            )}
            {selectedDevice && supportsESIM(selectedDevice.modelName) && (
              <div className="flex gap-3">
                <button type="button" className={`admin-btn ${mobileQuiz.eSIMSupport === 'physical+esim' ? 'admin-btn-primary' : ''}`} onClick={() => setMobileQuiz({ ...mobileQuiz, eSIMSupport: 'physical+esim' })}>Physical + eSIM</button>
                <button type="button" className={`admin-btn ${mobileQuiz.eSIMSupport === 'esim_only_global' ? 'admin-btn-primary' : ''}`} onClick={() => setMobileQuiz({ ...mobileQuiz, eSIMSupport: 'esim_only_global' })}>eSIM only (Global)</button>
              </div>
            )}
          </div>
        );
      case 'screen':
        return (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={mobileQuiz.ableToMakeCalls} onChange={(e) => setMobileQuiz({ ...mobileQuiz, ableToMakeCalls: e.target.checked })} /> Able to make calls</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={mobileQuiz.isTouchScreenWorking} onChange={(e) => setMobileQuiz({ ...mobileQuiz, isTouchScreenWorking: e.target.checked })} /> Touch screen working</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={mobileQuiz.isScreenOriginal} onChange={(e) => setMobileQuiz({ ...mobileQuiz, isScreenOriginal: e.target.checked })} /> Screen is original</label>
          </div>
        );
      case 'physical':
        return (
          <div className="grid gap-2">
            {MOBILE_PHYSICAL_ISSUES.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={mobileQuiz.physicalIssues.includes(opt.id)} onChange={() => setMobileQuiz({ ...mobileQuiz, physicalIssues: toggleInList(mobileQuiz.physicalIssues, opt.id) })} />
                {opt.label}
              </label>
            ))}
          </div>
        );
      case 'technical':
        return (
          <div className="grid gap-2 md:grid-cols-2">
            {MOBILE_TECHNICAL_ISSUES.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={mobileQuiz.technicalIssues.includes(opt.id)} onChange={() => setMobileQuiz({ ...mobileQuiz, technicalIssues: toggleInList(mobileQuiz.technicalIssues, opt.id) })} />
                {opt.label}
              </label>
            ))}
          </div>
        );
      case 'accessories':
        return (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-gray-600">Storage variant</span>
              <select className="admin-input mt-1 w-full" value={mobileQuiz.storage} onChange={(e) => setMobileQuiz({ ...mobileQuiz, storage: e.target.value })}>
                {(selectedDevice?.variants || []).map((v) => (
                  <option key={v.storage} value={v.storage}>{v.storage}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-2">
              {MOBILE_ACCESSORIES.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={mobileQuiz.accessories.includes(opt.id)} onChange={() => setMobileQuiz({ ...mobileQuiz, accessories: toggleInList(mobileQuiz.accessories, opt.id) })} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-page space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Valuation Test (Cashify Agent)</h2>
        <p className="text-gray-600 mt-1">Admin-only sandbox to compare internal pricing vs live Cashify automation.</p>
      </div>

      <div className="admin-stat-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-gray-500">Cashify session</div>
            <div className="font-semibold">{STATUS_LABELS[cashifyStatus.status] || cashifyStatus.status}</div>
            <div className="text-xs text-gray-500 mt-1">
              {[cashifyStatus.phoneMasked, cashifyStatus.lastError].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div className="flex gap-2">
            {cashifyStatus.status !== 'connected' ? (
              <button type="button" className="admin-btn admin-btn-primary" onClick={() => { setAuthOpen(true); setAuthStep('phone'); setAuthError(''); }}>Connect Cashify</button>
            ) : (
              <button type="button" className="admin-btn" onClick={logoutCashify}>Logout Cashify</button>
            )}
            <button type="button" className="admin-btn" onClick={() => refreshCashifyStatus(true)}>Verify session</button>
          </div>
        </div>
      </div>

      <div className="admin-stat-card space-y-4">
        <div className="flex gap-2">
          {['laptop', 'mobile'].map((cat) => (
            <button key={cat} type="button" className={`admin-btn ${category === cat ? 'admin-btn-primary' : ''}`} onClick={() => onCategoryChange(cat)}>
              {cat === 'laptop' ? 'Laptops' : 'Mobiles'} ({modelSummary?.[cat]?.count ?? '…'})
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm text-gray-600">Brand</span>
            <select className="admin-input mt-1 w-full" value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">Select brand</option>
              {brandOptions.map((b) => (
                <option key={b.brand} value={b.brand}>{b.brand} ({b.count})</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Model</span>
            <select className="admin-input mt-1 w-full" value={selectedSlug} onChange={(e) => setSelectedSlug(e.target.value)} disabled={!brand}>
              <option value="">Select model</option>
              {devices.map((d) => (
                <option key={d.slug} value={d.slug}>{d.modelName}</option>
              ))}
            </select>
          </label>
        </div>

        {selectedDevice && (
          <>
            <div className="text-sm text-gray-600">
              Selected: <strong>{selectedDevice.brand} {selectedDevice.modelName}</strong> ({selectedDevice.slug})
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {steps.map((step, idx) => (
                  <button key={step.id} type="button" className={`admin-btn text-xs ${idx === stepIndex ? 'admin-btn-primary' : ''}`} onClick={() => setStepIndex(idx)}>
                    {idx + 1}. {step.label}
                  </button>
                ))}
              </div>
              <div>
                <h3 className="font-semibold mb-3">{currentStep?.label}</h3>
                {category === 'laptop' ? renderLaptopStep() : renderMobileStep()}
              </div>
              <div className="flex gap-2">
                <button type="button" className="admin-btn" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => Math.max(0, i - 1))}>Back</button>
                <button type="button" className="admin-btn" disabled={stepIndex >= steps.length - 1} onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}>Next</button>
              </div>
            </div>

            <button type="button" className="admin-btn admin-btn-primary" disabled={quoteLoading} onClick={runQuote}>
              {quoteLoading ? 'Running agent…' : 'Check pricing'}
            </button>
            {quoteError && <p className="text-red-600 text-sm">{quoteError}</p>}
          </>
        )}
      </div>

      {quoteResult && (
        <div className="admin-stat-card">
          <h3 className="font-semibold mb-3">Comparison result</h3>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <tbody>
                <tr><td>DeviceKart internal</td><td>{formatCurrency(quoteResult.comparison?.internalPrice)}</td></tr>
                <tr><td>Cashify live</td><td>{quoteResult.cashifyResult?.cashifyPrice != null ? formatCurrency(quoteResult.cashifyResult.cashifyPrice) : (quoteResult.cashifyResult?.message || quoteResult.cashifyResult?.error || '—')}</td></tr>
                {quoteResult.cashifyResult?.productUrl && (
                  <tr><td>Cashify URL</td><td className="text-xs break-all">{quoteResult.cashifyResult.productUrl}</td></tr>
                )}
                <tr><td>Our offer (bracket %)</td><td>{quoteResult.comparison?.ourOffer != null ? formatCurrency(quoteResult.comparison.ourOffer) : '—'}</td></tr>
                <tr><td>Difference (internal − our offer)</td><td>{quoteResult.comparison?.difference != null ? formatCurrency(quoteResult.comparison.difference) : '—'}</td></tr>
                <tr><td>Status</td><td>{quoteResult.status}</td></tr>
                <tr><td>Duration</td><td>{quoteResult.durationMs} ms</td></tr>
              </tbody>
            </table>
          </div>
          {quoteResult.cashifyResult?.note && <p className="text-sm text-amber-700 mt-2">{quoteResult.cashifyResult.note}</p>}
        </div>
      )}

      <div className="admin-stat-card space-y-3">
        <h3 className="font-semibold">Agent test runs</h3>
        <div className="flex gap-2">
          <button type="button" className="admin-btn admin-btn-primary" disabled={lastRunLoading} onClick={() => loadAllRuns(true)}>
            {lastRunLoading ? 'Loading…' : 'Show all runs'}
          </button>
          <button type="button" className="admin-btn" onClick={downloadAllRuns}>Download Excel</button>
        </div>
        {showLastRun && lastRuns.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table text-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Device</th>
                  <th>Category</th>
                  <th>Internal</th>
                  <th>Cashify</th>
                  <th>Our offer</th>
                  <th>Difference</th>
                  <th>Status</th>
                  <th>Run by</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lastRuns.map((run) => (
                  <Fragment key={run.id}>
                    <tr>
                      <td>{new Date(run.createdAt).toLocaleString()}</td>
                      <td>{run.brand} {run.modelName}</td>
                      <td>{run.category}</td>
                      <td>{formatCurrency(run.comparison?.internalPrice)}</td>
                      <td>{run.comparison?.cashifyPrice != null ? formatCurrency(run.comparison.cashifyPrice) : '—'}</td>
                      <td>{run.comparison?.ourOffer != null ? formatCurrency(run.comparison.ourOffer) : '—'}</td>
                      <td>{run.comparison?.difference != null ? formatCurrency(run.comparison.difference) : '—'}</td>
                      <td>{run.status}</td>
                      <td>{run.runBy || '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn text-xs"
                          onClick={() => setExpandedRunId((id) => (id === run.id ? null : run.id))}
                        >
                          {expandedRunId === run.id ? 'Hide' : 'Details'}
                        </button>
                      </td>
                    </tr>
                    {expandedRunId === run.id && (
                      <tr>
                        <td colSpan={10} className="bg-gray-50">
                          <div className="space-y-2 p-2 text-xs">
                            <div>Duration: {run.durationMs} ms · Slug: {run.slug}</div>
                            {run.cashifyResult?.productUrl && (
                              <div className="break-all">Cashify URL: {run.cashifyResult.productUrl}</div>
                            )}
                            {run.error && <div className="text-red-600">Error: {run.error}</div>}
                            {run.cashifyResult?.note && <div className="text-amber-700">Note: {run.cashifyResult.note}</div>}
                            <pre className="overflow-auto max-h-48 bg-white p-3 rounded border">{JSON.stringify(run.quizPayload, null, 2)}</pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {showLastRun && lastRuns.length === 0 && <p className="text-sm text-gray-500">No agent test runs yet.</p>}
      </div>

      {authOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setAuthOpen(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">{authStep === 'phone' ? 'Connect Cashify' : 'Enter OTP'}</h3>
            {authStep === 'phone' ? (
              <>
                <input className="admin-input w-full" placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <button type="button" className="admin-btn admin-btn-primary w-full" disabled={authBusy} onClick={sendOtp}>Send OTP</button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600">OTP sent to +91 {phone}. Enter the code from SMS.</p>
                <input className="admin-input w-full" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <button type="button" className="admin-btn admin-btn-primary w-full" disabled={authBusy} onClick={verifyOtp}>Verify OTP</button>
                <button type="button" className="admin-btn w-full" onClick={() => { setAuthStep('phone'); setAuthError(''); }}>Back</button>
              </>
            )}
            {authError && <p className="text-red-600 text-sm">{authError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
