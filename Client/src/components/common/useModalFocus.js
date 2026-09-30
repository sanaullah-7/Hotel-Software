import { useEffect, useId, useRef } from 'react';

/**
 * Custom hook providing accessible dialog focus management, keyboard trapping,
 * Escape key handling, and focus restoration for modal components.
 */
export default function useModalFocus({
  open,
  onClose,
  initialFocusRef,
  closeOnEscape = true
}) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    // Capture the trigger element that opened the dialog
    previousFocusRef.current = document.activeElement;

    // Move focus inside dialog
    const moveFocusInside = () => {
      if (!dialogRef.current) return;

      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }

      // Prefer first non-disabled form control (input, select, textarea)
      const formControl = dialogRef.current.querySelector(
        'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"])'
      );
      if (formControl) {
        formControl.focus();
        return;
      }

      // Otherwise focus first interactive element (e.g. button, link)
      const focusable = dialogRef.current.querySelectorAll(
        'button:not([disabled]):not([tabindex="-1"]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      } else {
        dialogRef.current.focus();
      }
    };

    moveFocusInside();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && closeOnEscape && typeof onCloseRef.current === 'function') {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab') {
        if (!dialogRef.current) return;

        const focusable = dialogRef.current.querySelectorAll(
          'button:not([disabled]):not([tabindex="-1"]), [href], input:not([disabled]):not([type="hidden"]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])'
        );

        if (!focusable || !focusable.length) {
          e.preventDefault();
          dialogRef.current.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || document.activeElement === dialogRef.current) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current?.isConnected && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [open, initialFocusRef, closeOnEscape]);

  return { dialogRef, titleId };
}
