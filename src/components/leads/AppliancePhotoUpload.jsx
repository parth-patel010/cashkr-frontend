import { useRef, useState } from 'react';
import { Camera, RefreshCw, Loader2 } from 'lucide-react';
import { leadService } from '../../services/lead.service';

const ANGLES = [
  { key: 'front', label: 'Front' },
  { key: 'left', label: 'Left' },
  { key: 'right', label: 'Right' },
  { key: 'back', label: 'Back' },
];

export default function AppliancePhotoUpload({ photos, onChange }) {
  const [uploading, setUploading] = useState({});
  const [errors, setErrors] = useState({});
  const inputRefs = useRef({});

  const handleFile = async (key, file) => {
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      setErrors((e) => ({ ...e, [key]: 'Please choose an image' }));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrors((e) => ({ ...e, [key]: 'Max 8MB' }));
      return;
    }

    setErrors((e) => ({ ...e, [key]: '' }));
    setUploading((u) => ({ ...u, [key]: true }));
    try {
      const { data } = await leadService.uploadPhoto(file);
      const url = data.url || data.path;
      onChange({ ...photos, [key]: url });
    } catch (err) {
      setErrors((e) => ({
        ...e,
        [key]: err.response?.data?.message || 'Upload failed',
      }));
    } finally {
      setUploading((u) => ({ ...u, [key]: false }));
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {ANGLES.map(({ key, label }) => {
        const url = photos?.[key];
        const busy = uploading[key];
        return (
          <div key={key} className="space-y-1.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRefs.current[key]?.click()}
              className={`relative w-full aspect-[4/3] rounded-2xl border-2 border-dashed overflow-hidden transition-all
                ${url ? 'border-primary bg-primary-light/30' : 'border-[#D7E2EF] bg-[#F7F9FC] hover:border-primary/40'}
                ${busy ? 'opacity-70' : ''}`}
            >
              {url ? (
                <img src={url} alt={label} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                  {busy ? <Loader2 className="animate-spin" size={22} /> : <Camera size={22} />}
                  <span className="text-xs font-extrabold uppercase tracking-wider">{label}</span>
                </div>
              )}
              {url && !busy && (
                <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-white/95 text-primary text-[10px] font-extrabold px-2 py-1 rounded-full shadow-sm">
                  <RefreshCw size={10} /> Replace
                </span>
              )}
              {busy && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                  <Loader2 className="animate-spin text-primary" size={22} />
                </div>
              )}
            </button>
            <p className="text-[11px] font-bold text-center text-gray-500">{label}</p>
            {errors[key] ? (
              <p className="text-[11px] font-bold text-center text-red-500">{errors[key]}</p>
            ) : null}
            <input
              ref={(el) => {
                inputRefs.current[key] = el;
              }}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                handleFile(key, file);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
