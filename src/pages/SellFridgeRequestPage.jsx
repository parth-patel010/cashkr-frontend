import { useState } from 'react';
import ChipGroup from '../components/leads/ChipGroup';
import AppliancePhotoUpload from '../components/leads/AppliancePhotoUpload';
import RequestFormShell, { FormSection, TextField } from '../components/leads/RequestFormShell';
import { leadService } from '../services/lead.service';

const BRANDS = ['Samsung', 'LG', 'Whirlpool', 'Godrej', 'Haier', 'Other'];
const TYPES = ['Single door', 'Double door', 'Side-by-side', 'Not sure'];
const AGES = ['Under 2 yrs', '2–5 yrs', '5–8 yrs', '8+ yrs', 'Not sure'];
const CONDITIONS = ['Working well', 'Cools but issues', 'Not cooling / Dead'];

const emptyPhotos = () => ({ front: '', left: '', right: '', back: '' });

export default function SellFridgeRequestPage() {
  const [brand, setBrand] = useState('');
  const [brandOther, setBrandOther] = useState('');
  const [applianceType, setApplianceType] = useState('');
  const [ageBand, setAgeBand] = useState('');
  const [condition, setCondition] = useState('');
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState(emptyPhotos);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [leadId, setLeadId] = useState('');

  const reset = () => {
    setBrand('');
    setBrandOther('');
    setApplianceType('');
    setAgeBand('');
    setCondition('');
    setNote('');
    setPhotos(emptyPhotos());
    setName('');
    setPhone('');
    setCity('');
    setPincode('');
    setAddress('');
    setError('');
    setDone(false);
    setLeadId('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const resolvedBrand = brand === 'Other' ? brandOther.trim() : brand;
    if (!resolvedBrand) {
      setError('Please select a brand');
      return;
    }
    if (!applianceType || !ageBand || !condition) {
      setError('Please complete type, age, and condition');
      return;
    }
    if (!photos.front || !photos.left || !photos.right || !photos.back) {
      setError('Please upload all 4 photos (front, left, right, back)');
      return;
    }
    if (!name.trim() || phone.replace(/\D/g, '').length !== 10) {
      setError('Please enter your name and a valid 10-digit phone');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await leadService.createLead({
        type: 'sell_refrigerator',
        brand: resolvedBrand,
        applianceType,
        ageBand,
        condition,
        note,
        photos,
        name: name.trim(),
        phone,
        city,
        pincode,
        address,
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
      title="Sell your refrigerator"
      subtitle="A few taps and 4 photos — we’ll call you with an offer."
      seoTitle="Sell Old Refrigerator Online | DeviceKart"
      seoDescription="Sell your used refrigerator online. Free doorstep pickup and secure payment with DeviceKart."
      seoPath="/sell/refrigerator"
      done={done}
      leadId={leadId}
      onReset={reset}
    >
      <form onSubmit={handleSubmit} className="space-y-7">
        <FormSection step={1} title="Brand">
          <ChipGroup options={BRANDS} value={brand} onChange={setBrand} columns={3} />
          {brand === 'Other' && (
            <div className="mt-3">
              <TextField
                label="Brand name"
                value={brandOther}
                onChange={setBrandOther}
                placeholder="Enter brand"
                required
              />
            </div>
          )}
        </FormSection>

        <FormSection step={2} title="Type">
          <ChipGroup options={TYPES} value={applianceType} onChange={setApplianceType} columns={2} />
        </FormSection>

        <FormSection step={3} title="Age">
          <ChipGroup options={AGES} value={ageBand} onChange={setAgeBand} columns={3} />
        </FormSection>

        <FormSection step={4} title="Condition">
          <ChipGroup options={CONDITIONS} value={condition} onChange={setCondition} columns={1} />
        </FormSection>

        <FormSection step={5} title="Anything else?" hint="Optional">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 500))}
            placeholder="e.g. freezer not working, noise…"
            rows={2}
            className="w-full bg-[#F7F9FC] border border-[#E8EEF5] rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all resize-none"
          />
        </FormSection>

        <FormSection step={6} title="Photos" hint="Front, left, right & back">
          <AppliancePhotoUpload photos={photos} onChange={setPhotos} />
        </FormSection>

        <FormSection step={7} title="Your details">
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
            <TextField label="City" value={city} onChange={setCity} placeholder="City" />
            <TextField
              label="Pincode"
              value={pincode}
              onChange={(v) => setPincode(v.replace(/\D/g, '').slice(0, 6))}
              placeholder="Pincode"
              inputMode="numeric"
              maxLength={6}
            />
            <div className="sm:col-span-2">
              <TextField
                label="Address"
                value={address}
                onChange={setAddress}
                placeholder="Optional — for pickup"
              />
            </div>
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
          {submitting ? 'Submitting…' : 'Get a callback'}
        </button>
      </form>
    </RequestFormShell>
  );
}
