import { useEffect, useState } from 'react';
import { fetchAppPageSettings, isPageEnabled, pageLabel } from '../../utils/appPageSettings';
import ComingSoonPage from '../../pages/ComingSoonPage';
import Loader from '../ui/Loader';

/**
 * Shows Coming Soon when admin disables a page (App Settings / Website Settings).
 */
export default function PageGate({ pageKey, children }) {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [label, setLabel] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAppPageSettings()
      .then((pages) => {
        if (!active) return;
        setEnabled(isPageEnabled(pages, pageKey));
        setLabel(pageLabel(pages, pageKey));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [pageKey]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader fullScreen={false} />
      </div>
    );
  }

  if (!enabled) {
    return <ComingSoonPage feature={pageKey} title={label || undefined} />;
  }

  return children;
}
