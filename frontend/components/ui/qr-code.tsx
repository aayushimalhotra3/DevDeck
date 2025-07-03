'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { cn } from '@/lib/utils';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export function QRCodeComponent({
  value,
  size = 200,
  className,
  errorCorrectionLevel = 'M',
  margin = 4,
  color = {
    dark: '#000000',
    light: '#FFFFFF',
  },
}: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin,
          color,
          errorCorrectionLevel,
        },
        error => {
          if (error) {
            console.error('QR Code generation error:', error);
          }
        }
      );
    }
  }, [value, size, margin, color, errorCorrectionLevel]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('rounded-lg border', className)}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}

export { QRCodeComponent as QRCode };
