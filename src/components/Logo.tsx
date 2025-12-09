import { motion } from 'framer-motion';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export const Logo = ({ size = 40, showText = true }: LogoProps) => {
  return (
    <motion.div 
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F2CE69" />
            <stop offset="100%" stopColor="#D2A63D" />
          </linearGradient>
        </defs>
        <rect 
          x="2" 
          y="2" 
          width="36" 
          height="36" 
          rx="8" 
          fill="url(#goldGradient)"
        />
        <path
          d="M12 12H28V16H16V18H26V22H16V24H28V28H12V12Z"
          fill="#121212"
        />
      </svg>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            PDF Studio
          </span>
          <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            by Eldora
          </span>
        </div>
      )}
    </motion.div>
  );
};
