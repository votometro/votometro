import { useState, useRef, useEffect } from "react";
import type { Answer, AnswerValue, Thesis } from "./types";

interface QuizProps {
  title: string;
  theses: Thesis[];
  onComplete: (answers: Answer[]) => void;
}

const ANSWER_OPTIONS: { value: AnswerValue; label: string }[] = [
  { value: 1, label: "De acuerdo" },
  { value: 0, label: "Neutral" },
  { value: -1, label: "En desacuerdo" },
];

export function Quiz({ title, theses, onComplete }: QuizProps) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentThesisIndex, setCurrentThesisIndex] = useState<number>(0);
  const [viewSlideIndex, setViewSlideIndex] = useState<number>(0);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isComplete = currentThesisIndex >= theses.length;

  // Track which slide is currently in view using scroll position
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
  }, [currentThesisIndex]); // Re-run when new slides are added

  const handleAnswer = (thesisIndex: number, value: AnswerValue) => {
    // Update or add answer
    const existingAnswerIndex = answers.findIndex((a) => a.thesisIndex === thesisIndex);
    let newAnswers: Answer[];

    if (existingAnswerIndex !== -1) {
      // Update existing answer
      newAnswers = [...answers];
      newAnswers[existingAnswerIndex] = { thesisIndex, value };
      setAnswers(newAnswers);
    } else {
      // Add new answer
      newAnswers = [...answers, { thesisIndex, value }];
      setAnswers(newAnswers);
    }

    // Advance to next question if this was the current one
    if (thesisIndex === currentThesisIndex) {
      setCurrentThesisIndex(currentThesisIndex + 1);
    }

    // Scroll to next slide after 500ms
    setTimeout(() => {
      const nextSlideIndex = thesisIndex + 1;
      slideRefs.current[nextSlideIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  };

  const handleSkip = (thesisIndex: number) => {
    // Remove answer if one exists
    const existingAnswerIndex = answers.findIndex((a) => a.thesisIndex === thesisIndex);
    if (existingAnswerIndex !== -1) {
      const newAnswers = answers.filter((a) => a.thesisIndex !== thesisIndex);
      setAnswers(newAnswers);
    }

    // Advance to next question if this was the current one
    if (thesisIndex === currentThesisIndex) {
      setCurrentThesisIndex(currentThesisIndex + 1);
    }

    // Scroll to next slide
    setTimeout(() => {
      const nextSlideIndex = thesisIndex + 1;
      slideRefs.current[nextSlideIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  };

  const handleComplete = () => {
    onComplete(answers);
  };

  // Render answered theses + current thesis (+ final slide when complete)
  const visibleTheses = theses.slice(0, currentThesisIndex + 1);
  const totalSlides = theses.length + 1; // N questions + 1 final slide

  // Gray: based on answered questions (0% to 100% as you answer)
  const answeredProgress = theses.length > 0 ? (answers.length / theses.length) * 100 : 0;
  // Blue: based on currently viewed slide (0% on first, 100% on final slide)
  const viewProgress = totalSlides > 1 ? (viewSlideIndex / (totalSlides - 1)) * 100 : 0;

  return (
    <div className="h-[100dvh] flex flex-col">
      {/* Header */}
      <header className="z-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-background">
            {/* Progress bar wrapper with padding for larger click area */}
            <div className="pt-4 pb-5">
              <div className="w-1/2 h-1 bg-surface rounded-full overflow-hidden mx-auto relative">
                {/* Gray layer: Answered progress (background) */}
                <div
                  className="absolute inset-0 h-full bg-gray-300 transition-all duration-300"
                  style={{ width: `${answeredProgress}%` }}
                />
                {/* Blue layer: Current view/scroll position (foreground) */}
                <div
                  className="absolute inset-0 h-full bg-primary transition-all duration-300"
                  style={{ width: `${viewProgress}%` }}
                />
              </div>
            </div>
            {/* Title container */}
            <div className="px-6">
              <h1 className="text-xl text-text-primary mb-1">Votómetro</h1>
              <p className="text-sm text-text-primary font-bold">{title}</p>
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
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none"></div>
        {visibleTheses.map((thesis, index) => {
          const isCurrentThesis = index === currentThesisIndex;
          const answer = answers.find((a) => a.thesisIndex === index);

          return (
            <div
              key={index}
              ref={(el) => (slideRefs.current[index] = el)}
              className="h-full snap-start px-4 pt-6 pb-3 flex flex-col"
            >
              <div className="max-w-2xl mx-auto flex-1 bg-surface rounded-3xl p-8 flex flex-col justify-between">
                {/* Top: Subtitle and thesis text */}
                <div>
                  {/* Subtitle with progress */}
                  <p className="text-sm leading-0 text-text-primary font-bold mb-6">
                    {index + 1} / {theses.length}
                    {thesis.subtitle && ` ${thesis.subtitle}`}
                  </p>

                  {/* Main thesis text */}
                  <h2 className="text-2xl md:text-3xl text-text-primary">
                    {thesis.text}
                  </h2>
                </div>

                {/* Bottom: Answer buttons */}
                <div className="space-y-3">
                  {ANSWER_OPTIONS.map((option) => {
                    const isSelected = answer?.value === option.value;

                    return (
                      <button
                        key={option.value}
                        onClick={() => handleAnswer(index, option.value)}
                        className={`
                          w-full py-4 px-6 rounded-lg font-semibold transition-all
                          ${isSelected
                            ? "bg-primary text-text-inverse"
                            : "bg-background text-text-primary"
                          }
                          hover:opacity-80 active:scale-95 cursor-pointer
                        `}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skip button - outside and below card */}
              <div className="max-w-2xl mx-auto w-full mt-3 text-center">
                <button
                  onClick={() => handleSkip(index)}
                  className="inline-block py-2 px-6 rounded-lg font-semibold text-text-muted hover:text-text-secondary transition-all active:scale-95 cursor-pointer"
                >
                  Saltar tesis
                </button>
              </div>
            </div>
          );
        })}

        {/* Final slide with "Ver resultados" button */}
        {isComplete && (
          <div
            ref={(el) => (slideRefs.current[theses.length] = el)}
            className="h-full snap-start px-4 pt-6 pb-3 flex flex-col"
          >
            <div className="max-w-2xl mx-auto flex-1 bg-surface rounded-3xl p-8 flex flex-col justify-between">
              {/* Top: Caption and completion message */}
              <div>
                {/* Caption consistent with quiz slides */}
                <p className="text-sm leading-0 text-text-primary font-bold mb-6">
                  Resultados
                </p>

                {/* Completion message */}
                <h2 className="text-2xl md:text-3xl text-text-primary">
                  Tus resultados están listos
                </h2>
              </div>

              {/* Bottom: Button */}
              <div>
                <button
                  onClick={handleComplete}
                  className="w-full py-4 px-6 rounded-lg font-semibold transition-all bg-primary text-text-inverse hover:opacity-80 active:scale-95 cursor-pointer"
                >
                  Ver resultados
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
