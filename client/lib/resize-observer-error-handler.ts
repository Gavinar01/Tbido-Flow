// Suppress ResizeObserver loop completed errors
// This is a common, harmless error that occurs with UI libraries
export const suppressResizeObserverError = () => {
  // Store the original console.error
  const originalError = console.error;

  // Override console.error to filter out ResizeObserver errors
  console.error = (...args: any[]) => {
    // Check if the error is the ResizeObserver loop error
    if (
      args.length > 0 &&
      typeof args[0] === 'string' &&
      args[0].includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      // Silently ignore this specific error
      return;
    }
    
    // For all other errors, use the original console.error
    originalError.apply(console, args);
  };

  // Also handle uncaught errors
  const originalErrorHandler = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (
      typeof message === 'string' &&
      message.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      // Silently ignore this specific error
      return true;
    }
    
    // For all other errors, use the original handler
    if (originalErrorHandler) {
      return originalErrorHandler(message, source, lineno, colno, error);
    }
    return false;
  };

  // Handle unhandled promise rejections
  const originalUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = (event) => {
    if (
      event.reason &&
      typeof event.reason.message === 'string' &&
      event.reason.message.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      // Prevent the error from being logged
      event.preventDefault();
      return;
    }
    
    // For all other rejections, use the original handler
    if (originalUnhandledRejection) {
      originalUnhandledRejection(event);
    }
  };
};

// Debounce function to prevent rapid resize observations
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

// Request animation frame wrapper for smooth updates
export const rafDebounce = <T extends (...args: any[]) => any>(
  func: T
): ((...args: Parameters<T>) => void) => {
  let rafId: number;
  
  return (...args: Parameters<T>) => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    
    rafId = requestAnimationFrame(() => {
      func.apply(null, args);
    });
  };
};
