'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Copy, Share2, QrCode, ExternalLink, Check, Twitter, Linkedin, Facebook, Link2, Download, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { QRCodeDialog } from '@/components/ui/qr-code-dialog';
import { useToast } from '@/components/ui/use-toast';
import { AnimatedContainer, StaggeredContainer, StaggeredItem, ScaleOnHover } from '@/components/AnimatedContainer';
import { ThemeSystem } from '@/components/ThemeSystem';
import { PortfolioSharing } from '@/components/PortfolioSharing';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureTooltip, Tooltip } from '@/components/Tooltip';

export default function Settings() {
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    twitter: '',
    linkedin: '',
  });

  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showEmail: false,
    showLocation: true,
    allowIndexing: true,
  });

  const [theme, setTheme] = useState({
    mode: 'system' as 'light' | 'dark' | 'system',
    primaryColor: '#3b82f6',
    accentColor: '#8b5cf6',
    colorScheme: 'blue',
    fontFamily: 'inter',
    borderRadius: 'medium',
  });

  const handleThemeChange = (newTheme: any) => {
    setTheme(newTheme);
    // Here you would typically save to localStorage or API
    console.log('Theme updated:', newTheme);
  };

  const handleVisibilityChange = (isPublic: boolean) => {
    setPrivacy({ ...privacy, publicProfile: isPublic });
    handlePrivacySave();
  };
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();

  const portfolioUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/preview/${session?.user?.username || 'your-username'}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      toast({
        title: "URL copied!",
        description: "Portfolio URL has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleSocialShare = (platform: string) => {
    const text = "Check out my portfolio!";
    const url = portfolioUrl;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text} ${url}`)}`
    };
    
    if (shareUrls[platform as keyof typeof shareUrls]) {
      if (platform === 'email') {
        window.location.href = shareUrls[platform as keyof typeof shareUrls];
      } else {
        window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
      }
    }
  };

  const handleProfileSave = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(profile),
        }
      );

      if (response.ok) {
        console.log('Profile updated successfully');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handlePrivacySave = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/privacy`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(privacy),
        }
      );

      if (response.ok) {
        console.log('Privacy settings updated successfully');
      }
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    }
  };

  return (
    <AnimatedContainer className="container mx-auto px-4 py-8">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </motion.div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your public profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={e =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={e =>
                      setProfile({ ...profile, username: e.target.value })
                    }
                    placeholder="your-username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={e =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={e =>
                      setProfile({ ...profile, location: e.target.value })
                    }
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={e =>
                      setProfile({ ...profile, website: e.target.value })
                    }
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={profile.twitter}
                    onChange={e =>
                      setProfile({ ...profile, twitter: e.target.value })
                    }
                    placeholder="@username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={profile.linkedin}
                    onChange={e =>
                      setProfile({ ...profile, linkedin: e.target.value })
                    }
                    placeholder="linkedin.com/in/username"
                  />
                </div>
              </div>

              <Button onClick={handleProfileSave}>Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <StaggeredContainer>
            <StaggeredItem>
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Sharing</CardTitle>
                  <CardDescription>
                    Control who can see your information and share your portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Public Profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Make your portfolio visible to everyone
                      </p>
                    </div>
                    <Switch
                      checked={privacy.publicProfile}
                      onCheckedChange={checked =>
                        setPrivacy({ ...privacy, publicProfile: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your email address on your portfolio
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showEmail}
                      onCheckedChange={checked =>
                        setPrivacy({ ...privacy, showEmail: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Location</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your location on your portfolio
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showLocation}
                      onCheckedChange={checked =>
                        setPrivacy({ ...privacy, showLocation: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Search Engine Indexing</Label>
                      <p className="text-sm text-muted-foreground">
                        Let search engines index your portfolio
                      </p>
                    </div>
                    <Switch
                      checked={privacy.allowIndexing}
                      onCheckedChange={checked =>
                        setPrivacy({ ...privacy, allowIndexing: checked })
                      }
                    />
                  </div>

                  <Button onClick={handlePrivacySave}>Save Privacy Settings</Button>
                </CardContent>
              </Card>
            </StaggeredItem>
            
            <StaggeredItem>
              <PortfolioSharing 
                portfolioId={session?.user?.id || 'demo'}
                portfolioUrl={portfolioUrl}
                isPublic={privacy.publicProfile}
                onVisibilityChange={handleVisibilityChange}
              />
            </StaggeredItem>
          </StaggeredContainer>
        </TabsContent>

        <TabsContent value="theme" className="mt-6">
          <AnimatedContainer>
            <ThemeSystem 
              currentTheme={theme}
              onThemeChange={handleThemeChange}
            />
          </AnimatedContainer>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <AnimatedContainer>
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>
                  Connect your accounts and services to enhance your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StaggeredContainer className="space-y-4">
                  <StaggeredItem>
                    <ScaleOnHover className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">GitHub</h3>
                        <p className="text-sm text-muted-foreground">Connected - Import repositories and showcase your projects</p>
                      </div>
                      <FeatureTooltip
                        title="GitHub Integration"
                        description="Disconnect your GitHub account to stop importing repositories"
                      >
                        <Button variant="outline">Disconnect</Button>
                      </FeatureTooltip>
                    </ScaleOnHover>
                  </StaggeredItem>

                  <StaggeredItem>
                    <ScaleOnHover className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Dev.to</h3>
                        <p className="text-sm text-muted-foreground">Not connected - Sync your blog posts automatically</p>
                      </div>
                      <FeatureTooltip
                        title="Dev.to Integration"
                        description="Connect your Dev.to account to automatically import your blog posts"
                      >
                        <Button variant="outline">Connect</Button>
                      </FeatureTooltip>
                    </ScaleOnHover>
                  </StaggeredItem>

                  <StaggeredItem>
                    <ScaleOnHover className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Medium</h3>
                        <p className="text-sm text-muted-foreground">Not connected - Import your Medium articles</p>
                      </div>
                      <FeatureTooltip
                        title="Medium Integration"
                        description="Connect your Medium account to showcase your articles"
                      >
                        <Button variant="outline">Connect</Button>
                      </FeatureTooltip>
                    </ScaleOnHover>
                  </StaggeredItem>
                </StaggeredContainer>
              </CardContent>
            </Card>
          </AnimatedContainer>
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          <StaggeredContainer>
            <StaggeredItem>
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>Export and manage your portfolio data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScaleOnHover className="p-4 border rounded-lg">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium">Export Portfolio Data</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Download a complete copy of your portfolio data including projects, skills, and settings
                      </p>
                      <FeatureTooltip
                        title="Export Data"
                        description="Download your portfolio data as a JSON file for backup or migration purposes"
                      >
                        <Button variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Export Portfolio
                        </Button>
                      </FeatureTooltip>
                    </div>
                  </ScaleOnHover>
                </CardContent>
              </Card>
            </StaggeredItem>

            <StaggeredItem>
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions that will permanently affect your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScaleOnHover className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-600" />
                        <h3 className="font-medium text-red-600 dark:text-red-400">Delete Account</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <FeatureTooltip
                        title="Delete Account"
                        description="This will permanently delete your account, portfolio, and all data. This action cannot be reversed."
                      >
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </FeatureTooltip>
                    </div>
                  </ScaleOnHover>
                </CardContent>
              </Card>
            </StaggeredItem>
          </StaggeredContainer>
        </TabsContent>
      </Tabs>
    </AnimatedContainer>
  );
}
