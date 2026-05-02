import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, X, Info } from "lucide-react";

const ToastContext = createContext({
  showToast: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const icon =
              toast.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : toast.type === "error" ? (
                <AlertTriangle className="h-5 w-5 text-rose-400" />
              ) : (
                <Info className="h-5 w-5 text-sky-400" />
              );

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0a0a0a]/95 px-5 py-4 shadow-2xl backdrop-blur-xl"
              >
                {icon}
                <span className="max-w-xs text-sm text-zinc-200">{toast.message}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="ml-2 rounded-full p-1 text-zinc-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
