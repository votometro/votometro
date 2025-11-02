import { useState, useMemo } from "react";
import type { Answer } from "../lib/types/answer";
import type { Thesis } from "../lib/types/election";
import type { PartyParticipation } from "../lib/types/party";
import { calculateMatch } from "../lib/matching/algorithm";
import { cn, card, button } from "../lib/styles";

interface ResultsProps {
  answers: Answer[];
  weights: Record<string, number>;
  theses: Thesis[];
  title: string;
  partyParticipations: PartyParticipation[];
  onBack: () => void;
}

interface PartyResult {
  name: string;
  abbreviation: string;
  logoUrl?: string | null;
  description?: string;
  matchPercentage: number;
}

export function Results({
  answers,
  weights,
  partyParticipations,
  onBack,
}: ResultsProps) {
  const [expandedParty, setExpandedParty] = useState<string | null>(null);

  // Calculate matches for all parties
  const partyResults: PartyResult[] = useMemo(() => {
    const results = partyParticipations.map((participation) => {
      const match = calculateMatch(answers, participation.answers, weights);

      return {
        name: participation.party.name,
        abbreviation: participation.party.abbreviation,
        logoUrl: participation.party.logoUrl,
        description: participation.party.description,
        matchPercentage: match.matchPercentage,
      };
    });

    // Sort by match percentage (descending)
    return results.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [answers, weights, partyParticipations]);

  const toggleParty = (partyName: string) => {
    setExpandedParty(expandedParty === partyName ? null : partyName);
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
            {/* Header */}
            <header className="z-10">
              <div className="bg-background px-6 pt-4 md:pt-6 pb-5">
                {/* Title */}
                <div className="md:mx-auto md:max-w-[900px]">
                  <h1 className="text-[min(7vw,3rem)] leading-[1.1] text-foreground mb-1">
                    Tus resultados
                  </h1>
                </div>
              </div>
            </header>
      
            {/* Results list */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              <div className="md:mx-auto md:max-w-[900px]">
                <div className="space-y-3">
                  {partyResults.map((party) => {
                    const isExpanded = expandedParty === party.name;
      
                    return (
                      <div
                        key={party.name}
                        className="bg-surface rounded-3xl overflow-hidden"
                      >
                        {/* Party header - clickable */}
                        <button
                          onClick={() => toggleParty(party.name)}
                          className="w-full p-6 hover:bg-background transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-start gap-8">
                            {/* Logo and abbreviation side by side */}
                            <div className="flex items-center gap-6 flex-shrink-0">
                              {/* Logo */}
                              {party.logoUrl && (
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden bg-background flex-shrink-0">
                                  <img
                                    src={party.logoUrl}
                                    alt={`${party.name} logo`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
      
                              {/* Abbreviation */}
                              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                                {party.abbreviation}
                              </h2>
                            </div>
      
                            {/* Chevron */}
                            <div className="flex-shrink-0 ml-auto">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={cn(
                                  "transition-transform duration-300",
                                  isExpanded ? "rotate-180" : ""
                                )}
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </div>
                          </div>
      
                          {/* Progress bar and percentage below */}
                          <div className="flex items-center gap-6">
                            {/* Progress bar container */}
                            <div className="flex-1 relative">
                              {/* Percentage on top of progress bar */} 
                              <div className="flex justify-end mb-1">
                                <span className="text-xl md:text-2xl font-bold text-accent">
                                  {Math.round(party.matchPercentage)}%
                                </span>
                              </div>
      
                              {/* Progress bar */}
                              <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-accent transition-all duration-500 rounded-full"
                                  style={{ width: `${party.matchPercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </button>
      
                        {/* Expandable content - full name and description */}
                        {isExpanded && (
                          <div className="px-6 pb-6 pt-0">
                            <div className="pt-4 border-t border-background space-y-3">
                              {/* Full party name */}
                              <h3 className="text-lg md:text-xl font-bold text-foreground">
                                {party.name}
                              </h3>
      
                              {/* Description */}
                              {party.description && (
                                <p className="text-foreground-secondary leading-relaxed">
                                  {party.description}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Disclaimer */}
                <div className={cn(card(), "mt-6 text-sm text-foreground-secondary leading-relaxed")}>
                  <p>
                    Altos niveles de acuerdo entre tus respuestas y varios partidos no significan necesariamente que estos partidos estén cerca unos de otros en términos de su contenido.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="px-6 py-4 bg-background">
              <div className="md:mx-auto md:max-w-[900px] flex justify-start">
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
                  Volver a ponderar
                </button>
              </div>
            </footer>
          </div>
  );
}
