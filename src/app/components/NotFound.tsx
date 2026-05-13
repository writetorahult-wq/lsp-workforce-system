import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
        <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
