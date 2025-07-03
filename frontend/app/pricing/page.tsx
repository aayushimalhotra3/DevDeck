'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import Navigation from '@/components/Navigation';
import {
  Check,
  X,
  Star,
  Zap,
  Crown,
  Github,
  Globe,
  BarChart3,
  Shield,
  Headphones,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const PricingPage: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      price: { monthly: 0, annual: 0 },
      badge: null,
      features: [
        { name: '1 Portfolio', included: true },
        { name: 'Basic Templates', included: true },
        { name: 'GitHub Integration', included: true },
        { name: 'DevDeck Subdomain', included: true },
        { name: 'Basic Analytics', included: true },
        { name: 'Community Support', included: true },
        { name: 'Custom Domain', included: false },
        { name: 'Advanced Analytics', included: false },
        { name: 'Premium Templates', included: false },
        { name: 'Priority Support', included: false },
        { name: 'Custom Branding', included: false },
        { name: 'Team Collaboration', included: false },
      ],
      cta: 'Get Started Free',
      popular: false,
      color: 'border-gray-200',
    },
    {
      name: 'Pro',
      description: 'For serious developers',
      price: { monthly: 9, annual: 7 },
      badge: 'Most Popular',
      features: [
        { name: '5 Portfolios', included: true },
        { name: 'All Templates', included: true },
        { name: 'GitHub Integration', included: true },
        { name: 'Custom Domain', included: true },
        { name: 'Advanced Analytics', included: true },
        { name: 'Premium Templates', included: true },
        { name: 'Priority Support', included: true },
        { name: 'Custom Branding', included: true },
        { name: 'SEO Optimization', included: true },
        { name: 'Team Collaboration', included: false },
        { name: 'White-label Solution', included: false },
        { name: 'API Access', included: false },
      ],
      cta: 'Start Pro Trial',
      popular: true,
      color: 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50',
    },
    {
      name: 'Team',
      description: 'For teams and organizations',
      price: { monthly: 29, annual: 24 },
      badge: 'Best Value',
      features: [
        { name: 'Unlimited Portfolios', included: true },
        { name: 'All Templates', included: true },
        { name: 'GitHub Integration', included: true },
        { name: 'Custom Domain', included: true },
        { name: 'Advanced Analytics', included: true },
        { name: 'Premium Templates', included: true },
        { name: 'Priority Support', included: true },
        { name: 'Custom Branding', included: true },
        { name: 'Team Collaboration', included: true },
        { name: 'White-label Solution', included: true },
        { name: 'API Access', included: true },
        { name: 'Dedicated Support', included: true },
      ],
      cta: 'Start Team Trial',
      popular: false,
      color: 'border-purple-500',
    },
  ];

  const faqs = [
    {
      question: 'Can I change my plan at any time?',
      answer:
        'Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
    },
    {
      question: 'What happens to my portfolios if I downgrade?',
      answer:
        'Your portfolios will remain active, but some premium features may be disabled. You can always upgrade again to restore full functionality.',
    },
    {
      question: 'Do you offer refunds?',
      answer:
        "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact us for a full refund.",
    },
    {
      question: 'Can I use my own domain?',
      answer:
        'Yes! Pro and Team plans include custom domain support. You can connect your own domain or subdomain to your portfolio.',
    },
    {
      question: 'Is there a student discount?',
      answer:
        'Yes! We offer a 50% discount for students with a valid .edu email address. Contact support to apply for the discount.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards, PayPal, and bank transfers for annual plans. All payments are processed securely.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          className="container mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">
              <Sparkles className="w-3 h-3 mr-1" />
              30-Day Money Back Guarantee
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Simple, Transparent Pricing
          </motion.h1>

          <motion.p
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            Choose the perfect plan for your needs. Start free and upgrade as
            you grow. All plans include our core features with no hidden fees.
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-4 mb-12"
            variants={itemVariants}
          >
            <span
              className={`text-sm ${!isAnnual ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}
            >
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-blue-600"
            />
            <span
              className={`text-sm ${isAnnual ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}
            >
              Annual
            </span>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              Save 20%
            </Badge>
          </motion.div>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {plans.map((plan, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card
                  className={`h-full relative ${plan.color} ${plan.popular ? 'scale-105' : ''} transition-all duration-300 hover:shadow-xl`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8">
                    <div className="flex items-center justify-center mb-4">
                      {plan.name === 'Free' && (
                        <Zap className="w-8 h-8 text-gray-600" />
                      )}
                      {plan.name === 'Pro' && (
                        <Star className="w-8 h-8 text-blue-600" />
                      )}
                      {plan.name === 'Team' && (
                        <Crown className="w-8 h-8 text-purple-600" />
                      )}
                    </div>
                    <CardTitle className="text-2xl font-bold">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-6">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-foreground">
                          ${isAnnual ? plan.price.annual : plan.price.monthly}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          {plan.price.monthly > 0 ? '/month' : ''}
                        </span>
                      </div>
                      {isAnnual && plan.price.monthly > 0 && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Billed annually (${plan.price.annual * 12}/year)
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-center gap-3"
                        >
                          {feature.included ? (
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                          <span
                            className={`text-sm ${feature.included ? 'text-foreground' : 'text-muted-foreground'}`}
                          >
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6">
                      <Link
                        href={
                          plan.name === 'Free'
                            ? '/auth/signin'
                            : '/auth/signin?plan=' + plan.name.toLowerCase()
                        }
                      >
                        <Button
                          className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                          variant={plan.popular ? 'default' : 'outline'}
                        >
                          {plan.cta}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4 text-foreground"
              variants={itemVariants}
            >
              Why Choose DevDeck?
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Built specifically for developers with features that matter most.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {[
              {
                icon: <Github className="w-8 h-8" />,
                title: 'GitHub Integration',
                description:
                  'Seamlessly sync your repositories and showcase your coding activity.',
                color: 'bg-gray-800',
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: 'Custom Domains',
                description:
                  'Use your own domain for a professional web presence.',
                color: 'bg-blue-600',
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: 'Advanced Analytics',
                description:
                  'Track portfolio performance with detailed insights and metrics.',
                color: 'bg-green-600',
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Enterprise Security',
                description:
                  'Bank-level security with SSL encryption and data protection.',
                color: 'bg-red-600',
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div
                      className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center text-white mx-auto mb-4`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4 text-foreground"
              variants={itemVariants}
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Got questions? We've got answers. Can't find what you're looking
              for?
              <Link
                href="/contact"
                className="text-blue-600 hover:underline ml-1"
              >
                Contact us
              </Link>
            </motion.p>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2 text-foreground">
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <motion.div
          className="container mx-auto text-center text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            variants={itemVariants}
          >
            Ready to Build Your Portfolio?
          </motion.h2>
          <motion.p
            className="text-xl mb-8 opacity-90 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Join thousands of developers who have already created stunning
            portfolios. Start free and upgrade when you're ready.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={itemVariants}
          >
            <Link href="/auth/signin">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Github className="w-4 h-4 mr-2" />
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/browse">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                View Examples
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default PricingPage;
