import { motion } from 'framer-motion';
import { Scissors, Minimize2, Droplets, RotateCw } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolCard } from '@/components/ToolCard';
import { ModalController } from '@/components/ModalController';
import { ParticleBackground } from '@/components/ParticleBackground';
import { useModalStore } from '@/stores/modalStore';
import { useThemeStore } from '@/stores/themeStore';
import { useEffect } from 'react';

const tools = [
  {
    id: 'extract' as const,
    title: 'Extract Pages',
    description: 'Select and extract specific pages from your PDF into a new file.',
    icon: Scissors,
  },
  {
    id: 'compress' as const,
    title: 'Compress PDF',
    description: 'Reduce file size while maintaining the best possible quality.',
    icon: Minimize2,
  },
  {
    id: 'watermark' as const,
    title: 'Add Watermark',
    description: 'Add custom text watermarks with adjustable opacity and rotation.',
    icon: Droplets,
  },
  {
    id: 'rotate' as const,
    title: 'Rotate PDF',
    description: 'Rotate all or selected pages left or right by 90 degrees.',
    icon: RotateCw,
  },
];

const Index = () => {
  const { openModal } = useModalStore();
  const { setTheme } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('pdf-studio-theme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        if (parsed.state?.theme) {
          setTheme(parsed.state.theme);
        }
      } catch {
        setTheme('dark');
      }
    } else {
      setTheme('dark');
    }
  }, [setTheme]);

  const handleToolClick = (toolId: 'extract' | 'compress' | 'watermark' | 'rotate') => {
    openModal('upload', toolId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Particle background for dark mode */}
      <ParticleBackground />
      
      <Header />
      
      <main className="flex-1 pt-16 relative z-10">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                100% Browser-Based Processing
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Professional PDF tools,{' '}
                <span className="gradient-gold-text">elegantly simple</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Extract pages, compress files, add watermarks, and rotate PDFs—all 
                processed locally in your browser. No uploads, no waiting.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="pb-20 md:pb-32">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
              {tools.map((tool, index) => (
                <ToolCard
                  key={tool.id}
                  title={tool.title}
                  description={tool.description}
                  icon={tool.icon}
                  onClick={() => handleToolClick(tool.id)}
                  delay={0.4 + index * 0.1}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-6">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl gradient-gold mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-background" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Privacy First</h3>
                <p className="text-sm text-muted-foreground">
                  Your files never leave your device. All processing happens locally.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl gradient-gold mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-background" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">
                  No upload delays. Process files instantly in your browser.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl gradient-gold mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-background" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2">No Limits</h3>
                <p className="text-sm text-muted-foreground">
                  Process unlimited PDFs. No file size restrictions.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <ModalController />
    </div>
  );
};

export default Index;
