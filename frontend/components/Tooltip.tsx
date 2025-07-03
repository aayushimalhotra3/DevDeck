'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const TooltipProvider = TooltipPrimitive.Provider;

const TooltipRoot = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Enhanced Tooltip with animations
interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
}

export function Tooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  className,
  contentClassName,
  disabled = false,
}: TooltipProps) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipRoot>
        <TooltipTrigger asChild className={className}>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            'max-w-xs break-words shadow-lg border border-border/50',
            contentClassName
          )}
        >
          {content}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}

// Keyboard shortcut tooltip
interface KeyboardTooltipProps {
  children: React.ReactNode;
  shortcut: string[];
  description: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function KeyboardTooltip({
  children,
  shortcut,
  description,
  side = 'bottom',
}: KeyboardTooltipProps) {
  const shortcutText = shortcut.join(' + ');
  
  return (
    <Tooltip
      content={
        <div className="space-y-1">
          <div className="font-medium">{description}</div>
          <div className="text-xs opacity-75">
            Press <span className="font-mono bg-background/20 px-1 rounded">{shortcutText}</span>
          </div>
        </div>
      }
      side={side}
    >
      {children}
    </Tooltip>
  );
}

// Feature tooltip with icon
interface FeatureTooltipProps {
  children: React.ReactNode;
  title: string;
  description: string;
  icon?: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function FeatureTooltip({
  children,
  title,
  description,
  icon,
  side = 'top',
}: FeatureTooltipProps) {
  return (
    <Tooltip
      content={
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {icon && <div className="text-primary-foreground/80">{icon}</div>}
            <div className="font-medium">{title}</div>
          </div>
          <div className="text-xs opacity-90">{description}</div>
        </div>
      }
      side={side}
      contentClassName="max-w-sm"
    >
      {children}
    </Tooltip>
  );
}

// Status tooltip with color indicator
interface StatusTooltipProps {
  children: React.ReactNode;
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
  details?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const statusColors = {
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600',
  info: 'bg-blue-600',
};

export function StatusTooltip({
  children,
  status,
  message,
  details,
  side = 'top',
}: StatusTooltipProps) {
  return (
    <Tooltip
      content={
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', statusColors[status])} />
            <div className="font-medium">{message}</div>
          </div>
          {details && <div className="text-xs opacity-90">{details}</div>}
        </div>
      }
      side={side}
    >
      {children}
    </Tooltip>
  );
}

// Progress tooltip
interface ProgressTooltipProps {
  children: React.ReactNode;
  current: number;
  total: number;
  label: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function ProgressTooltip({
  children,
  current,
  total,
  label,
  side = 'top',
}: ProgressTooltipProps) {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <Tooltip
      content={
        <div className="space-y-2">
          <div className="font-medium">{label}</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{current} of {total}</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-24 h-1 bg-background/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-foreground rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      }
      side={side}
    >
      {children}
    </Tooltip>
  );
}

export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent };