export default function Loader({ className = '' }) {
  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`}>
      <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
