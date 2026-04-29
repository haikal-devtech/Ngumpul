"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, X, AlertCircle } from 'lucide-react';
import { Toast } from '../lib/types';
import { cn } from '../lib/utils';

export const ToastContainer = ({ toasts }: { toasts: Toast[] }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border min-w-[280px] max-w-md backdrop-blur-md",
              toast.type === 'success' 
                ? "bg-emerald-50/90 dark:bg-emerald-950/90 border-emerald-100 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100" 
                : toast.type === 'error'
                ? "bg-rose-50/90 dark:bg-rose-950/90 border-rose-100 dark:border-rose-800 text-rose-900 dark:text-rose-100"
                : "bg-white/90 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
            )}
          >
            {toast.type === 'success' ? (
              <CheckCircle size={18} className="text-emerald-500" />
            ) : toast.type === 'error' ? (
              <AlertCircle size={18} className="text-rose-500" />
            ) : null}
            <p className="text-sm font-medium flex-1">{toast.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
