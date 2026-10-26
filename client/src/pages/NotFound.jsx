import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';

export default function NotFound() {
  return (
    <PageWrapper title="Page Not Found" titleHi="पेज नहीं मिला">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-8xl font-black text-primary-200 dark:text-primary-800">404</p>
        <p className="text-lg font-semibold text-gray-800 dark:text-white mt-4">
          Yeh page nahi mila!
        </p>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/"
          className="gradient-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-lg transition-shadow">
          <Home className="w-4 h-4" /> Go to Dashboard
        </Link>
      </div>
    </PageWrapper>
  );
}
