export default function ChipGroup({
  options = [],
  value,
  onChange,
  multi = false,
  columns = 2,
}) {
  const selected = multi
    ? Array.isArray(value)
      ? value
      : []
    : value;

  const toggle = (opt) => {
    if (multi) {
      const next = selected.includes(opt)
        ? selected.filter((v) => v !== opt)
        : [...selected, opt];
      onChange(next);
      return;
    }
    onChange(opt === selected ? '' : opt);
  };

  const colClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 3
        ? 'grid-cols-2 sm:grid-cols-3'
        : columns === 4
          ? 'grid-cols-2 sm:grid-cols-4'
          : 'grid-cols-2';

  return (
    <div className={`grid ${colClass} gap-2.5`}>
      {options.map((opt) => {
        const active = multi ? selected.includes(opt) : selected === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`min-h-[48px] px-3 py-3 rounded-2xl border-2 text-sm font-extrabold transition-all active:scale-[0.98]
              ${active
                ? 'border-primary bg-primary-light text-primary shadow-sm'
                : 'border-[#E8EEF5] bg-white text-gray-600 hover:border-gray-200'}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
