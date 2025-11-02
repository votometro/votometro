import { useState } from "react";
import { Quiz } from "./Quiz";
import { Results } from "./Results";
import { Weighting } from "./Weighting";
import type { Answer } from "../lib/types/answer";
import type { Thesis } from "../lib/types/election";
import type { PartyParticipation } from "../lib/types/party";

interface ElectionProps {
  title: string;
  theses: Thesis[];
  partyParticipations: PartyParticipation[];
}

export function Election({ title, theses, partyParticipations }: ElectionProps) {
  const [view, setView] = useState<"quiz" | "weighting" | "results">("quiz");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [quizScrollPosition, setQuizScrollPosition] = useState<number>(0);

  const handleQuizComplete = (finalAnswers: Answer[], scrollPosition: number) => {
    setAnswers(finalAnswers);
    setQuizScrollPosition(scrollPosition);
    setView("weighting");
  };

  const handleWeightingComplete = (finalWeights: Record<string, number>) => {
    setWeights(finalWeights);
    setView("results");
  };

  const handleBackToQuiz = () => {
    setView("quiz");
  };

  const handleBackToWeighting = () => {
    setView("weighting");
  };

  if (view === "results") {
    return (
      <Results
        answers={answers}
        weights={weights}
        theses={theses}
        title={title}
        partyParticipations={partyParticipations}
        onBack={handleBackToWeighting}
      />
    );
  }

  if (view === "weighting") {
    return (
      <Weighting
        theses={theses}
        answers={answers}
        weights={weights}
        onComplete={handleWeightingComplete}
        onBack={handleBackToQuiz}
      />
    );
  }

  return (
    <Quiz
      title={title}
      theses={theses}
      initialAnswers={answers}
      initialScrollPosition={quizScrollPosition}
      onComplete={handleQuizComplete}
    />
  );
}
