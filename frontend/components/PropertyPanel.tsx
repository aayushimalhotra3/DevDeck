'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, User, Code, Briefcase, BookOpen, MessageSquare, Mail, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PortfolioBlock {
  id: string;
  type: 'bio' | 'skills' | 'projects' | 'blog' | 'testimonials' | 'contact' | 'resume';
  content: Record<string, any>;
  position: { x: number; y: number };
}

interface PropertyPanelProps {
  block?: PortfolioBlock;
  onUpdateBlock: (content: Record<string, any>) => void;
  onClose: () => void;
}

const blockIcons = {
  bio: User,
  skills: Code,
  projects: Briefcase,
  blog: BookOpen,
  testimonials: MessageSquare,
  contact: Mail,
  resume: FileText,
};

const blockLabels = {
  bio: 'Bio Block',
  skills: 'Skills Block',
  projects: 'Projects Block',
  blog: 'Blog Block',
  testimonials: 'Testimonials Block',
  contact: 'Contact Form',
  resume: 'Resume Block',
};

export function PropertyPanel({ block, onUpdateBlock, onClose }: PropertyPanelProps) {
  const [localContent, setLocalContent] = useState(block?.content || {});

  useEffect(() => {
    setLocalContent(block?.content || {});
  }, [block]);

  if (!block) {
    return null;
  }

  const Icon = blockIcons[block.type];

  const handleContentChange = (key: string, value: any) => {
    const updatedContent = { ...localContent, [key]: value };
    setLocalContent(updatedContent);
    onUpdateBlock(updatedContent);
  };

  const renderBioProperties = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={localContent.name || ''}
          onChange={(e) => handleContentChange('name', e.target.value)}
          placeholder="Your full name"
        />
      </div>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={localContent.title || ''}
          onChange={(e) => handleContentChange('title', e.target.value)}
          placeholder="Your professional title"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={localContent.description || ''}
          onChange={(e) => handleContentChange('description', e.target.value)}
          placeholder="Tell us about yourself..."
          rows={4}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={localContent.email || ''}
          onChange={(e) => handleContentChange('email', e.target.value)}
          placeholder="your.email@example.com"
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={localContent.location || ''}
          onChange={(e) => handleContentChange('location', e.target.value)}
          placeholder="City, Country"
        />
      </div>
    </div>
  );

  const renderSkillsProperties = () => {
    const skills = localContent.skills || [];
    
    const addSkill = () => {
      const newSkills = [...skills, { name: '', level: 'Beginner' }];
      handleContentChange('skills', newSkills);
    };

    const updateSkill = (index: number, field: string, value: string) => {
      const newSkills = skills.map((skill: any, i: number) => 
        i === index ? { ...skill, [field]: value } : skill
      );
      handleContentChange('skills', newSkills);
    };

    const removeSkill = (index: number) => {
      const newSkills = skills.filter((_: any, i: number) => i !== index);
      handleContentChange('skills', newSkills);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Skills</Label>
          <Button size="sm" onClick={addSkill}>
            Add Skill
          </Button>
        </div>
        <div className="space-y-3">
          {skills.map((skill: any, index: number) => (
            <Card key={index} className="p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Input
                    value={skill.name || ''}
                    onChange={(e) => updateSkill(index, 'name', e.target.value)}
                    placeholder="Skill name"
                    className="flex-1 mr-2"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSkill(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <select
                  value={skill.level || 'Beginner'}
                  onChange={(e) => updateSkill(index, 'level', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderProjectsProperties = () => {
    const projects = localContent.projects || [];
    
    const addProject = () => {
      const newProjects = [...projects, { title: '', description: '', link: '', tech: [] }];
      handleContentChange('projects', newProjects);
    };

    const updateProject = (index: number, field: string, value: any) => {
      const newProjects = projects.map((project: any, i: number) => 
        i === index ? { ...project, [field]: value } : project
      );
      handleContentChange('projects', newProjects);
    };

    const removeProject = (index: number) => {
      const newProjects = projects.filter((_: any, i: number) => i !== index);
      handleContentChange('projects', newProjects);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Projects</Label>
          <Button size="sm" onClick={addProject}>
            Add Project
          </Button>
        </div>
        <div className="space-y-4">
          {projects.map((project: any, index: number) => (
            <Card key={index} className="p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Project {index + 1}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeProject(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  value={project.title || ''}
                  onChange={(e) => updateProject(index, 'title', e.target.value)}
                  placeholder="Project title"
                />
                <Textarea
                  value={project.description || ''}
                  onChange={(e) => updateProject(index, 'description', e.target.value)}
                  placeholder="Project description"
                  rows={3}
                />
                <Input
                  value={project.link || ''}
                  onChange={(e) => updateProject(index, 'link', e.target.value)}
                  placeholder="Project URL"
                />
                <Input
                  value={Array.isArray(project.tech) ? project.tech.join(', ') : ''}
                  onChange={(e) => updateProject(index, 'tech', e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean))}
                  placeholder="Technologies (comma-separated)"
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderBlogProperties = () => {
    const posts = localContent.posts || [];
    
    const addPost = () => {
      const newPosts = [...posts, { title: '', excerpt: '', link: '', date: '' }];
      handleContentChange('posts', newPosts);
    };

    const updatePost = (index: number, field: string, value: string) => {
      const newPosts = posts.map((post: any, i: number) => 
        i === index ? { ...post, [field]: value } : post
      );
      handleContentChange('posts', newPosts);
    };

    const removePost = (index: number) => {
      const newPosts = posts.filter((_: any, i: number) => i !== index);
      handleContentChange('posts', newPosts);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Blog Posts</Label>
          <Button size="sm" onClick={addPost}>
            Add Post
          </Button>
        </div>
        <div className="space-y-4">
          {posts.map((post: any, index: number) => (
            <Card key={index} className="p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Post {index + 1}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePost(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  value={post.title || ''}
                  onChange={(e) => updatePost(index, 'title', e.target.value)}
                  placeholder="Post title"
                />
                <Textarea
                  value={post.excerpt || ''}
                  onChange={(e) => updatePost(index, 'excerpt', e.target.value)}
                  placeholder="Post excerpt"
                  rows={2}
                />
                <Input
                  value={post.link || ''}
                  onChange={(e) => updatePost(index, 'link', e.target.value)}
                  placeholder="Post URL"
                />
                <Input
                  type="date"
                  value={post.date || ''}
                  onChange={(e) => updatePost(index, 'date', e.target.value)}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderTestimonialsProperties = () => {
    const testimonials = localContent.testimonials || [];
    
    const addTestimonial = () => {
      const newTestimonials = [...testimonials, { name: '', role: '', company: '', content: '', avatar: '' }];
      handleContentChange('testimonials', newTestimonials);
    };

    const updateTestimonial = (index: number, field: string, value: string) => {
      const newTestimonials = testimonials.map((testimonial: any, i: number) => 
        i === index ? { ...testimonial, [field]: value } : testimonial
      );
      handleContentChange('testimonials', newTestimonials);
    };

    const removeTestimonial = (index: number) => {
      const newTestimonials = testimonials.filter((_: any, i: number) => i !== index);
      handleContentChange('testimonials', newTestimonials);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Testimonials</Label>
          <Button size="sm" onClick={addTestimonial}>
            Add Testimonial
          </Button>
        </div>
        <div className="space-y-4">
          {testimonials.map((testimonial: any, index: number) => (
            <Card key={index} className="p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Testimonial {index + 1}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTestimonial(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  value={testimonial.name || ''}
                  onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                  placeholder="Client name"
                />
                <Input
                  value={testimonial.role || ''}
                  onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                  placeholder="Job title"
                />
                <Input
                  value={testimonial.company || ''}
                  onChange={(e) => updateTestimonial(index, 'company', e.target.value)}
                  placeholder="Company name"
                />
                <Textarea
                  value={testimonial.content || ''}
                  onChange={(e) => updateTestimonial(index, 'content', e.target.value)}
                  placeholder="Testimonial content"
                  rows={3}
                />
                <Input
                  value={testimonial.avatar || ''}
                  onChange={(e) => updateTestimonial(index, 'avatar', e.target.value)}
                  placeholder="Avatar URL (optional)"
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderContactProperties = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="contact-title">Form Title</Label>
          <Input
            id="contact-title"
            value={localContent.title || ''}
            onChange={(e) => handleContentChange('title', e.target.value)}
            placeholder="Get in Touch"
          />
        </div>
        <div>
          <Label htmlFor="contact-description">Description</Label>
          <Textarea
            id="contact-description"
            value={localContent.description || ''}
            onChange={(e) => handleContentChange('description', e.target.value)}
            placeholder="Feel free to reach out for collaborations or just a friendly hello!"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="contact-email">Your Email</Label>
          <Input
            id="contact-email"
            type="email"
            value={localContent.email || ''}
            onChange={(e) => handleContentChange('email', e.target.value)}
            placeholder="your.email@example.com"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="show-phone"
            checked={localContent.showPhone || false}
            onChange={(e) => handleContentChange('showPhone', e.target.checked)}
          />
          <Label htmlFor="show-phone">Include phone field</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="show-company"
            checked={localContent.showCompany || false}
            onChange={(e) => handleContentChange('showCompany', e.target.checked)}
          />
          <Label htmlFor="show-company">Include company field</Label>
        </div>
      </div>
    );
  };

  const renderResumeProperties = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="resume-title">Section Title</Label>
          <Input
            id="resume-title"
            value={localContent.title || ''}
            onChange={(e) => handleContentChange('title', e.target.value)}
            placeholder="Resume"
          />
        </div>
        <div>
          <Label htmlFor="resume-description">Description</Label>
          <Textarea
            id="resume-description"
            value={localContent.description || ''}
            onChange={(e) => handleContentChange('description', e.target.value)}
            placeholder="Download my resume to learn more about my experience"
            rows={2}
          />
        </div>
        <div>
          <Label htmlFor="resume-url">Resume URL</Label>
          <Input
            id="resume-url"
            value={localContent.resumeUrl || ''}
            onChange={(e) => handleContentChange('resumeUrl', e.target.value)}
            placeholder="https://example.com/resume.pdf"
          />
        </div>
        <div>
          <Label htmlFor="resume-filename">File Name</Label>
          <Input
            id="resume-filename"
            value={localContent.filename || ''}
            onChange={(e) => handleContentChange('filename', e.target.value)}
            placeholder="John_Doe_Resume.pdf"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="show-preview"
            checked={localContent.showPreview || false}
            onChange={(e) => handleContentChange('showPreview', e.target.checked)}
          />
          <Label htmlFor="show-preview">Show preview button</Label>
        </div>
      </div>
    );
  };

  const renderProperties = () => {
    switch (block.type) {
      case 'bio':
        return renderBioProperties();
      case 'skills':
        return renderSkillsProperties();
      case 'projects':
        return renderProjectsProperties();
      case 'blog':
        return renderBlogProperties();
      case 'testimonials':
        return renderTestimonialsProperties();
      case 'contact':
        return renderContactProperties();
      case 'resume':
        return renderResumeProperties();
      default:
        return <p className="text-muted-foreground">No properties available for this block type.</p>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5" />
          <div>
            <h3 className="font-medium">{blockLabels[block.type]}</h3>
            <p className="text-sm text-muted-foreground">Block Properties</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {renderProperties()}
      </div>
    </div>
  );
}