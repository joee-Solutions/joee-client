export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Tenant Not Found</h2>
        <p className="text-gray-600 mb-6">
          The tenant you're looking for doesn't exist or is invalid.
        </p>
        <p className="text-sm text-gray-500">
          Please check the URL and try again, or contact support if you believe this is an error.
        </p>
      </div>
    </div>
  );
}

