
import { useState, useMemo } from "react";
import type { Answer } from "../lib/types/answer";
import type { Thesis } from "../lib/types/election";
import { cn, button } from "../lib/styles";

interface WeightingProps {
  theses: Thesis[];
  answers: Answer[];
  weights?: Record<string, number>;
  onComplete: (weights: Record<string, number>) => void;
  onBack: () => void;
}

export function Weighting({ theses, answers, weights: initialWeights, onComplete, onBack }: WeightingProps) {
  const [weights, setWeights] = useState<Record<string, number>>(initialWeights || {});

  const toggleWeight = (thesisKey: string) => {
    setWeights((prev) => ({
      ...prev,
      [thesisKey]: prev[thesisKey] === 2 ? 1 : 2,
    }));
  };

  const handleComplete = () => {
    onComplete(weights);
  };

  const thesesWithAnswers = useMemo(() => {
    return theses.filter(thesis => answers.some(answer => answer.thesisKey === thesis._key));
  }, [theses, answers]);

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <header className="z-10">
        <div className="bg-background px-6 pt-4 md:pt-6 pb-5">
          {/* Title */}
          <div className="md:mx-auto md:max-w-[900px]">
            <h1 className="text-[min(7vw,3rem)] leading-[1.1] text-foreground mb-1">
              Ponderación de las tesis
            </h1>
            <p className="text-[min(4vw,1.5rem)] text-foreground-secondary">
              ¿Qué tesis son particularmente importantes para ti? Marca las tesis para que su peso se duplique en el cálculo.
            </p>
          </div>
        </div>
      </header>

      {/* Theses list */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="md:mx-auto md:max-w-[900px]">
          <div className="space-y-3">
            {thesesWithAnswers.map((thesis) => {
              const isWeighted = weights[thesis._key] === 2;

              return (
                <div
                  key={thesis._key}
                  className={cn(
                    "bg-surface rounded-3xl p-6 flex items-center justify-between gap-4 transition-all",
                    isWeighted && "bg-accent text-accent-foreground"
                  )}
                >
                  <span className="font-semibold flex-1 min-w-0">{thesis.title}</span>
                  <button
                    onClick={() => toggleWeight(thesis._key)}
                    className={cn(
                      button({ variant: "default", size: "sm" }),
                      "!w-auto flex-shrink-0",
                      isWeighted && "bg-accent text-accent-foreground"
                    )}
                  >
                    {isWeighted ? "Marcado (2x)" : "Marcar"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 bg-background">
        <div className="md:mx-auto md:max-w-[900px] flex justify-between items-center">
          <button
            onClick={onBack}
            className={cn(button({ variant: "outline-ghost" }), "gap-2")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver al cuestionario
          </button>
          <button
            onClick={handleComplete}
            className={cn(button({ variant: "primary", fullWidth: false }))}
          >
            Ver resultados
          </button>
        </div>
      </footer>
    </div>
  );
}
