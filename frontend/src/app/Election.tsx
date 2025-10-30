import { useState } from "react";
import { Quiz } from "./Quiz";
import { Results } from "./Results";
import type { Answer } from "../lib/types/answer";
import type { Thesis } from "../lib/types/election";
import type { PartyParticipation } from "../lib/types/party";

interface ElectionProps {
  title: string;
  theses: Thesis[];
  partyParticipations: PartyParticipation[];
}

export function Election({ title, theses, partyParticipations }: ElectionProps) {
  const [answers, setAnswers] = useState<Answer[] | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [quizScrollPosition, setQuizScrollPosition] = useState<number>(0);

  const handleQuizComplete = (finalAnswers: Answer[], scrollPosition: number) => {
    setAnswers(finalAnswers);
    setQuizScrollPosition(scrollPosition);
    setShowResults(true);
  };

  const handleBackToQuiz = () => {
    setShowResults(false);
  };

  return showResults && answers ? (
    <Results
      answers={answers}
      theses={theses}
      title={title}
      partyParticipations={partyParticipations}
      onBack={handleBackToQuiz}
    />
  ) : (
    <Quiz
      title={title}
      theses={theses}
      initialAnswers={answers || undefined}
      initialScrollPosition={quizScrollPosition}
      onComplete={handleQuizComplete}
    />
  );
}
