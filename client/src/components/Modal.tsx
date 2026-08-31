import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClass?: string; // e.g. "max-w-md", "max-w-2xl", "max-w-4xl"
}

export default function Modal({ isOpen, onClose, title, children, maxWidthClass = 'max-w-md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-vinyl-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full ${maxWidthClass} max-h-[90vh] flex flex-col bg-paper-white border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-2xl relative text-left animate-in fade-in zoom-in-95 duration-200`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-faded-olive hover:text-vinyl-black transition cursor-pointer p-1 z-10"
          aria-label="Fechar"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h3 className="font-serif font-bold text-xl md:text-2xl text-vinyl-black mb-6 border-b border-faded-olive/10 pb-4 pr-8 flex-shrink-0">
          {title}
        </h3>

        {/* Scrollable Children content */}
        <div className="overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-faded-olive/20">
          {children}
        </div>
      </div>
    </div>
  );
}
