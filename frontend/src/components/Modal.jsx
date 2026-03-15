import React from 'react'
import { X } from 'lucide-react'

const Modal = ({ isOpen, title, children, onClose, onSubmit, submitLabel = 'Save', loading = false }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay fixed inset-0 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="modal-content max-h-[90vh] overflow-y-auto w-full max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-bloomberg-border">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-bloomberg-border">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal
