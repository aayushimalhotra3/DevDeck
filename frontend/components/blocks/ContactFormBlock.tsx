'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Settings, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Globe,
  Linkedin,
  Twitter,
  Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select type
  enabled: boolean;
}

interface ContactFormSettings {
  title: string;
  description?: string;
  submitButtonText: string;
  successMessage: string;
  emailNotifications: boolean;
  autoReply: boolean;
  autoReplyMessage?: string;
  fields: FormField[];
}

interface ContactFormBlockProps {
  contactInfo: ContactInfo;
  settings: ContactFormSettings;
  isEditing?: boolean;
  onUpdateContactInfo?: (info: ContactInfo) => void;
  onUpdateSettings?: (settings: ContactFormSettings) => void;
}

const defaultFields: FormField[] = [
  {
    id: 'name',
    label: 'Full Name',
    type: 'text',
    required: true,
    placeholder: 'Enter your full name',
    enabled: true
  },
  {
    id: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    placeholder: 'Enter your email address',
    enabled: true
  },
  {
    id: 'subject',
    label: 'Subject',
    type: 'text',
    required: true,
    placeholder: 'What is this about?',
    enabled: true
  },
  {
    id: 'message',
    label: 'Message',
    type: 'textarea',
    required: true,
    placeholder: 'Tell me about your project or inquiry...',
    enabled: true
  },
  {
    id: 'budget',
    label: 'Project Budget',
    type: 'select',
    required: false,
    options: ['Under $1,000', '$1,000 - $5,000', '$5,000 - $10,000', '$10,000+', 'Not sure'],
    enabled: false
  }
];

const defaultSettings: ContactFormSettings = {
  title: 'Get In Touch',
  description: 'Have a project in mind? Let\'s discuss how we can work together.',
  submitButtonText: 'Send Message',
  successMessage: 'Thank you for your message! I\'ll get back to you soon.',
  emailNotifications: true,
  autoReply: true,
  autoReplyMessage: 'Thank you for reaching out! I\'ve received your message and will get back to you within 24 hours.',
  fields: defaultFields
};

const ContactFormBlock: React.FC<ContactFormBlockProps> = ({
  contactInfo = {},
  settings = defaultSettings,
  isEditing = false,
  onUpdateContactInfo,
  onUpdateSettings
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const enabledFields = settings.fields.filter(f => f.enabled);
    const requiredFields = enabledFields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => !formData[f.id]?.trim());
    
    if (missingFields.length > 0) {
      toast({
        title: 'Missing Required Fields',
        description: `Please fill in: ${missingFields.map(f => f.label).join(', ')}`,
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate form submission - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      setFormData({});
      
      toast({
        title: 'Message Sent!',
        description: settings.successMessage
      });
    } catch (error) {
      toast({
        title: 'Failed to Send',
        description: 'There was an error sending your message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateContactInfo = (field: keyof ContactInfo, value: string) => {
    const updated = { ...contactInfo, [field]: value };
    onUpdateContactInfo?.(updated);
  };

  const updateSettings = (updates: Partial<ContactFormSettings>) => {
    const updated = { ...settings, ...updates };
    onUpdateSettings?.(updated);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    const updatedFields = settings.fields.map(f => 
      f.id === fieldId ? { ...f, ...updates } : f
    );
    updateSettings({ fields: updatedFields });
  };

  const renderFormField = (field: FormField) => {
    if (!field.enabled && !isEditing) return null;

    const value = formData[field.id] || '';
    const isDisabled = !field.enabled && isEditing;

    return (
      <div key={field.id} className={`space-y-2 ${isDisabled ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between">
          <Label htmlFor={field.id} className="flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </Label>
          {isEditing && (
            <div className="flex items-center gap-2">
              <Switch
                checked={field.enabled}
                onCheckedChange={(enabled) => updateField(field.id, { enabled })}
                size="sm"
              />
              <span className="text-xs text-gray-500">
                {field.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          )}
        </div>
        
        {field.type === 'textarea' ? (
          <Textarea
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            disabled={isDisabled || isSubmitting}
            rows={4}
          />
        ) : field.type === 'select' ? (
          <Select
            value={value}
            onValueChange={(val) => handleInputChange(field.id, val)}
            disabled={isDisabled || isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={field.id}
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            disabled={isDisabled || isSubmitting}
          />
        )}
      </div>
    );
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'github': return <Github className="w-4 h-4" />;
      case 'website': return <Globe className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              {isEditing ? (
                <Input
                  value={settings.title}
                  onChange={(e) => updateSettings({ title: e.target.value })}
                  className="text-lg font-semibold border-none p-0 h-auto"
                  placeholder="Contact form title"
                />
              ) : (
                settings.title
              )}
            </CardTitle>
            {settings.description && (
              <p className="text-sm text-gray-600 mt-1">
                {isEditing ? (
                  <Textarea
                    value={settings.description}
                    onChange={(e) => updateSettings({ description: e.target.value })}
                    placeholder="Contact form description"
                    rows={2}
                    className="text-sm resize-none"
                  />
                ) : (
                  settings.description
                )}
              </p>
            )}
          </div>
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4 mr-2" />
              {showSettings ? 'Hide' : 'Settings'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Settings Panel */}
          <AnimatePresence>
            {isEditing && showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <h3 className="font-medium mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactInfo.email || ''}
                      onChange={(e) => updateContactInfo('email', e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={contactInfo.phone || ''}
                      onChange={(e) => updateContactInfo('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={contactInfo.location || ''}
                      onChange={(e) => updateContactInfo('location', e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={contactInfo.website || ''}
                      onChange={(e) => updateContactInfo('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <h3 className="font-medium mb-4">Form Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive emails when someone submits the form</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Reply</Label>
                      <p className="text-sm text-gray-600">Send automatic confirmation to submitters</p>
                    </div>
                    <Switch
                      checked={settings.autoReply}
                      onCheckedChange={(checked) => updateSettings({ autoReply: checked })}
                    />
                  </div>
                  {settings.autoReply && (
                    <div>
                      <Label>Auto Reply Message</Label>
                      <Textarea
                        value={settings.autoReplyMessage || ''}
                        onChange={(e) => updateSettings({ autoReplyMessage: e.target.value })}
                        placeholder="Thank you message..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Contact Info Display */}
          {!isEditing && Object.keys(contactInfo).some(key => contactInfo[key as keyof ContactInfo]) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              {contactInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <a href={`mailto:${contactInfo.email}`} className="text-blue-600 hover:underline">
                    {contactInfo.email}
                  </a>
                </div>
              )}
              {contactInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <a href={`tel:${contactInfo.phone}`} className="text-blue-600 hover:underline">
                    {contactInfo.phone}
                  </a>
                </div>
              )}
              {contactInfo.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span>{contactInfo.location}</span>
                </div>
              )}
              {contactInfo.website && (
                <div className="flex items-center gap-2">
                  {getSocialIcon('website')}
                  <a href={contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Website
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Contact Form */}
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-600 mb-4">{settings.successMessage}</p>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
              >
                Send Another Message
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {settings.fields.map(renderFormField)}
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    {settings.submitButtonText}
                  </div>
                )}
              </Button>
            </form>
          )}

          {/* Privacy Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Privacy Notice</p>
              <p className="text-blue-700">
                Your information will be kept confidential and used only to respond to your inquiry.
                We respect your privacy and will never share your details with third parties.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactFormBlock;