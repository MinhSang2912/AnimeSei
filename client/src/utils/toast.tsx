import toast from 'react-hot-toast';

/**
 * Custom modern Dark Theme Toast helper for AnimeSei
 */
export const notify = {
  success: (message: string, description?: string) => {
    return toast.success(
      description ? (
        <div className="flex flex-col">
          <span className="font-bold text-white text-sm sm:text-base leading-tight">{message}</span>
          <span className="text-xs text-slate-300 mt-1 leading-snug">{description}</span>
        </div>
      ) : (
        <span className="font-semibold text-slate-100 text-sm sm:text-base">{message}</span>
      ),
      {
        style: {
          border: '1px solid rgba(16, 185, 129, 0.45)',
          boxShadow: '0 25px 35px -5px rgba(0, 0, 0, 0.7), 0 0 30px rgba(16, 185, 129, 0.3)',
        },
      }
    );
  },

  error: (message: string, description?: string) => {
    return toast.error(
      description ? (
        <div className="flex flex-col">
          <span className="font-bold text-white text-sm sm:text-base leading-tight">{message}</span>
          <span className="text-xs text-slate-300 mt-1 leading-snug">{description}</span>
        </div>
      ) : (
        <span className="font-semibold text-slate-100 text-sm sm:text-base">{message}</span>
      ),
      {
        style: {
          border: '1px solid rgba(239, 68, 68, 0.45)',
          boxShadow: '0 25px 35px -5px rgba(0, 0, 0, 0.7), 0 0 30px rgba(239, 68, 68, 0.3)',
        },
      }
    );
  },

  info: (message: string, description?: string) => {
    return toast(
      description ? (
        <div className="flex flex-col">
          <span className="font-bold text-white text-sm sm:text-base leading-tight">{message}</span>
          <span className="text-xs text-slate-300 mt-1 leading-snug">{description}</span>
        </div>
      ) : (
        <span className="font-semibold text-slate-100 text-sm sm:text-base">{message}</span>
      ),
      {
        icon: 'ℹ️',
        style: {
          border: '1px solid rgba(59, 130, 246, 0.45)',
          boxShadow: '0 25px 35px -5px rgba(0, 0, 0, 0.7), 0 0 30px rgba(59, 130, 246, 0.3)',
        },
      }
    );
  },

  warning: (message: string, description?: string) => {
    return toast(
      description ? (
        <div className="flex flex-col">
          <span className="font-bold text-white text-sm sm:text-base leading-tight">{message}</span>
          <span className="text-xs text-slate-300 mt-1 leading-snug">{description}</span>
        </div>
      ) : (
        <span className="font-semibold text-slate-100 text-sm sm:text-base">{message}</span>
      ),
      {
        icon: '⚠️',
        style: {
          border: '1px solid rgba(245, 158, 11, 0.45)',
          boxShadow: '0 25px 35px -5px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.3)',
        },
      }
    );
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages, {
      style: {
        background: 'rgba(15, 23, 42, 0.95)',
        color: '#f8fafc',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 0 25px rgba(168, 85, 247, 0.25)',
      },
    });
  },
};

export default notify;
