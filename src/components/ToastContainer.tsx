import { useToast } from '../contexts/ToastContext';

export default function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 no-print">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-white min-w-[300px] animate-slide-in ${
            toast.type === 'success' ? 'bg-[#10B981]' : 'bg-[#EF4444]'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
