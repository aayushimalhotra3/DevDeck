'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Share2, 
  Copy, 
  Check,
  ExternalLink,
  QrCode,
  Globe,
  Lock,
  Eye,
  Download,
  Mail,
  MessageCircle,
  Twitter,
  Linkedin,
  Facebook,
  Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureTooltip, Tooltip } from './Tooltip';
import { AnimatedContainer, ScaleOnHover, LoadingSpinner } from './AnimatedContainer';
import { useToast } from '@/components/ui/use-toast';

interface PortfolioSharingProps {
  portfolioId: string;
  portfolioUrl: string;
  isPublic: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
  portfolioTitle?: string;
  portfolioDescription?: string;
}

interface ShareStats {
  views: number;
  shares: number;
  lastViewed?: string;
}

export function PortfolioSharing({ 
  portfolioId, 
  portfolioUrl, 
  isPublic, 
  onVisibilityChange,
  portfolioTitle = 'My Portfolio',
  portfolioDescription = 'Check out my portfolio'
}: PortfolioSharingProps) {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [shareStats, setShareStats] = useState<ShareStats>({ views: 0, shares: 0 });
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch share statistics
    fetchShareStats();
  }, [portfolioId]);

  const fetchShareStats = async () => {
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/stats`);
      if (response.ok) {
        const stats = await response.json();
        setShareStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch share stats:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Portfolio link has been copied to your clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
      
      // Track share event
      trackShare('copy');
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the link manually.',
        variant: 'destructive'
      });
    }
  };

  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    try {
      // Using QR Server API for simplicity
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(portfolioUrl)}`;
      setQrCodeUrl(qrUrl);
    } catch (error) {
      toast({
        title: 'Failed to generate QR code',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const trackShare = async (platform: string) => {
    try {
      await fetch(`/api/portfolios/${portfolioId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      });
      // Update local stats
      setShareStats(prev => ({ ...prev, shares: prev.shares + 1 }));
    } catch (error) {
      console.error('Failed to track share:', error);
    }
  };

  const shareToSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(portfolioUrl);
    const encodedTitle = encodeURIComponent(portfolioTitle);
    const encodedDescription = encodeURIComponent(portfolioDescription);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
        break;
      default:
        return;
    }
    
    if (platform === 'email') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    trackShare(platform);
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${portfolioTitle}-qr-code.png`;
    link.click();
  };

  return (
    <AnimatedContainer className="space-y-6">
      {/* Portfolio Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            Portfolio Visibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                {isPublic ? 'Public Portfolio' : 'Private Portfolio'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {isPublic 
                  ? 'Your portfolio is visible to everyone with the link'
                  : 'Your portfolio is only visible to you'
                }
              </p>
            </div>
            <FeatureTooltip
              title="Toggle Visibility"
              description={isPublic ? 'Make portfolio private' : 'Make portfolio public'}
            >
              <Switch
                checked={isPublic}
                onCheckedChange={onVisibilityChange}
              />
            </FeatureTooltip>
          </div>
          
          {isPublic && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center gap-2 text-green-800">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">Portfolio is live!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Anyone with the link can view your portfolio.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Share Statistics */}
      {isPublic && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Share Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{shareStats.views}</div>
                <div className="text-sm text-blue-700">Total Views</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{shareStats.shares}</div>
                <div className="text-sm text-green-700">Total Shares</div>
              </div>
            </div>
            {shareStats.lastViewed && (
              <p className="text-sm text-muted-foreground mt-3">
                Last viewed: {new Date(shareStats.lastViewed).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Share Link */}
      {isPublic && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Your Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Direct Link */}
            <div className="space-y-2">
              <Label>Portfolio Link</Label>
              <div className="flex gap-2">
                <Input
                  value={portfolioUrl}
                  readOnly
                  className="flex-1"
                />
                <FeatureTooltip
                  title="Copy Link"
                  description="Copy portfolio URL to clipboard"
                >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    className="shrink-0"
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Copy className="w-4 h-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </FeatureTooltip>
                <FeatureTooltip
                  title="Open Portfolio"
                  description="Open your portfolio in a new tab"
                >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(portfolioUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </FeatureTooltip>
              </div>
            </div>

            <Separator />

            {/* Social Media Sharing */}
            <div className="space-y-3">
              <Label>Share on Social Media</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { platform: 'twitter', icon: Twitter, label: 'Twitter', color: 'bg-blue-500 hover:bg-blue-600' },
                  { platform: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'bg-blue-700 hover:bg-blue-800' },
                  { platform: 'facebook', icon: Facebook, label: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700' },
                  { platform: 'email', icon: Mail, label: 'Email', color: 'bg-gray-600 hover:bg-gray-700' }
                ].map(({ platform, icon: Icon, label, color }) => (
                  <FeatureTooltip
                    key={platform}
                    title={`Share on ${label}`}
                    description={`Share your portfolio on ${label}`}
                  >
                    <ScaleOnHover>
                      <Button
                        variant="outline"
                        className={`w-full flex items-center gap-2 text-white border-0 ${color}`}
                        onClick={() => shareToSocial(platform)}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </Button>
                    </ScaleOnHover>
                  </FeatureTooltip>
                ))}
              </div>
            </div>

            <Separator />

            {/* QR Code */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>QR Code</Label>
                <div className="flex gap-2">
                  <FeatureTooltip
                    title="Generate QR Code"
                    description="Create a QR code for easy mobile sharing"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateQRCode}
                      disabled={isGeneratingQR}
                      className="flex items-center gap-2"
                    >
                      {isGeneratingQR ? (
                        <LoadingSpinner size={16} />
                      ) : (
                        <QrCode className="w-4 h-4" />
                      )}
                      Generate
                    </Button>
                  </FeatureTooltip>
                  {qrCodeUrl && (
                    <FeatureTooltip
                      title="Download QR Code"
                      description="Download QR code as PNG image"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadQRCode}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </FeatureTooltip>
                  )}
                </div>
              </div>
              
              {qrCodeUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-center p-4 bg-white border rounded-lg"
                >
                  <img
                    src={qrCodeUrl}
                    alt="Portfolio QR Code"
                    className="w-32 h-32"
                  />
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Private Portfolio Message */}
      {!isPublic && (
        <Card>
          <CardContent className="pt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Portfolio is Private</h3>
              <p className="text-muted-foreground mb-4">
                Make your portfolio public to enable sharing options.
              </p>
              <Button
                onClick={() => onVisibilityChange(true)}
                className="flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                Make Public
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      )}
    </AnimatedContainer>
  );
}

export default PortfolioSharing;