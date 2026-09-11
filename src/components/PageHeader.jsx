import { motion } from 'framer-motion';

export default function PageHeader({ title, subtitle }) {
  return (
    <div className="bg-hero-gradient border-b border-white/60">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="section-padding !py-14 text-center"
      >
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="text-charcoal-500 mt-3 max-w-xl mx-auto">{subtitle}</p>}
      </motion.div>
    </div>
  );
}
