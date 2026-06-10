import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

// Luxury transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1], // Custom easing for smooth luxury feel
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Fade only variant (for faster transitions)
const fadeVariants = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

// Slide from right (for forward navigation)
const slideRightVariants = {
  initial: {
    opacity: 0,
    x: 100,
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Slide from left (for backward navigation)
const slideLeftVariants = {
  initial: {
    opacity: 0,
    x: -100,
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Scale and fade (for modal-like pages)
const scaleVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  enter: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = '' 
}) => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Specialized transition components
export const FadeTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = '' 
}) => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="enter"
      exit="exit"
      variants={fadeVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const SlideRightTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = '' 
}) => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="enter"
      exit="exit"
      variants={slideRightVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const SlideLeftTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = '' 
}) => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="enter"
      exit="exit"
      variants={slideLeftVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ScaleTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = '' 
}) => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="enter"
      exit="exit"
      variants={scaleVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Loading transition component
export const LoadingTransition = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Loading...
        </motion.p>
      </div>
    </motion.div>
  );
};

// Stagger children animation helper
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className = '', staggerDelay = 0.1 }) => {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={{
        initial: {},
        enter: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
        exit: {},
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={{
        initial: {
          opacity: 0,
          y: 20,
        },
        enter: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          },
        },
        exit: {
          opacity: 0,
          y: -20,
          transition: {
            duration: 0.3,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
