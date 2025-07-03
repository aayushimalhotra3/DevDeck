'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Star, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

interface TestimonialsBlockProps {
  testimonials: Testimonial[];
  isEditing?: boolean;
  onUpdate?: (testimonials: Testimonial[]) => void;
}

const TestimonialsBlock: React.FC<TestimonialsBlockProps> = ({
  testimonials = [],
  isEditing = false,
  onUpdate,
}) => {
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      name: '',
      role: '',
      company: '',
      content: '',
      rating: 5,
    };
    setEditingTestimonial(newTestimonial);
    setShowAddForm(true);
  };

  const handleSaveTestimonial = (testimonial: Testimonial) => {
    if (!testimonial.name || !testimonial.content) return;

    const updatedTestimonials = testimonials.find(t => t.id === testimonial.id)
      ? testimonials.map(t => (t.id === testimonial.id ? testimonial : t))
      : [...testimonials, testimonial];

    onUpdate?.(updatedTestimonials);
    setEditingTestimonial(null);
    setShowAddForm(false);
  };

  const handleDeleteTestimonial = (id: string) => {
    const updatedTestimonials = testimonials.filter(t => t.id !== id);
    onUpdate?.(updatedTestimonials);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const TestimonialForm = ({
    testimonial,
    onSave,
    onCancel,
  }: {
    testimonial: Testimonial;
    onSave: (testimonial: Testimonial) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(testimonial);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              placeholder="Role"
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
            />
          </div>
          <Input
            placeholder="Company"
            value={formData.company}
            onChange={e =>
              setFormData({ ...formData, company: e.target.value })
            }
          />
          <Textarea
            placeholder="Testimonial content..."
            value={formData.content}
            onChange={e =>
              setFormData({ ...formData, content: e.target.value })
            }
            rows={4}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Rating:</span>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 cursor-pointer transition-colors ${
                    i < formData.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                  onClick={() => setFormData({ ...formData, rating: i + 1 })}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onSave(formData)}
              disabled={!formData.name || !formData.content}
            >
              Save
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Quote className="w-5 h-5" />
            Testimonials
          </CardTitle>
          {isEditing && (
            <Button onClick={handleAddTestimonial} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <AnimatePresence>
            {showAddForm && editingTestimonial && (
              <TestimonialForm
                testimonial={editingTestimonial}
                onSave={handleSaveTestimonial}
                onCancel={() => {
                  setShowAddForm(false);
                  setEditingTestimonial(null);
                }}
              />
            )}
          </AnimatePresence>

          {testimonials.length === 0 && !showAddForm ? (
            <div className="text-center py-8 text-gray-500">
              <Quote className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No testimonials yet.</p>
              {isEditing && (
                <p className="text-sm mt-2">
                  Click "Add Testimonial" to get started.
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <AnimatePresence>
                {testimonials.map(testimonial => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative group"
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        {isEditing && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingTestimonial(testimonial);
                                  setShowAddForm(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleDeleteTestimonial(testimonial.id)
                                }
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-1 mb-3">
                          {renderStars(testimonial.rating)}
                        </div>

                        <blockquote className="text-gray-700 mb-4 italic">
                          "{testimonial.content}"
                        </blockquote>

                        <div className="flex items-center gap-3">
                          {testimonial.avatar && (
                            <img
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">
                              {testimonial.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {testimonial.role}
                              {testimonial.company && (
                                <>
                                  {' at '}
                                  <Badge variant="secondary" className="ml-1">
                                    {testimonial.company}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialsBlock;
