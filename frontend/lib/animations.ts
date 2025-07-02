import { Variants } from 'framer-motion';

// Page transition animations
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -20
  }
};

export const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

// Card animations
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      duration: 0.2,
      ease: 'easeInOut'
    }
  },
  tap: {
    scale: 0.98
  }
};

// List item animations
export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20
  },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.1,
      duration: 0.3,
      ease: 'easeOut'
    }
  }),
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2
    }
  }
};

// Stagger container animations
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

// Modal animations
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2
    }
  }
};

// Backdrop animations
export const backdropVariants: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

// Button animations
export const buttonVariants: Variants = {
  idle: {
    scale: 1
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeInOut'
    }
  },
  tap: {
    scale: 0.95
  },
  loading: {
    scale: 1,
    transition: {
      duration: 0.2
    }
  }
};

// Slide animations
export const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

// Fade animations
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

// Scale animations
export const scaleVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300
    }
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

// Bounce animations
export const bounceVariants: Variants = {
  hidden: {
    y: -100,
    opacity: 0
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 10,
      stiffness: 100,
      bounce: 0.4
    }
  }
};

// Rotation animations
export const rotateVariants: Variants = {
  hidden: {
    rotate: -180,
    opacity: 0
  },
  visible: {
    rotate: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
};

// Drawer animations
export const drawerVariants: Variants = {
  closed: {
    x: '100%',
    transition: {
      type: 'spring',
      damping: 40,
      stiffness: 400
    }
  },
  open: {
    x: 0,
    transition: {
      type: 'spring',
      damping: 40,
      stiffness: 400
    }
  }
};

// Notification animations
export const notificationVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -50,
    scale: 0.3
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 500
    }
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.3,
    transition: {
      duration: 0.2
    }
  }
};

// Progress animations
export const progressVariants: Variants = {
  hidden: {
    width: 0
  },
  visible: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  })
};

// Typing animation
export const typingVariants: Variants = {
  hidden: {
    width: 0
  },
  visible: {
    width: 'auto',
    transition: {
      duration: 2,
      ease: 'linear'
    }
  }
};

// Pulse animation
export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Shake animation
export const shakeVariants: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5
    }
  }
};

// Float animation
export const floatVariants: Variants = {
  float: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Glow animation
export const glowVariants: Variants = {
  glow: {
    boxShadow: [
      '0 0 5px rgba(59, 130, 246, 0.5)',
      '0 0 20px rgba(59, 130, 246, 0.8)',
      '0 0 5px rgba(59, 130, 246, 0.5)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Custom easing functions
export const customEasing = {
  easeInOutCubic: [0.4, 0, 0.2, 1],
  easeOutBack: [0.34, 1.56, 0.64, 1],
  easeInBack: [0.36, 0, 0.66, -0.56],
  easeInOutBack: [0.68, -0.6, 0.32, 1.6]
};

// Animation presets for common use cases
export const animationPresets = {
  // Quick fade in
  quickFadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 }
  },
  
  // Slide up from bottom
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // Scale in
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // Slide in from left
  slideInLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // Slide in from right
  slideInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};