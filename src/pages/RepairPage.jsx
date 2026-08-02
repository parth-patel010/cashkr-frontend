import { useState } from 'react';
import ChipGroup from '../components/leads/ChipGroup';
import RequestFormShell, { FormSection, TextField } from '../components/leads/RequestFormShell';
import { leadService } from '../services/lead.service';

const DEVICES = ['Phone', 'Tablet', 'Laptop', 'Earbuds', 'Watch', 'Other'];
const PHONE_BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Vivo', 'Other'];
const ISSUES = [
  'Screen',
  'Battery',
  'Charging',
  'Speaker',
  'Software',
  'Water damage',
  'Other',
];
const SLOTS = ['Morning', 'Afternoon', 'Evening'];

export default function RepairPage() {
  const [deviceCategory, setDeviceCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [brandOther, setBrandOther] = useState('');
  const [modelName, setModelName] = useState('');
  const [issues, setIssues] = useState([]);
  const [note, setNote] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('Morning');
  const [preferredDate, setPreferredDate] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [leadId, setLeadId] = useState('');

  const reset = () => {
    setDeviceCategory('');
    setBrand('');
    setBrandOther('');
    setModelName('');
    setIssues([]);
    setNote('');
    setPreferredSlot('Morning');
    setPreferredDate('');
    setName('');
    setPhone('');
    setAddress('');
    setPincode('');
    setCity('');
    setError('');
    setDone(false);
    setLeadId('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!deviceCategory) {
      setError('Please select a device type');
      return;
    }

    const resolvedBrand =
      deviceCategory === 'Phone' && brand
        ? brand === 'Other'
          ? brandOther.trim()
          : brand
        : brandOther.trim() || brand.trim();

    if (!issues.length && !note.trim()) {
      setError('Select what to repair or add a short note');
      return;
    }
    if (!name.trim() || phone.replace(/\D/g, '').length !== 10) {
      setError('Please enter your name and a valid 10-digit phone');
      return;
    }
    if (!address.trim() || pincode.replace(/\D/g, '').length !== 6) {
      setError('Please enter pickup address and 6-digit pincode');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await leadService.createLead({
        type: 'repair',
        deviceCategory,
        brand: resolvedBrand,
        modelName: modelName.trim(),
        issues,
        note,
        preferredSlot,
        preferredDate,
        name: name.trim(),
        phone,
        address,
        pincode,
        city,
      });
      setLeadId(data.leadId || '');
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RequestFormShell
      title="Book a repair"
      subtitle="Tell us what’s broken — no prices here. We’ll confirm details on the call."
      seoTitle="Device Repair Pickup | DeviceKart"
      seoDescription="Request phone, laptop and gadget repair with free doorstep pickup. DeviceKart will call to confirm."
      seoPath="/repair"
      done={done}
      leadId={leadId}
      onReset={reset}
    >
      <form onSubmit={handleSubmit} className="space-y-7">
        <FormSection step={1} title="What device?">
          <ChipGroup
            options={DEVICES}
            value={deviceCategory}
            onChange={(v) => {
              setDeviceCategory(v);
              setBrand('');
              setBrandOther('');
            }}
            columns={3}
          />
        </FormSection>

        <FormSection step={2} title="Brand & model" hint="As much as you know is fine">
          {deviceCategory === 'Phone' ? (
            <div className="space-y-3">
              <ChipGroup options={PHONE_BRANDS} value={brand} onChange={setBrand} columns={3} />
              {brand === 'Other' && (
                <TextField
                  label="Brand"
                  value={brandOther}
                  onChange={setBrandOther}
                  placeholder="Brand name"
                />
              )}
            </div>
          ) : (
            <TextField
              label="Brand"
              value={brandOther}
              onChange={setBrandOther}
              placeholder="e.g. Apple, Dell, Sony"
            />
          )}
          <div className="mt-3">
            <TextField
              label="Model"
              value={modelName}
              onChange={setModelName}
              placeholder="e.g. iPhone 13, Pavilion 15"
            />
          </div>
        </FormSection>

        <FormSection step={3} title="What to repair?" hint="Select all that apply">
          <ChipGroup options={ISSUES} value={issues} onChange={setIssues} multi columns={2} />
          <div className="mt-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              placeholder="Short description (optional unless you picked Other)"
              rows={2}
              className="w-full bg-[#F7F9FC] border border-[#E8EEF5] rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all resize-none"
            />
          </div>
        </FormSection>

        <FormSection step={4} title="Preferred pickup time">
          <ChipGroup options={SLOTS} value={preferredSlot} onChange={setPreferredSlot} columns={3} />
          <div className="mt-3">
            <TextField
              label="Preferred date"
              type="date"
              value={preferredDate}
              onChange={setPreferredDate}
            />
          </div>
        </FormSection>

        <FormSection step={5} title="Contact & pickup address">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Name" value={name} onChange={setName} placeholder="Your name" required />
            <TextField
              label="Phone"
              value={phone}
              onChange={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile"
              inputMode="numeric"
              maxLength={10}
              required
            />
            <div className="sm:col-span-2">
              <TextField
                label="Address"
                value={address}
                onChange={setAddress}
                placeholder="House / street"
                required
              />
            </div>
            <TextField
              label="Pincode"
              value={pincode}
              onChange={(v) => setPincode(v.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit pincode"
              inputMode="numeric"
              maxLength={6}
              required
            />
            <TextField label="City" value={city} onChange={setCity} placeholder="City" />
          </div>
        </FormSection>

        {error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl px-4 py-3">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-white font-extrabold py-4 rounded-xl hover:bg-primary-dark transition-all shadow-[0_4px_14px_rgba(5,101,230,0.25)] disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Request repair callback'}
        </button>
      </form>
    </RequestFormShell>
  );
}
