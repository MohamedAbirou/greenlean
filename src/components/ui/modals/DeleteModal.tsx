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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-sm relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
          Delete Activity
        </h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete this activity log?
        </p>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex gap-4">
          <button
            className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
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