import { memo, useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { RiArrowRightSLine as ChevronRight, RiArrowLeftSLine as ChevronLeft, RiSparklingFill as Sparkles, RiPaletteFill as Palette, RiDownloadFill as Download } from 'react-icons/ri';
import { useBrandStore } from '@/store/useBrandStore';

const EASE_CURVE: [number, number, number, number] = [0.4, 0, 0.2, 1];

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: Sparkles,
    title: 'Welcome to Brand Bento',
    description:
      'A moodboard tool for exploring brand identity. See typography, color, imagery, and logo working together as a system.',
  },
  {
    icon: Palette,
    title: 'Customize Everything',
    description:
      'Use the sidebar to change colors, fonts, and layout. Click any tile on the canvas to edit its content with the floating toolbar.',
  },
  {
    icon: Download,
    title: 'How would you like to start?',
    description:
      'Pick a curated template to explore, or start fresh with defaults.',
    hasTemplateChoice: true,
  },
];

export const WelcomeModal = memo(({ open, onClose }: WelcomeModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('random');
  const loadRandomTemplate = useBrandStore((s) => s.loadRandomTemplate);

  const handleFinish = useCallback(() => {
    if (selectedTemplate === 'random') {
      loadRandomTemplate();
    }
    localStorage.setItem('brandbento-onboarding-complete', 'true');
    onClose();
  }, [selectedTemplate, loadRandomTemplate, onClose]);

  const handleSkip = useCallback(() => {
    localStorage.setItem('brandbento-onboarding-complete', 'true');
    onClose();
  }, [onClose]);

  const handleNext = useCallback(() => {
    if (currentStep === steps.length - 1) {
      handleFinish();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, handleFinish]);

  const handleBack = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, handleSkip]);

  const step = steps[currentStep];
  const Icon = step.icon;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center p-6"
          style={{
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={handleSkip}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: EASE_CURVE }}
            className="w-full max-w-[480px] rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: 'var(--sidebar-bg)',
              border: '1px solid var(--sidebar-border)',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with progress */}
            <div
              className="flex items-center justify-between px-6 py-4 shrink-0"
              style={{ borderBottom: '1px solid var(--sidebar-border)' }}
            >
              <div className="flex items-center gap-2">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      width: i === currentStep ? 24 : 8,
                      backgroundColor:
                        i <= currentStep ? 'var(--accent)' : 'var(--sidebar-border)',
                    }}
                  />
                ))}
              </div>
              <button
                onClick={handleSkip}
                className="text-11 font-medium transition-colors"
                style={{ color: 'var(--sidebar-text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--sidebar-text)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--sidebar-text-muted)';
                }}
              >
                Skip
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-8 flex flex-col items-center text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  backgroundColor: 'var(--accent-muted)',
                  color: 'var(--accent)',
                }}
              >
                <Icon size={28} />
              </div>

              <h2
                className="text-lg font-semibold mb-2"
                style={{ color: 'var(--sidebar-text)' }}
              >
                {step.title}
              </h2>

              <p
                className="text-13 max-w-sm mb-6"
                style={{ color: 'var(--sidebar-text-secondary)', lineHeight: 1.6 }}
              >
                {step.description}
              </p>

              {/* Template choice on last step */}
              {step.hasTemplateChoice && (
                <div className="flex gap-3 w-full max-w-xs">
                  {[
                    { id: 'random', name: 'Random Template', desc: 'Surprise me' },
                    { id: 'default', name: 'Start Fresh', desc: 'Use defaults' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className="flex-1 p-3 rounded-xl border-2 transition-all text-left"
                      style={{
                        borderColor:
                          selectedTemplate === t.id
                            ? 'var(--accent)'
                            : 'var(--sidebar-border)',
                        backgroundColor:
                          selectedTemplate === t.id
                            ? 'var(--accent-muted)'
                            : 'var(--sidebar-bg-hover)',
                      }}
                    >
                      <div
                        className="text-12 font-semibold mb-0.5"
                        style={{ color: 'var(--sidebar-text)' }}
                      >
                        {t.name}
                      </div>
                      <div
                        className="text-10"
                        style={{ color: 'var(--sidebar-text-muted)' }}
                      >
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-6 py-4 shrink-0"
              style={{ borderTop: '1px solid var(--sidebar-border)' }}
            >
              {currentStep > 0 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--sidebar-text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--sidebar-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <ChevronLeft size={16} />
                  <span className="text-12 font-medium">Back</span>
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-5 py-2 rounded-lg font-medium text-12 transition-transform"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#1C1917',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span>
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                </span>
                {currentStep < steps.length - 1 && <ChevronRight size={16} />}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
});

WelcomeModal.displayName = 'WelcomeModal';
