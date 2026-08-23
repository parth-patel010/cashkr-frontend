import { Link } from "react-router-dom";

export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2.5 flex-wrap py-1 text-base list-none m-0">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-gray-300 select-none" aria-hidden="true">
                ›
              </span>
            )}
            {item.href ? (
              <Link
                to={item.href}
                className="text-[#0565E6] font-medium hover:text-[#0452c4] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-bold" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
