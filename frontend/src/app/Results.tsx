import type { Answer, Thesis } from "./types";

interface ResultsProps {
  answers: Answer[];
  theses: Thesis[];
  title: string;
}

export function Results({ answers, theses, title }: ResultsProps) {
  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
          Resultados
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-8">
          {title}
        </h2>

        <div className="bg-surface rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-text-primary mb-4">
            Tus respuestas
          </h3>
          <pre className="bg-background p-4 rounded overflow-x-auto text-sm text-text-secondary">
            {JSON.stringify(answers, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
