export default function SimpleDialog({ isOpen, onClose, onConfirm, title, description, confirmText, confirmColor }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | boolean | Promise<void | boolean>;
  title: string;
  description: string;
  confirmText: string;
  confirmColor: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-6">{description}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors border border-gray-400/40"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                const shouldClose = await onConfirm();
                if (shouldClose !== false) {
                  onClose();
                }
              } catch (error) {
                console.error("Dialog confirm failed:", error);
              }
            }}
            className={`px-4 py-2 text-sm font-medium text-black rounded transition-colors cursor-pointer ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
