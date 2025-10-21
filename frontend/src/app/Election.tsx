import { useState } from "react";
import { Quiz } from "./Quiz";
import { Results } from "./Results";
import type { Answer, Thesis } from "./types";

interface ElectionProps {
  title: string;
  theses: Thesis[];
}

export function Election({ title, theses }: ElectionProps) {
  const [answers, setAnswers] = useState<Answer[] | null>(null);

  const showResults = answers !== null;

  const handleQuizComplete = (finalAnswers: Answer[]) => {
    setAnswers(finalAnswers);
  };

  return showResults ? (
    <Results answers={answers} theses={theses} title={title} />
  ) : (
    <Quiz title={title} theses={theses} onComplete={handleQuizComplete} />
  );
}
