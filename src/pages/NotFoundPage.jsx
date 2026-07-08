import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import SEOHead from '../components/seo/SEOHead';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <SEOHead title="Page Not Found" description="The page you are looking for does not exist." path="/404" noindex />
      <div className="text-8xl font-extrabold text-[#0565E6]/20 mb-4 select-none">404</div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-3">Page Not Found</h1>
      <p className="text-sm text-text-muted mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button className="bg-[#0565E6] hover:bg-[#0452B9] text-white">Go Home</Button>
      </Link>
    </div>
  );
}