import React, { useEffect } from 'react';
import { Sprout, X } from 'lucide-react';

interface NotificationToastProps {
  message: string | null;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-[#163323] text-white px-4 py-3 rounded-xl shadow-xl border border-[#27523D] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-2.5">
        <Sprout className="w-4 h-4 text-[#8FA89B] shrink-0" />
        <span className="text-xs font-medium leading-relaxed">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded text-[#8FA89B] hover:text-white hover:bg-[#27523D] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
