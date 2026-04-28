import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Helper component for navigation links
const NavLink = ({ href, children }) => (
  <a
    href={href}
    className="text-sm font-medium tracking-widest text-foreground/60 transition-colors hover:text-foreground"
  >
    {children}
  </a>
);

// Helper component for social media icons
const SocialIcon = ({ href, icon: Icon }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-foreground/60 transition-colors hover:text-foreground">
    <Icon className="h-5 w-5" />
  </a>
);

// The main reusable Hero Section component
export const MinimalistHero = ({
  logoText,
  navLinks,
  mainText,
  readMoreLink,
  imageSrc,
  imageAlt,
  overlayText,
  socialLinks,
  locationText,
  className,
}) => {
  return (
    <div
      className={cn(
        'relative min-h-screen w-full flex flex-col justify-between bg-background p-6 md:p-8 lg:p-12 font-sans overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <header className="z-30 flex w-full max-w-7xl mx-auto items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl md:text-2xl font-bold tracking-wider"
        >
          {logoText}
        </motion.div>
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {navLinks.map((link) => (
            <NavLink key={link.label} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col space-y-1.5 md:hidden"
          aria-label="Open menu"
        >
          <span className="block h-0.5 w-6 bg-foreground"></span>
          <span className="block h-0.5 w-6 bg-foreground"></span>
          <span className="block h-0.5 w-5 bg-foreground"></span>
        </motion.button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow flex items-center">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Left Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="order-2 md:order-1 text-center md:text-left px-4"
          >
            <p className="text-sm md:text-base lg:text-lg leading-relaxed text-foreground/80 max-w-md mx-auto md:mx-0">
              {mainText}
            </p>
            <a 
              href={readMoreLink} 
              className="mt-6 inline-block text-sm font-medium text-foreground underline decoration-from-font hover:opacity-80 transition-opacity"
            >
              Read More →
            </a>
          </motion.div>

          {/* Center Robot Image with BLUE GRADIENT CIRCLE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="order-1 md:order-2 flex justify-center items-center relative"
          >
            {/* BLUE GRADIENT CIRCLE BACKGROUND */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[280px] h-[280px] md:w-[350px] md:h-[350px] lg:w-[450px] lg:h-[450px] rounded-full bg-gradient-to-br from-blue-600/80 to-blue-400/60 blur-2xl opacity-70"></div>
            </div>
            
            {/* Robot Image */}
            <img
              src={imageSrc}
              alt={imageAlt}
              className="relative z-10 h-auto w-full max-w-[250px] md:max-w-[300px] lg:max-w-[380px] object-contain drop-shadow-2xl"
              onError={(e) => {
                const target = e.target;
                target.onerror = null;
                target.src = `https://placehold.co/400x400/1A73E8/ffffff?text=ChronoTradez`;
              }}
            />
          </motion.div>

          {/* Right Text - FIXED: Each word on separate line */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="order-3 flex items-center justify-center text-center md:justify-start px-4"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-foreground leading-none">
              <span className="block">{overlayText.part1}</span>
              <span className="block">{overlayText.part2}</span>
            </h1>
          </motion.div>
        </div>
      </main>

      {/* Footer Elements */}
      <footer className="z-30 flex w-full max-w-7xl mx-auto items-center justify-between pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex items-center space-x-3 md:space-x-4"
        >
          {socialLinks.map((link, index) => (
            <SocialIcon key={index} href={link.href} icon={link.icon} />
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="text-xs md:text-sm font-medium text-foreground/80"
        >
          {locationText}
        </motion.div>
      </footer>
    </div>
  );
};
