import React from 'react';
import { Close as CloseIcon } from '@mui/icons-material';
import useModalFocus from './useModalFocus';

/**
 * Standard Modal Shell providing backdrop, smooth animation, header with title/close button,
 * scrollable body, and optional footer layout.
 */
export default function ModalShell({
  open,
  onClose,
  title,
  headerContent,
  headerBg = 'bg-[var(--primary-main)]',
  headerTextColor = 'text-white',
  maxWidth = 'max-w-[600px]',
  children,
  footer,
  showCloseButton = true,
  ariaLabel,
  className = '',
  bodyClassName = 'p-6',
  closeOnEscape = true,
  initialFocusRef
}) {
  const { dialogRef, titleId } = useModalFocus({
    open,
    onClose,
    initialFocusRef,
    closeOnEscape
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel || 'Dialog' : undefined}
        tabIndex={-1}
        className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} overflow-hidden flex flex-col animate-scale-in border border-gray-100 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        {(title || headerContent) && (
          <div className={`${headerBg} px-5 py-4 flex items-center justify-between`}>
            {headerContent ? (
              headerContent
            ) : (
              <h2 id={titleId} className={`${headerTextColor} text-[18px] font-bold leading-tight`}>
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className={`bg-white max-h-[75vh] overflow-y-auto ${bodyClassName}`}>
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
