'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Sun, 
  Moon, 
  Palette, 
  Monitor, 
  Check,
  Paintbrush,
  Eye,
  Download,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureTooltip, Tooltip } from './Tooltip';
import { AnimatedContainer, ScaleOnHover } from './AnimatedContainer';

interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  customScheme?: {
    name: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      foreground: string;
      muted: string;
    };
  };
}

interface ThemeSystemProps {
  currentTheme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
  onPreview?: (theme: ThemeConfig) => void;
}

const predefinedSchemes = [
  {
    name: 'Default',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#8b5cf6',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f1f5f9'
    }
  },
  {
    name: 'Ocean',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0891b2',
      accent: '#06b6d4',
      background: '#f0f9ff',
      foreground: '#0c4a6e',
      muted: '#e0f2fe'
    }
  },
  {
    name: 'Forest',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      background: '#f0fdf4',
      foreground: '#064e3b',
      muted: '#dcfce7'
    }
  },
  {
    name: 'Sunset',
    colors: {
      primary: '#ea580c',
      secondary: '#dc2626',
      accent: '#f59e0b',
      background: '#fffbeb',
      foreground: '#9a3412',
      muted: '#fef3c7'
    }
  },
  {
    name: 'Purple',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a855f7',
      background: '#faf5ff',
      foreground: '#581c87',
      muted: '#f3e8ff'
    }
  },
  {
    name: 'Dark',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#8b5cf6',
      background: '#0f172a',
      foreground: '#f8fafc',
      muted: '#1e293b'
    }
  }
];

export function ThemeSystem({ currentTheme, onThemeChange, onPreview }: ThemeSystemProps) {
  const [selectedScheme, setSelectedScheme] = useState<string>('Default');
  const [customColors, setCustomColors] = useState({
    primary: currentTheme.primaryColor || '#3b82f6',
    secondary: '#64748b',
    accent: currentTheme.accentColor || '#8b5cf6',
    background: '#ffffff',
    foreground: '#0f172a',
    muted: '#f1f5f9'
  });
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    const scheme = predefinedSchemes.find(s => s.name === selectedScheme) || predefinedSchemes[0];
    
    if (isCustomizing) {
      Object.entries(customColors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
    } else {
      Object.entries(scheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
    }

    // Apply dark mode class
    if (currentTheme.mode === 'dark' || 
        (currentTheme.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [currentTheme.mode, selectedScheme, customColors, isCustomizing]);

  const handleModeChange = (mode: 'light' | 'dark' | 'system') => {
    onThemeChange({
      ...currentTheme,
      mode
    });
  };

  const handleSchemeSelect = (schemeName: string) => {
    setSelectedScheme(schemeName);
    setIsCustomizing(false);
    const scheme = predefinedSchemes.find(s => s.name === schemeName);
    if (scheme) {
      onThemeChange({
        ...currentTheme,
        primaryColor: scheme.colors.primary,
        accentColor: scheme.colors.accent,
        customScheme: scheme
      });
    }
  };

  const handleCustomColorChange = (colorKey: string, value: string) => {
    const newColors = { ...customColors, [colorKey]: value };
    setCustomColors(newColors);
    setIsCustomizing(true);
    
    onThemeChange({
      ...currentTheme,
      primaryColor: newColors.primary,
      accentColor: newColors.accent,
      customScheme: {
        name: 'Custom',
        colors: newColors
      }
    });
  };

  const exportTheme = () => {
    const themeData = {
      ...currentTheme,
      customColors: isCustomizing ? customColors : undefined,
      selectedScheme
    };
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-theme.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeData = JSON.parse(e.target?.result as string);
        onThemeChange(themeData);
        if (themeData.selectedScheme) {
          setSelectedScheme(themeData.selectedScheme);
        }
        if (themeData.customColors) {
          setCustomColors(themeData.customColors);
          setIsCustomizing(true);
        }
      } catch (error) {
        console.error('Failed to import theme:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <AnimatedContainer className="space-y-6">
      {/* Theme Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Theme Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { mode: 'light' as const, icon: Sun, label: 'Light' },
              { mode: 'dark' as const, icon: Moon, label: 'Dark' },
              { mode: 'system' as const, icon: Monitor, label: 'System' }
            ].map(({ mode, icon: Icon, label }) => (
              <FeatureTooltip
                key={mode}
                title={`${label} Mode`}
                description={mode === 'system' ? 'Follow system preference' : `Use ${mode} theme`}
              >
                <ScaleOnHover>
                  <Button
                    variant={currentTheme.mode === mode ? 'default' : 'outline'}
                    className="w-full flex items-center gap-2"
                    onClick={() => handleModeChange(mode)}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {currentTheme.mode === mode && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                    )}
                  </Button>
                </ScaleOnHover>
              </FeatureTooltip>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Schemes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color Schemes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {predefinedSchemes.map((scheme) => (
              <FeatureTooltip
                key={scheme.name}
                title={`${scheme.name} Theme`}
                description="Click to apply this color scheme"
              >
                <ScaleOnHover>
                  <motion.div
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedScheme === scheme.name && !isCustomizing
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSchemeSelect(scheme.name)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{scheme.name}</span>
                      {selectedScheme === scheme.name && !isCustomizing && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          <Check className="w-4 h-4 text-blue-500" />
                        </motion.div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {Object.entries(scheme.colors).slice(0, 4).map(([key, color]) => (
                        <div
                          key={key}
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </ScaleOnHover>
              </FeatureTooltip>
            ))}
          </div>

          {/* Custom Colors */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Label className="font-medium">Custom Colors</Label>
                <Tooltip content="Create your own color scheme">
                  <Paintbrush className="w-4 h-4 text-muted-foreground" />
                </Tooltip>
              </div>
              {isCustomizing && (
                <Badge variant="secondary" className="text-xs">
                  Custom Active
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(customColors).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs capitalize">{key}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => handleCustomColorChange(key, e.target.value)}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleCustomColorChange(key, e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border rounded"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Theme Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <FeatureTooltip
              title="Preview Theme"
              description="Preview how your portfolio will look with this theme"
            >
              <Button
                variant="outline"
                onClick={() => onPreview?.(currentTheme)}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
            </FeatureTooltip>
            
            <FeatureTooltip
              title="Export Theme"
              description="Download your theme configuration as a JSON file"
            >
              <Button
                variant="outline"
                onClick={exportTheme}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </FeatureTooltip>
            
            <FeatureTooltip
              title="Import Theme"
              description="Load a theme configuration from a JSON file"
            >
              <Button
                variant="outline"
                className="flex items-center gap-2 relative overflow-hidden"
              >
                <Upload className="w-4 h-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importTheme}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </Button>
            </FeatureTooltip>
          </div>
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
}

export default ThemeSystem;