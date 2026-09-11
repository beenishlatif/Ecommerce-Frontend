import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <Compass className="h-12 w-12 text-lilac-400 mb-4" />
      <h1 className="text-5xl font-display font-semibold text-charcoal-800 mb-2">404</h1>
      <p className="text-charcoal-500 mb-8">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  );
}
