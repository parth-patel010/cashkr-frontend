import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

export default function PincodeBox({ onVerified }) {
  const [pincode, setPincode] = useState('');
  const [checking, setChecking] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [status, setStatus] = useState(null); // { isServiceable: boolean, message: string }
  const [verifiedInfo, setVerifiedInfo] = useState(null); // { code, city, state }

  useEffect(() => {
    const saved = localStorage.getItem('verifiedPincode');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.code) {
          setVerifiedInfo(parsed);
          setStatus({
            isServiceable: true,
            message: `✅ Serviceable: ${parsed.code} (${parsed.city || 'Local Area'})`
          });
          onVerified(true, parsed.code);
        }
      } catch (e) {
        localStorage.removeItem('verifiedPincode');
      }
    }
  }, [onVerified]);

  const handleCheck = async (codeToCheck) => {
    const targetCode = codeToCheck || pincode;
    if (targetCode.length !== 6) return;

    setChecking(true);
    setStatus(null);

    try {
      const res = await fetch(`${API_BASE}/pincodes/check/${targetCode}`);
      const data = await res.json();

      if (res.ok && data.isServiceable) {
        const info = {
          code: targetCode,
          city: data.city || '',
          state: data.state || ''
        };
        localStorage.setItem('verifiedPincode', JSON.stringify(info));
        setVerifiedInfo(info);
        setStatus({
          isServiceable: true,
          message: `✅ Serviceable: ${targetCode} (${data.city || 'Local Area'})`
        });
        onVerified(true, targetCode);
      } else {
        setStatus({
          isServiceable: false,
          message: '❌ Pincode not available — we do not service this area yet.'
        });
        onVerified(false, null);
      }
    } catch (err) {
      setStatus({
        isServiceable: false,
        message: '❌ Could not verify pincode. Please try again.'
      });
      onVerified(false, null);
    } finally {
      setChecking(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setStatus({
        isServiceable: false,
        message: '⚠️ Geolocation is not supported by your browser.'
      });
      return;
    }

    setDetecting(true);
    setStatus(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Nominatim free reverse geocoding
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const postcode = data.address?.postcode;

          if (postcode && postcode.replace(/\D/g, '').length === 6) {
            const cleanPostcode = postcode.replace(/\D/g, '');
            setPincode(cleanPostcode);
            // Auto check detected postcode
            await handleCheck(cleanPostcode);
          } else {
            setStatus({
              isServiceable: false,
              message: '⚠️ Could not detect a valid 6-digit pincode from your location. Please enter manually.'
            });
          }
        } catch (err) {
          setStatus({
            isServiceable: false,
            message: '⚠️ Error auto-detecting location. Please enter pincode manually.'
          });
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setStatus({
          isServiceable: false,
          message: '⚠️ Geolocation permission denied or unavailable. Please enter pincode manually.'
        });
        setDetecting(false);
      },
      { timeout: 10000 }
    );
  };

  const handleClear = () => {
    localStorage.removeItem('verifiedPincode');
    setVerifiedInfo(null);
    setPincode('');
    setStatus(null);
    onVerified(false, null);
  };

  if (verifiedInfo) {
    return (
      <div className="bg-[#DCFCE7] border border-[#BBF7D0] rounded-[24px] p-6 mb-6 flex justify-between items-center shadow-sm">
        <div>
          <p className="text-xs font-black text-[#166534] uppercase tracking-wider mb-1">Service Area Confirmed</p>
          <p className="text-base font-black text-[#166534]">{verifiedInfo.code} ({verifiedInfo.city || 'Local Area'})</p>
        </div>
        <button
          onClick={handleClear}
          className="text-xs font-bold text-[#166534] bg-white border border-[#BBF7D0] px-4 py-2 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-[28px] p-6 mb-6 space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <label className="text-xs font-black uppercase tracking-wider text-gray-500">Enter Pickup Pincode</label>
        <button
          type="button"
          onClick={handleDetectLocation}
          className="text-xs font-black text-[#0565E6] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
          disabled={detecting || checking}
        >
          {detecting ? (
            <span className="flex items-center gap-1">
              <svg className="animate-spin h-3.5 w-3.5 text-[#0565E6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Detecting...
            </span>
          ) : (
            'Use Current Location'
          )}
        </button>
      </div>

      <div className="flex gap-3">
        <input
          type="tel"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="e.g. 400001"
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-sans outline-none focus:border-[#0565E6] bg-white transition-all text-center tracking-widest font-black"
          disabled={detecting || checking}
        />
        <button
          type="button"
          onClick={() => handleCheck()}
          className="px-6 py-3 bg-[#0565E6] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#044ab8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={pincode.length !== 6 || checking || detecting}
        >
          {checking ? 'Checking...' : 'Check'}
        </button>
      </div>

      {status && (
        <p className={`text-xs font-bold ${status.isServiceable ? 'text-green-600' : 'text-red-500'}`}>
          {status.message}
        </p>
      )}
    </div>
  );
}
