import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import SEOHead from "../components/seo/SEOHead";

// ─── Icons ────────────────────────────────────────────────────────────────────

const PhoneIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// ─── Step 1: Phone Number ─────────────────────────────────────────────────────

function PhoneStep({ onNext, loading, error }) {
  const [phone, setPhone] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone.trim().length === 10) onNext(phone.trim());
  };

  return (
    <>
      <div className="inline-flex items-center gap-2 bg-[#0565E6]/5 text-[#0565E6] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-6 border border-gray-100">
        <div className="w-1.5 h-1.5 bg-[#0565E6] rounded-full" />
        Welcome Back
      </div>

      <h1 className="text-3xl font-black text-text-primary tracking-tight mb-2">Login</h1>
      <p className="text-sm text-text-muted mb-8">Enter your phone number to receive a one-time password.</p>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold mb-6 animate-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs sm:text-sm font-bold text-gray-700 mb-1.5 ml-1 block">Phone Number</label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-gray-400 flex pointer-events-none">
              <PhoneIcon />
            </span>
            <span className="absolute left-11 text-sm font-bold text-gray-500 pointer-events-none select-none">+91</span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              autoComplete="tel"
              className="w-full pl-[4.5rem] pr-4 py-3 border-[1.5px] border-gray-200 rounded-xl text-sm font-sans text-text-primary outline-none bg-gray-50 focus:border-[#0565E6] focus:ring-4 focus:ring-[#0565E6]/10 focus:bg-white transition-all tracking-widest"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={phone.length !== 10 || loading}
          className="w-full bg-[#0565E6] hover:bg-[#0452B9] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#0565E6]/30 hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
          {!loading && <ArrowRightIcon />}
        </button>
      </form>
    </>
  );
}

// ─── Step 2: OTP Entry ────────────────────────────────────────────────────────

function OtpStep({ phone, onVerify, onBack, loading, error, onResend }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = ["", "", "", "", "", ""];
    pasted.split("").forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    const lastFilled = Math.min(pasted.length, 5);
    const el = document.getElementById(`otp-${lastFilled}`);
    if (el) el.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === 6) onVerify(code);
  };

  const maskedPhone = `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;

  return (
    <>
      <div className="inline-flex items-center gap-2 bg-[#0565E6]/5 text-[#0565E6] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-6 border border-gray-100">
        <div className="w-1.5 h-1.5 bg-[#0565E6] rounded-full animate-pulse" />
        OTP Sent
      </div>

      <h1 className="text-3xl font-black text-text-primary tracking-tight mb-2">Enter OTP</h1>
      <div className="flex items-center gap-2 mb-8">
        <p className="text-sm text-text-muted">
          Sent to <span className="font-bold text-gray-700">{maskedPhone}</span>
        </p>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-[11px] font-bold text-[#0565E6] hover:underline bg-transparent border-none cursor-pointer p-0"
        >
          <EditIcon /> Edit
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold mb-6 animate-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-xs sm:text-sm font-bold text-gray-700 mb-4 ml-1 block">6-Digit OTP</label>
          <div className="flex gap-2 justify-between" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-full aspect-square text-center text-xl font-black border-[2px] rounded-xl outline-none transition-all bg-gray-50 focus:bg-white
                  ${digit ? "border-[#0565E6] text-[#0565E6] bg-[#0565E6]/5" : "border-gray-200 text-text-primary"}
                  focus:border-[#0565E6] focus:ring-4 focus:ring-[#0565E6]/10`}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={otp.join("").length !== 6 || loading}
          className="w-full bg-[#0565E6] hover:bg-[#0452B9] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#0565E6]/30 hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? "Verifying..." : "Verify & Login"}
          {!loading && <ArrowRightIcon />}
        </button>
      </form>

      <ResendTimer onResend={onResend} />
    </>
  );
}

// ─── Resend Timer ─────────────────────────────────────────────────────────────

function ResendTimer({ onResend }) {
  const [seconds, setSeconds] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useState(() => {
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  });

  const handleResend = () => {
    if (!canResend) return;
    setSeconds(30);
    setCanResend(false);
    onResend();
  };

  return (
    <div className="text-center mt-6">
      {canResend ? (
        <button
          type="button"
          onClick={handleResend}
          className="text-sm font-bold text-[#0565E6] hover:underline bg-transparent border-none cursor-pointer"
        >
          Resend OTP
        </button>
      ) : (
        <p className="text-xs text-gray-400 font-medium">
          Resend OTP in <span className="font-bold text-gray-600">{seconds}s</span>
        </p>
      )}
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [phone, setPhone] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSendOtp = async (phoneNumber) => {
    setLoading(true);
    setError("");
    try {
      const data = await sendOtp(phoneNumber);
      setSessionId(data.sessionId);
      setPhone(phoneNumber);
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otp) => {
    setLoading(true);
    setError("");
    try {
      await verifyOtp(phone, otp, sessionId);
      const params = new URLSearchParams(location.search);
      const returnUrl = params.get("returnUrl") || "/dashboard";
      navigate(returnUrl);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] bg-gradient-to-br from-[#0565E6]/5 via-white to-[#0565E6]/5 flex items-center justify-center p-4 sm:p-8">
      <SEOHead
        title={location.pathname === '/signup' ? 'Sign Up' : 'Login'}
        description="Login to DeviceKart to track your device sale orders and manage pickups."
        path={location.pathname}
        noindex
      />
      <div className="w-full max-w-[440px] bg-white rounded-[32px] shadow-2xl shadow-[#0565E6]/10 border border-gray-100 p-8 sm:p-12 animate-in fade-in zoom-in-95 duration-300">

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {["Phone", "OTP"].map((label, i) => {
            const stepIndex = step === "phone" ? 0 : 1;
            const isActive = i === stepIndex;
            const isDone = i < stepIndex;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider transition-all
                  ${isActive ? "text-[#0565E6]" : isDone ? "text-green-500" : "text-gray-300"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black
                    ${isActive ? "bg-[#0565E6] text-white" : isDone ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  {label}
                </div>
                {i < 1 && (
                  <div className={`w-8 h-px transition-all ${isDone || isActive ? "bg-[#0565E6]/30" : "bg-gray-100"}`} />
                )}
              </div>
            );
          })}
        </div>

        {step === "phone" && (
          <PhoneStep
            onNext={handleSendOtp}
            loading={loading}
            error={error}
          />
        )}

        {step === "otp" && (
          <OtpStep
            phone={phone}
            onVerify={handleVerifyOtp}
            onBack={() => { setStep("phone"); setError(""); }}
            onResend={() => handleSendOtp(phone)}
            loading={loading}
            error={error}
          />
        )}

        {/* <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">OR</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <p className="text-center text-sm text-text-muted font-medium">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#0565E6] font-bold hover:underline">Sign up</Link>
        </p> */}

        <div className="flex justify-center gap-5 mt-10">
          {["SSL Secure", "No Spam", "Free Pickup"].map((t) => (
            <div key={t} className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
              <div className="w-1.5 h-1.5 bg-[#0565E6]/40 rounded-full" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}