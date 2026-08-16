export default function Loader({ label = 'A carregar...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-500">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-hospital-pink" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
