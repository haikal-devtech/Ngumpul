import React from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  fullScreen?: boolean;
  className?: string;
}

export function Loader({ fullScreen = false, className }: LoaderProps) {
  const containerClass = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm"
    : "flex items-center justify-center w-full h-full min-h-[200px]";

  return (
    <div className={cn(containerClass, className)}>
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
          }}
          className="w-16 h-16 rounded-2xl bg-indigo-600/10 dark:bg-indigo-400/10 flex items-center justify-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 1,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <MessageCircle size={32} className="text-indigo-600 dark:text-indigo-400" />
          </motion.div>
        </motion.div>
        
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: ["0%", "-50%", "0%"],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
              className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
