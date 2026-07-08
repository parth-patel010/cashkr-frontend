import Navbar from '../../components/navbar';
import Footer from '../../components/footer';

export default function PageWrapper({ children, hideFooter = false }) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
