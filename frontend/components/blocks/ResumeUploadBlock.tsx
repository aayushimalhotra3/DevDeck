'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Download, X, Eye, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

interface ResumeFile {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadDate: string;
  type: 'pdf' | 'doc' | 'docx';
  isDefault?: boolean;
}

interface ResumeUploadBlockProps {
  resumes: ResumeFile[];
  isEditing?: boolean;
  onUpdate?: (resumes: ResumeFile[]) => void;
  maxFileSize?: number; // in MB
}

const ResumeUploadBlock: React.FC<ResumeUploadBlockProps> = ({
  resumes = [],
  isEditing = false,
  onUpdate,
  maxFileSize = 5,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const allowedExtensions = ['.pdf', '.doc', '.docx'];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (fileName: string): 'pdf' | 'doc' | 'docx' => {
    const extension = fileName.toLowerCase().split('.').pop();
    if (extension === 'pdf') return 'pdf';
    if (extension === 'docx') return 'docx';
    return 'doc';
  };

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a PDF, DOC, or DOCX file.';
    }
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB.`;
    }
    return null;
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);

    if (validationError) {
      toast({
        title: 'Upload Error',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Simulate file upload - replace with actual upload logic
      const formData = new FormData();
      formData.append('resume', file);

      // Mock upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newResume: ResumeFile = {
        id: Date.now().toString(),
        name: file.name,
        url: URL.createObjectURL(file), // Replace with actual uploaded file URL
        size: file.size,
        uploadDate: new Date().toISOString(),
        type: getFileType(file.name),
        isDefault: resumes.length === 0,
      };

      const updatedResumes = [...resumes, newResume];
      onUpdate?.(updatedResumes);

      toast({
        title: 'Upload Successful',
        description: 'Your resume has been uploaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = (id: string) => {
    const updatedResumes = resumes.filter(r => r.id !== id);
    // If we deleted the default resume, make the first remaining one default
    if (updatedResumes.length > 0 && !updatedResumes.some(r => r.isDefault)) {
      updatedResumes[0].isDefault = true;
    }
    onUpdate?.(updatedResumes);
  };

  const handleSetDefault = (id: string) => {
    const updatedResumes = resumes.map(r => ({
      ...r,
      isDefault: r.id === id,
    }));
    onUpdate?.(updatedResumes);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const getFileIcon = (type: string) => {
    return <FileText className="w-8 h-8 text-red-500" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resume
          </CardTitle>
          {isEditing && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Upload Area */}
          {isEditing && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={allowedExtensions.join(',')}
                onChange={e => handleFileUpload(e.target.files)}
                className="hidden"
              />

              {uploading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-600">Uploading resume...</p>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your resume here, or{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, DOC, DOCX (max {maxFileSize}MB)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Resume List */}
          {resumes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No resume uploaded yet.</p>
              {isEditing && (
                <p className="text-sm mt-2">
                  Upload your resume to showcase your experience.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {resumes.map(resume => (
                  <motion.div
                    key={resume.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="relative group"
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            {getFileIcon(resume.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900 truncate">
                                {resume.name}
                              </h3>
                              {resume.isDefault && (
                                <Badge variant="default" className="text-xs">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{formatFileSize(resume.size)}</span>
                              <span>
                                Uploaded{' '}
                                {new Date(
                                  resume.uploadDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(resume.url, '_blank')}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = resume.url;
                                link.download = resume.name;
                                link.click();
                              }}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>

                            {isEditing && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!resume.isDefault && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSetDefault(resume.id)}
                                  >
                                    Set Default
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteResume(resume.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Info */}
          {resumes.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Resume Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Keep your resume updated with latest experience</li>
                  <li>Use a clean, professional format</li>
                  <li>Tailor your resume for different opportunities</li>
                  <li>The default resume will be shown prominently</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeUploadBlock;
