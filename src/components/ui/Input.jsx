import { useState } from 'react';

export default function Input({ label, icon, type = 'text', error, className = '', ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>}
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3 text-gray-400 flex pointer-events-none">{icon}</span>}
        <input
          type={isPassword && show ? 'text' : type}
          className={`w-full py-2.5 pr-11 border-[1.5px] rounded-xl text-sm font-[DM_Sans] text-text-primary outline-none bg-[#fafbff] transition-all duration-200
            focus:border-primary focus:shadow-[0_0_0_3px_rgba(5,101,230,0.10)] focus:bg-white
            ${icon ? 'pl-10' : 'pl-4'}
            ${error ? 'border-red-400' : 'border-border'}`}
          {...props}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(v => !v)}
            className="absolute right-3 bg-transparent border-none cursor-pointer text-xs font-bold text-primary">
            {show ? 'HIDE' : 'SHOW'}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}
