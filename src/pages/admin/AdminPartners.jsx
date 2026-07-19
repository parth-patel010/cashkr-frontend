import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Search, ChevronLeft, ChevronRight, Mail, Phone, MapPin, Store } from 'lucide-react';
import './admin.css';

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (status) params.status = status;

    adminService.getPartners(params)
      .then((res) => {
        setPartners(res.data.partners);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load partners', err);
        setLoading(false);
      });
  }, [debouncedSearch, status, page]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved': return 'admin-badge admin-badge-green';
      case 'rejected': return 'admin-badge admin-badge-red';
      default: return 'admin-badge admin-badge-yellow';
    }
  };

  const getShopTypeLabel = (type) => {
    switch (type) {
      case 'repair': return 'Mobile Repair Shop';
      case 'retailer': return 'Laptop Retailer';
      case 'refurb': return 'Refurbishing Unit';
      case 'collector': return 'E-waste Collector';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              className="admin-search pl-10"
              placeholder="Search business or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          </div>

          <select
            className="admin-select"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="text-sm font-semibold text-slate-500">
          Applications Count: <span className="text-slate-900 font-bold">{total}</span>
        </div>
      </div>

      {/* Partners Table */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div className="p-12 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 admin-skeleton w-full" />
            ))}
          </div>
        ) : partners.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No partner registrations found.
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Business / Firm Name</th>
                  <th>Contact Person</th>
                  <th>Email Address</th>
                  <th>Mobile Number</th>
                  <th>Hub / City</th>
                  <th>Business Category</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500">
                          <Store size={16} />
                        </div>
                        <div className="font-bold text-slate-900">{partner.businessName}</div>
                      </div>
                    </td>
                    <td className="text-slate-800 font-semibold">{partner.contactPerson}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-400" />
                        <span className="font-mono text-xs text-slate-700">{partner.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-400" />
                        <span className="font-mono text-xs text-slate-700">{partner.mobile}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{partner.city}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge-blue text-[10px]">
                        {getShopTypeLabel(partner.shopType)}
                      </span>
                    </td>
                    <td className="text-xs">
                      {new Date(partner.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(partner.status)}>
                        {partner.status}
                      </span>
                    </td>
                    <td>
                      {partner.status !== 'approved' ? (
                        <button
                          type="button"
                          className="admin-btn admin-btn-primary text-xs"
                          onClick={async () => {
                            try {
                              await adminService.approvePartnerAsVendor(partner._id);
                              alert('Vendor account created. They can login with OTP.');
                              setPage(1);
                              setStatus('');
                            } catch (err) {
                              alert(err?.response?.data?.message || 'Failed to create vendor');
                            }
                          }}>
                          Create Vendor
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="admin-pagination">
              <div className="admin-pagination-info">
                Page {page} of {totalPages}
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

    </div>
  );
}
