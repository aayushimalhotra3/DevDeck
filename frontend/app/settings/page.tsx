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
import { Copy, Share2, QrCode, ExternalLink, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { QRCodeDialog } from '@/components/ui/qr-code-dialog';
import { useToast } from '@/components/ui/use-toast';

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
    colorScheme: 'blue',
    fontFamily: 'inter',
    borderRadius: 'medium',
  });
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
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

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
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control who can see your information
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

              <div className="border-t pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Portfolio URL</h3>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={portfolioUrl}
                        readOnly
                        className="flex-1"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleCopyUrl}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(portfolioUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Share Portfolio</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSocialShare('twitter')}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share on Twitter
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSocialShare('linkedin')}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share on LinkedIn
                      </Button>
                      <QRCodeDialog url={portfolioUrl}>
                        <Button variant="outline" size="sm">
                          <QrCode className="h-4 w-4 mr-2" />
                          Generate QR Code
                        </Button>
                      </QRCodeDialog>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handlePrivacySave}>Save Privacy Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Customize the appearance of your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose between light, dark, or system theme
                  </p>
                </div>
                <ThemeToggle />
              </div>

              <div className="space-y-3">
                <Label>Color Scheme</Label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { name: 'Blue', value: 'blue', color: 'bg-blue-500' },
                    { name: 'Purple', value: 'purple', color: 'bg-purple-500' },
                    { name: 'Green', value: 'green', color: 'bg-green-500' },
                    { name: 'Orange', value: 'orange', color: 'bg-orange-500' },
                    { name: 'Red', value: 'red', color: 'bg-red-500' },
                    { name: 'Pink', value: 'pink', color: 'bg-pink-500' },
                  ].map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setTheme({ ...theme, colorScheme: color.value })}
                      className={`w-12 h-12 rounded-lg ${color.color} border-2 ${
                        theme.colorScheme === color.value
                          ? 'border-foreground'
                          : 'border-transparent'
                      } hover:scale-105 transition-transform`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Font Family</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { name: 'Inter', value: 'inter', preview: 'The quick brown fox jumps' },
                    { name: 'Roboto', value: 'roboto', preview: 'The quick brown fox jumps' },
                    { name: 'Open Sans', value: 'opensans', preview: 'The quick brown fox jumps' },
                    { name: 'Poppins', value: 'poppins', preview: 'The quick brown fox jumps' },
                  ].map((font) => (
                    <button
                      key={font.value}
                      onClick={() => setTheme({ ...theme, fontFamily: font.value })}
                      className={`p-3 text-left border rounded-lg hover:bg-accent ${
                        theme.fontFamily === font.value
                          ? 'border-primary bg-accent'
                          : 'border-border'
                      }`}
                    >
                      <div className="font-medium">{font.name}</div>
                      <div className="text-sm text-muted-foreground">{font.preview}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Border Radius</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'None', value: 'none', class: 'rounded-none' },
                    { name: 'Small', value: 'small', class: 'rounded-sm' },
                    { name: 'Medium', value: 'medium', class: 'rounded-md' },
                    { name: 'Large', value: 'large', class: 'rounded-lg' },
                    { name: 'Extra Large', value: 'xl', class: 'rounded-xl' },
                    { name: 'Full', value: 'full', class: 'rounded-full' },
                  ].map((radius) => (
                    <button
                      key={radius.value}
                      onClick={() => setTheme({ ...theme, borderRadius: radius.value })}
                      className={`p-3 text-center border hover:bg-accent ${
                        theme.borderRadius === radius.value
                          ? 'border-primary bg-accent'
                          : 'border-border'
                      } ${radius.class}`}
                    >
                      <div className="text-sm font-medium">{radius.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={() => console.log('Save theme settings')}>Save Theme Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect your accounts and services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">GitHub</h3>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </div>
                <Button variant="outline">Disconnect</Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Dev.to</h3>
                  <p className="text-sm text-muted-foreground">Not connected</p>
                </div>
                <Button variant="outline">Connect</Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Medium</h3>
                  <p className="text-sm text-muted-foreground">Not connected</p>
                </div>
                <Button variant="outline">Connect</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account and data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Export Data</h3>
                <p className="text-sm text-muted-foreground">
                  Download a copy of your portfolio data
                </p>
                <Button variant="outline">Export Portfolio</Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-red-600">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
