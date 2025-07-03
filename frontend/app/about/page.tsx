'use client';

import React from 'react';
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
import Navigation from '@/components/Navigation';
import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  Code,
  Users,
  Target,
  Heart,
  Zap,
  Globe,
  Award,
  Coffee,
} from 'lucide-react';
import Link from 'next/link';

const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      name: 'Aayushi Malhotra',
      role: 'Frontend Lead & Co-Founder',
      bio: 'Passionate about creating beautiful, intuitive user experiences. Specializes in React, Next.js, and modern frontend technologies.',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      skills: [
        'React',
        'Next.js',
        'TypeScript',
        'UI/UX Design',
        'Tailwind CSS',
      ],
      social: {
        github: 'https://github.com/aayushimalhotra',
        linkedin: 'https://linkedin.com/in/aayushimalhotra',
        twitter: 'https://twitter.com/aayushimalhotra',
        email: 'aayushi@devdeck.dev',
      },
    },
    {
      name: 'Kathan Patel',
      role: 'Backend Lead & Co-Founder',
      bio: 'Expert in building scalable backend systems and APIs. Loves working with Node.js, databases, and cloud infrastructure.',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      skills: ['Node.js', 'MongoDB', 'Express.js', 'AWS', 'Docker'],
      social: {
        github: 'https://github.com/kathanpatel',
        linkedin: 'https://linkedin.com/in/kathanpatel',
        twitter: 'https://twitter.com/kathanpatel',
        email: 'kathan@devdeck.dev',
      },
    },
  ];

  const values = [
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Developer-First',
      description:
        'Built by developers, for developers. We understand the unique needs of the developer community.',
      color: 'bg-blue-500',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community Driven',
      description:
        'We listen to our users and continuously improve based on community feedback and suggestions.',
      color: 'bg-green-500',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Innovation',
      description:
        "Constantly pushing the boundaries of what's possible in portfolio creation and developer tools.",
      color: 'bg-yellow-500',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Passion',
      description:
        "We're passionate about helping developers showcase their work and advance their careers.",
      color: 'bg-red-500',
    },
  ];

  const stats = [
    {
      label: 'Portfolios Created',
      value: '25,000+',
      icon: <Globe className="w-6 h-6" />,
    },
    {
      label: 'Active Users',
      value: '10,000+',
      icon: <Users className="w-6 h-6" />,
    },
    {
      label: 'GitHub Integrations',
      value: '50,000+',
      icon: <Github className="w-6 h-6" />,
    },
    {
      label: 'Countries Served',
      value: '50+',
      icon: <Award className="w-6 h-6" />,
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
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
              <Coffee className="w-3 h-3 mr-1" />
              Meet the Team
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            About DevDeck
          </motion.h1>

          <motion.p
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            We're on a mission to help developers create stunning portfolios
            that showcase their skills, tell their story, and advance their
            careers. Built with passion by developers, for developers.
          </motion.p>
        </motion.div>
      </section>

      {/* Mission Section */}
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
              Our Mission
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
              variants={itemVariants}
            >
              To democratize professional portfolio creation and help every
              developer showcase their unique talents to the world.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {values.map((value, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div
                      className={`w-16 h-16 ${value.color} rounded-full flex items-center justify-center text-white mx-auto mb-4`}
                    >
                      {value.icon}
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
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
              DevDeck by the Numbers
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Growing every day thanks to our amazing community of developers.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={itemVariants}
              >
                <div className="flex items-center justify-center mb-4 text-blue-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
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
              Meet the Founders
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              variants={itemVariants}
            >
              The passionate developers behind DevDeck, working to make
              portfolio creation accessible and beautiful for everyone.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {teamMembers.map((member, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-8 text-center">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
                    />
                    <h3 className="text-2xl font-bold mb-2 text-foreground">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 font-semibold mb-4">
                      {member.role}
                    </p>
                    <p className="text-muted-foreground mb-6">{member.bio}</p>

                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                      {member.skills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex justify-center gap-4">
                      <a
                        href={member.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                      <a
                        href={member.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                      <a
                        href={member.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                      <a
                        href={`mailto:${member.social.email}`}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto">
          <motion.div
            className="max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div className="text-center mb-12" variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Our Story
              </h2>
            </motion.div>

            <motion.div
              className="prose prose-lg mx-auto text-muted-foreground"
              variants={itemVariants}
            >
              <p className="text-lg leading-relaxed mb-6">
                DevDeck was born from a simple frustration: creating a
                professional developer portfolio shouldn't be so complicated. As
                developers ourselves, Aayushi and Kathan experienced firsthand
                the challenges of showcasing technical projects in a visually
                appealing way.
              </p>

              <p className="text-lg leading-relaxed mb-6">
                Traditional portfolio builders weren't designed with developers
                in mind. They lacked GitHub integration, couldn't properly
                display code projects, and required too much design work. We
                knew there had to be a better way.
              </p>

              <p className="text-lg leading-relaxed mb-6">
                So we built DevDeck - a platform specifically designed for
                developers, by developers. With seamless GitHub integration,
                beautiful templates, and an intuitive drag-and-drop editor,
                we've made it possible for any developer to create a stunning
                portfolio in minutes.
              </p>

              <p className="text-lg leading-relaxed">
                Today, DevDeck powers thousands of developer portfolios
                worldwide, helping talented individuals land their dream jobs
                and showcase their passion for code. We're just getting started.
              </p>
            </motion.div>
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
            Ready to Join Our Community?
          </motion.h2>
          <motion.p
            className="text-xl mb-8 opacity-90 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Be part of the growing community of developers who are showcasing
            their work and advancing their careers with DevDeck.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={itemVariants}
          >
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Github className="w-4 h-4 mr-2" />
                Get Started Free
              </Button>
            </Link>
            <Link href="/browse">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                Browse Portfolios
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default AboutPage;
