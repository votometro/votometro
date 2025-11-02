import { useState, useRef, useEffect, forwardRef } from "react";
import type { Answer, AnswerValue } from "../lib/types/answer";
import type { Thesis } from "../lib/types/election";
import { cn, button, card } from "../lib/styles";
import { validateMeaningfulness, getValidationErrorMessage, type ValidationFailureReason } from "../lib/validation/meaningfulness";

interface QuizProps {
  title: string;
  theses: Thesis[];
  initialAnswers?: Answer[];
  initialScrollPosition?: number;
  onComplete: (answers: Answer[], scrollPosition: number) => void;
}

const ANSWER_OPTIONS: { value: AnswerValue; label: string }[] = [
  { value: 1, label: "De acuerdo" },
  { value: 0, label: "Neutral" },
  { value: -1, label: "En desacuerdo" },
];

// Navigation and animation timing constants
const NAVIGATION_DELAY = 300;
const ANIMATION_DURATION = 300;

interface SlideProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const Slide = forwardRef<HTMLDivElement, SlideProps>(
  ({ children, footer, className }, ref) => {
    return (
      <div
        ref={ref}
        className="h-full snap-start px-4 pt-6 pb-3 flex flex-col md:items-center"
      >
        <div className={cn(
          card({ size: "lg" }),
          "flex-1 md:flex-none md:w-full md:max-w-[600px] md:aspect-[16/10] rounded-3xl flex flex-col justify-between",
          className
        )}>
          {children}
        </div>
        {footer && (
          <div className="w-full md:max-w-[900px] mt-3 text-center">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Slide.displayName = "Slide";

const useSlideNavigation = (slideRefs: React.RefObject<(HTMLDivElement | null)[]>) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigateToNextSlide = (targetIndex: number, delay = NAVIGATION_DELAY) => {
    // Clear any pending navigation timeouts
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    setIsNavigating(true);

    // Wait for delay, then scroll to the target slide
    delayTimeoutRef.current = setTimeout(() => {
      slideRefs.current[targetIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Reset navigation state after animation completes
      animationTimeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
      }, ANIMATION_DURATION);
    }, delay);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return { isNavigating, navigateToNextSlide };
};

const useCurrentSlide = (
  scrollContainerRef: React.RefObject<HTMLDivElement | null>,
  slideRefs: React.RefObject<(HTMLDivElement | null)[]>,
  currentThesisIndex: number
) => {
  const [viewSlideIndex, setViewSlideIndex] = useState<number>(0);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const containerHeight = scrollContainer.clientHeight;

      // Find which slide is most visible in the viewport
      let closestIndex = 0;
      let minDistance = Infinity;

      slideRefs.current.forEach((ref, index) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();

        // Calculate distance from slide center to container center
        const slideCenter = rect.top - containerRect.top + rect.height / 2;
        const containerCenter = containerHeight / 2;
        const distance = Math.abs(slideCenter - containerCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      setViewSlideIndex(closestIndex);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [currentThesisIndex, scrollContainerRef, slideRefs]);

  return viewSlideIndex;
};

export function Quiz({ title, theses, initialAnswers, initialScrollPosition, onComplete }: QuizProps) {
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers || []);
  const [validationError, setValidationError] = useState<ValidationFailureReason | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Derive currentThesisIndex from answers array
  const currentThesisIndex = answers.length;
  const isComplete = currentThesisIndex >= theses.length;

  // Show results card when all theses are answered
  const showResultsCard = answers.length >= theses.length;

  // Use custom hooks for navigation and slide tracking
  const { isNavigating, navigateToNextSlide } = useSlideNavigation(slideRefs);
  const viewSlideIndex = useCurrentSlide(scrollContainerRef, slideRefs, currentThesisIndex);

  // Restore scroll position when returning from results
  useEffect(() => {
    if (initialScrollPosition !== undefined && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = initialScrollPosition;
    }
  }, [initialScrollPosition]);

  // Helper function to scroll to results card
  const scrollToResultsCard = () => {
    setTimeout(() => {
      const resultsCardElement = slideRefs.current[theses.length];
      if (resultsCardElement) {
        resultsCardElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, NAVIGATION_DELAY);
  };

  // Helper function to handle answer updates with validation and navigation
  const updateAnswerAndNavigate = (thesisIndex: number, newAnswers: Answer[]) => {
    const isLastThesis = thesisIndex === theses.length - 1;
    const allThesesAnswered = newAnswers.length >= theses.length;

    // If all theses are answered (or will be after this), always validate
    if (allThesesAnswered) {
      const validation = validateMeaningfulness(newAnswers);

      if (validation.isValid) {
        // Validation passes
        setValidationError(null);

        // If on last thesis, advance immediately to weighting
        if (isLastThesis) {
          const scrollPosition = scrollContainerRef.current?.scrollTop || 0;
          onComplete(newAnswers, scrollPosition);
          return;
        }
        // For non-last thesis, navigate to next slide
        navigateToNextSlide(thesisIndex + 1);
        return;
      } else {
        // Validation fails, set error
        setValidationError(validation.failureReason!);

        // ONLY auto-scroll if interacting with last thesis
        if (isLastThesis) {
          scrollToResultsCard();
        } else {
          // For non-last thesis, still navigate to next
          navigateToNextSlide(thesisIndex + 1);
        }
        return;
      }
    }

    // Not all theses answered yet - just navigate to next
    navigateToNextSlide(thesisIndex + 1);
  };

  const handleAnswer = (thesisIndex: number, value: AnswerValue) => {
    const thesisKey = theses[thesisIndex]._key;

    // Update or add answer
    const existingAnswerIndex = answers.findIndex((a) => a.thesisKey === thesisKey);
    let newAnswers: Answer[];

    if (existingAnswerIndex !== -1) {
      // Update existing answer
      newAnswers = [...answers];
      newAnswers[existingAnswerIndex] = { thesisKey, value };
    } else {
      // Add new answer (automatically increments currentThesisIndex via answers.length)
      newAnswers = [...answers, { thesisKey, value }];
    }

    setAnswers(newAnswers);
    updateAnswerAndNavigate(thesisIndex, newAnswers);
  };

  const handleSkip = (thesisIndex: number) => {
    const thesisKey = theses[thesisIndex]._key;

    // Mark as skipped (value: null)
    const existingAnswerIndex = answers.findIndex((a) => a.thesisKey === thesisKey);
    let newAnswers: Answer[];

    if (existingAnswerIndex !== -1) {
      // Update existing answer to skipped
      newAnswers = [...answers];
      newAnswers[existingAnswerIndex] = { thesisKey, value: null };
    } else {
      // Add new skipped answer (automatically increments currentThesisIndex via answers.length)
      newAnswers = [...answers, { thesisKey, value: null }];
    }

    setAnswers(newAnswers);
    updateAnswerAndNavigate(thesisIndex, newAnswers);
  };

  const handleComplete = () => {
    const scrollPosition = scrollContainerRef.current?.scrollTop || 0;
    onComplete(answers, scrollPosition);
  };

  // Render answered theses + current thesis
  const visibleTheses = theses.slice(0, currentThesisIndex + 1);
  const totalSlides = theses.length + (showResultsCard ? 1 : 0); // N questions + results slide if present

  // Gray: based on answered questions (0% to 100% as you answer)
  const answeredProgress = theses.length > 0 ? (answers.length / theses.length) * 100 : 0;
  // Blue: based on currently viewed slide (0% on first, 100% on last slide)
  const viewProgress = totalSlides > 1 ? (viewSlideIndex / (totalSlides - 1)) * 100 : 0;

  return (
    <div className="h-[100dvh] flex flex-col">
      {/* Header */}
      <header className="z-10">
        <div className="bg-background">
          {/* Progress bar wrapper with padding for larger click area */}
          <div className="pt-4 md:pt-6 pb-5">
            <div className="w-1/2 h-1 bg-surface rounded-full overflow-hidden mx-auto relative">
              {/* Gray layer: Answered progress (background) */}
              <div
                className="absolute inset-0 h-full bg-gray-300 transition-all duration-300"
                style={{ width: `${answeredProgress}%` }}
              />
              {/* Blue layer: Current view/scroll position (foreground) */}
              <div
                className="absolute inset-0 h-full bg-accent transition-all duration-300"
                style={{ width: `${viewProgress}%` }}
              />
            </div>
          </div>
          {/* Title container - centered */}
          <div className="px-6">
            <div className="md:mx-auto md:max-w-[900px] md:flex md:justify-center">
              <div className="md:inline-block md:py-4">
                <h1 className="text-[min(7vw,3rem)] leading-[1.1] text-foreground mb-1">Votomatic</h1>
                <p className="text-[min(4vw,1.5rem)] text-foreground font-bold">{title}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* All slides - with snap scrolling */}
      <div
        ref={scrollContainerRef}
        className="flex-1 snap-y snap-mandatory overflow-y-auto relative"
      >
        {/* Gradient fade for cards scrolling below header */}
        <div className="sticky top-0 left-0 right-0 h-4 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none"></div>
        {visibleTheses.map((thesis, index) => {
          const answer = answers.find((a) => a.thesisKey === thesis._key);

          return (
            <Slide
              key={index}
              ref={(el) => {
                slideRefs.current[index] = el;
              }}
              footer={
                <button
                  onClick={() => handleSkip(index)}
                  disabled={isNavigating}
                  className={cn(button({ variant: "ghost", size: "sm" }))}
                >
                  Saltar tesis
                </button>
              }
            >
              {/* Top: Title and thesis text */}
              <div>
                {/* Title with progress */}
                <p className="text-sm leading-0 text-accent font-bold mb-6">
                  {index + 1} / {theses.length}
                  {thesis.title && ` ${thesis.title}`}
                </p>

                {/* Main thesis text */}
                <h2 className="text-2xl md:text-3xl text-foreground">
                  {thesis.text}
                </h2>
              </div>

              {/* Bottom: Answer buttons */}
              <div className="space-y-3 md:space-y-0 md:flex md:gap-3 md:justify-start">
                {ANSWER_OPTIONS.map((option) => {
                  const isSelected = answer?.value === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(index, option.value)}
                      disabled={isNavigating}
                      className={button({ variant: isSelected ? "selected" : "default" })}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </Slide>
          );
        })}

        {/* Results card - always shown when all theses are answered */}
        {showResultsCard && (
          <Slide
            ref={(el) => {
              slideRefs.current[theses.length] = el;
            }}
          >
            {validationError ? (
              // Invalid state - show error message
              <>
                <div>
                  <h2 className="text-2xl md:text-3xl text-foreground mb-6">
                    No se pueden calcular los resultados
                  </h2>

                  <p className="text-base text-foreground opacity-80 mb-4">
                    {getValidationErrorMessage(validationError)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-foreground opacity-60">
                    Navega hacia atrás para modificar tus respuestas.
                  </p>
                </div>
              </>
            ) : (
              // Valid state - show button
              <>
                <div>
                  <h2 className="text-2xl md:text-3xl text-foreground">
                    ¿Qué temas son más importantes para ti?
                  </h2>
                </div>

                <div>
                  <button
                    onClick={handleComplete}
                    disabled={isNavigating}
                    className={button({ variant: "primary" })}
                  >
                    Continuar a ponderación
                  </button>
                </div>
              </>
            )}
          </Slide>
        )}

      </div>
    </div>
  );
}
