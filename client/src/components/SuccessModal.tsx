import Button from './Button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title = 'Operação Realizada!',
  message,
  buttonText = 'Concluir',
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-vinyl-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      data-cy="success-modal-backdrop"
    >
      <div
        className="w-full max-w-md bg-paper-white border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-2xl relative text-center animate-in fade-in zoom-in-95 duration-200"
        data-cy="success-modal"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-faded-olive hover:text-vinyl-black transition cursor-pointer p-1"
          aria-label="Fechar"
          data-cy="success-modal-x-btn"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Success Icon */}
        <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h3
          className="font-serif font-bold text-xl md:text-2xl text-vinyl-black mb-2"
          data-cy="success-modal-title"
        >
          {title}
        </h3>

        {/* Message */}
        <p
          className="text-sm text-faded-olive leading-relaxed mb-6"
          data-cy="success-modal-message"
        >
          {message}
        </p>

        {/* Action Button */}
        <Button
          onClick={onClose}
          variant="primary"
          className="w-full py-3"
          data-cy="success-modal-close-btn"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
