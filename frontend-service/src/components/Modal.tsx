import React from 'react';
import Close from '@mui/icons-material/Close';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[1000] flex items-center justify-center p-4 animate-fade-in"
      onMouseDown={handleOverlayMouseDown}
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-[560px] w-full shadow-2xl overflow-hidden animate-slide-in flex flex-col">
        <div className="border-b border-slate-100 flex items-center justify-between" style={{ padding: '24px 40px' }}>
          <h3 className="text-xl font-bold text-slate-800 font-sans">{title}</h3>
          <button 
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-50 p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
            onClick={onClose}
          >
            <Close style={{ fontSize: '20px' }} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[75vh]" style={{ padding: '40px' }}>{children}</div>
      </div>
    </div>
  );
};
