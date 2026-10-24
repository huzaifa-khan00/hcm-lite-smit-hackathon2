export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && (
          <p className="mb-6 mt-1 text-sm text-gray-600">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}
