import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Code, Sparkles } from 'lucide-react';
import { Header } from './Header';

export const About = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/80 to-white dark:from-[#1a2628] dark:to-[#2C3B3E]">
      <Header 
        user={null} 
        onLogout={() => {}} 
        onLoginClick={handleLoginClick} 
      />
      
      <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-cyan-500 dark:to-cyan-400 bg-clip-text text-transparent mb-6">
              About Headzpace
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              A customizable focus space enhanced with AI, designed for the modern workflow
            </p>
          </div>

          {/* Vision Section */}
          <div className="bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-cyan-500/20 p-6 sm:p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 dark:bg-cyan-500/10 rounded-lg">
                <Brain className="w-5 h-5 text-indigo-500 dark:text-cyan-500" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                Vision & Mission
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Headzpace was born from a vision to create a workspace that adapts to how we think and work. 
              By combining customizable layouts with AI capabilities, we're building a platform that lets you 
              harness multiple AI models in one cohesive space, alongside essential productivity tools.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50/50 dark:bg-cyan-500/5 rounded-xl">
                <h3 className="font-medium text-slate-800 dark:text-white mb-2">Multi-LLM Integration</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Connect and compare responses from different AI models simultaneously, getting diverse perspectives on your queries.
                </p>
              </div>
              <div className="p-4 bg-indigo-50/50 dark:bg-cyan-500/5 rounded-xl">
                <h3 className="font-medium text-slate-800 dark:text-white mb-2">Focus-First Design</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Every feature is designed to minimize distractions and maximize productivity in your workflow.
                </p>
              </div>
            </div>
          </div>

          {/* Creator Section */}
          <div className="bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-cyan-500/20 p-6 sm:p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 dark:bg-cyan-500/10 rounded-lg">
                <Code className="w-5 h-5 text-indigo-500 dark:text-cyan-500" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                About the Creator
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Hi, I'm ramon.jm, a product designer focused on building tools that leverage AI technology. 
                With a background in architecture, product design, and human-computer interaction, I'm passionate 
                about creating intuitive digital experiences that enhance how we work and create.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                My approach combines principles from architecture and human behavior studies to design 
                tools that feel natural and empower users to work more effectively.
              </p>
            </div>
          </div>

          {/* Future Vision */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-cyan-500 dark:to-cyan-400 rounded-2xl p-6 sm:p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">
                Future Vision
              </h2>
            </div>
            <p className="text-white/90 leading-relaxed mb-6">
              Headzpace is just the beginning. Our roadmap includes expanding AI capabilities, 
              introducing more productivity features, and creating an even more personalized 
              workspace experience. We're building this together with our community, focusing 
              on what truly helps people work better.
            </p>
            <div className="flex items-center justify-center">
              <a
                href="https://x.com/DeepLensRJM"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
              >
                <span>Follow the Journey</span>
                <Sparkles className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};