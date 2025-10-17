import { X } from "lucide-react";

interface DeleteModalProps {
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
  error: string | null;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  onConfirm,
  onClose,
  loading,
  error,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-xl shadow-lg p-3 w-full max-w-sm relative">
        <button
          className="absolute top-4 right-4 text-foreground hover:text-foreground/80 cursor-pointer"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold text-foreground mb-6">
          Delete Activity
        </h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete this activity log?
        </p>
        {error && <p className="text-destructive-foreground text-sm mb-2">{error}</p>}
        <div className="flex gap-4">
          <button
            className="flex-1 py-2 bg-button text-foreground hover:bg-button/80 cursor-pointer transition-colors duration-300 rounded-lg"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-2 bg-destructive hover:bg-destructive/80 transition-colors duration-300 cursor-pointer text-white rounded-lg"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;