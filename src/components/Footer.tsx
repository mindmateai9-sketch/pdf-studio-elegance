import { motion } from 'framer-motion';

export const Footer = () => {
  return (
    <motion.footer 
      className="border-t border-border/50 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Crafted with precision by{' '}
            <span className="gradient-gold-text font-medium">Eldora Technologies</span>
          </p>
          
          <p className="text-xs text-muted-foreground/70">
            All PDF processing happens locally in your browser
          </p>
        </div>
      </div>
    </motion.footer>
  );
};
