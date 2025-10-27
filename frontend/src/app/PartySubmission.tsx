import { useState, useEffect, useCallback } from "react";
import type { PartySubmissionSession } from "../server/data/partyParticipation";
import type { PartyAnswer } from "../lib/types/party";

interface PartySubmissionProps {
  session: PartySubmissionSession;
}

export function PartySubmission({ session }: PartySubmissionProps) {
  const [answers, setAnswers] = useState<Map<string, PartyAnswer>>(
    new Map(session.answers.map((a) => [a.thesisKey, a]))
  );
  const [currentThesisIndex, setCurrentThesisIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentThesis = session.election.theses[currentThesisIndex];
  const currentAnswer = answers.get(currentThesis._key);
  const isLastThesis = currentThesisIndex === session.election.theses.length - 1;
  const answeredCount = answers.size;
  const totalTheses = session.election.theses.length;
  const allAnswered = answeredCount === totalTheses;

  // Check if deadline has passed
  const deadlinePassed = session.submissionDeadline
    ? new Date(session.submissionDeadline) < new Date()
    : false;

  // Check if already submitted
  const isSubmitted = session.status === "submitted" || session.status === "under_review" || session.status === "approved";

  // Check if in revision mode
  const isRevisionRequested = session.status === "revision_requested";

  const saveAnswer = useCallback(
    async (thesisKey: string, value: -1 | 0 | 1, justification: string) => {
      setIsSaving(true);
      try {
        const response = await fetch("/api/party-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: session.token,
            participationId: session.id,
            thesisKey,
            value,
            justification,
          }),
        });

        if (response.ok) {
          setLastSaved(new Date());
        } else {
          console.error("Failed to save answer");
        }
      } catch (error) {
        console.error("Error saving answer:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [session.id, session.token]
  );

  const handleValueChange = (value: -1 | 0 | 1) => {
    const justification = currentAnswer?.justification || "";
    const newAnswer: PartyAnswer = { thesisKey: currentThesis._key, value, justification };

    setAnswers(new Map(answers.set(currentThesis._key, newAnswer)));

    // Auto-save
    saveAnswer(currentThesis._key, value, justification);
  };

  const handleJustificationChange = (justification: string) => {
    if (!currentAnswer?.value && currentAnswer?.value !== 0) return;

    const newAnswer: PartyAnswer = {
      thesisKey: currentThesis._key,
      value: currentAnswer.value,
      justification,
    };

    setAnswers(new Map(answers.set(currentThesis._key, newAnswer)));
  };

  // Debounced auto-save for justification
  useEffect(() => {
    if (!currentAnswer?.value && currentAnswer?.value !== 0) return;
    if (!currentAnswer.justification) return;

    const timer = setTimeout(() => {
      saveAnswer(currentThesis._key, currentAnswer.value, currentAnswer.justification);
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentAnswer, currentThesis._key, saveAnswer]);

  const handleNext = () => {
    if (currentThesisIndex < session.election.theses.length - 1) {
      setCurrentThesisIndex(currentThesisIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentThesisIndex > 0) {
      setCurrentThesisIndex(currentThesisIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      alert("Por favor responde todas las tesis antes de enviar.");
      return;
    }

    const confirmed = confirm(
      "¿Estás seguro que quieres enviar tus respuestas? No podrás editarlas después."
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/party-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: session.token,
          participationId: session.id
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
      } else {
        alert("Error al enviar. Por favor intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Error al enviar. Por favor intenta nuevamente.");
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-6">
          <div className="text-6xl">✅</div>
          <h1 className="text-3xl font-bold">¡Respuestas Enviadas!</h1>
          <p className="text-gray-600">
            Gracias por completar el cuestionario. Tus respuestas han sido enviadas
            al equipo editorial para su revisión.
          </p>
          {session.party.logoUrl && (
            <img
              src={session.party.logoUrl}
              alt={session.party.name}
              className="mx-auto h-20 object-contain"
            />
          )}
          <p className="text-lg font-semibold">{session.party.name}</p>
        </div>
      </div>
    );
  }

  if (isSubmitted && !isRevisionRequested) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-6">
          <div className="text-6xl">📋</div>
          <h1 className="text-3xl font-bold">Respuestas Ya Enviadas</h1>
          <p className="text-gray-600">
            Las respuestas de {session.party.name} ya han sido enviadas y están
            {session.status === "approved" ? " aprobadas" : " en revisión"}.
          </p>
          {session.party.logoUrl && (
            <img
              src={session.party.logoUrl}
              alt={session.party.name}
              className="mx-auto h-20 object-contain"
            />
          )}
        </div>
      </div>
    );
  }

  if (deadlinePassed && !isRevisionRequested) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-6">
          <div className="text-6xl">⏰</div>
          <h1 className="text-3xl font-bold">Plazo Vencido</h1>
          <p className="text-gray-600">
            El plazo para enviar respuestas ha vencido
            {session.submissionDeadline &&
              ` (${new Date(session.submissionDeadline).toLocaleDateString()})`}
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {session.party.logoUrl && (
                <img
                  src={session.party.logoUrl}
                  alt={session.party.name}
                  className="h-12 object-contain"
                />
              )}
              <div>
                <h1 className="font-bold text-lg">{session.party.name}</h1>
                <p className="text-sm text-gray-600">{session.election.title}</p>
              </div>
            </div>
            {lastSaved && (
              <div className="text-xs text-gray-500">
                {isSaving ? "Guardando..." : `Guardado ${lastSaved.toLocaleTimeString()}`}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(answeredCount / totalTheses) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">
              {answeredCount}/{totalTheses}
            </span>
          </div>
          {isRevisionRequested && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              🔄 Se han solicitado revisiones. Por favor revisa y actualiza tus respuestas.
            </div>
          )}
          {session.submissionDeadline && !deadlinePassed && (
            <div className="mt-2 text-xs text-gray-500">
              Plazo: {new Date(session.submissionDeadline).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Thesis */}
          <div>
            <div className="text-sm text-gray-500 mb-2">
              Tesis {currentThesisIndex + 1} de {totalTheses}
            </div>
            <h2 className="text-xl font-bold mb-2">{currentThesis.title}</h2>
            <p className="text-gray-700">{currentThesis.text}</p>
          </div>

          {/* Position Selection */}
          <div>
            <label className="block text-sm font-semibold mb-3">Tu posición:</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleValueChange(1)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  currentAnswer?.value === 1
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <div className="text-3xl mb-1">👍</div>
                <div className="text-sm font-semibold">A favor</div>
              </button>
              <button
                onClick={() => handleValueChange(0)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  currentAnswer?.value === 0
                    ? "border-gray-500 bg-gray-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-3xl mb-1">🤷</div>
                <div className="text-sm font-semibold">Neutral</div>
              </button>
              <button
                onClick={() => handleValueChange(-1)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  currentAnswer?.value === -1
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-red-300"
                }`}
              >
                <div className="text-3xl mb-1">👎</div>
                <div className="text-sm font-semibold">En contra</div>
              </button>
            </div>
          </div>

          {/* Justification */}
          {(currentAnswer?.value || currentAnswer?.value === 0) && (
            <div>
              <label className="block text-sm font-semibold mb-2">
                Justificación:
              </label>
              <textarea
                value={currentAnswer.justification}
                onChange={(e) => handleJustificationChange(e.target.value)}
                placeholder="Explica tu posición..."
                className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {currentAnswer.justification.length} caracteres
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <button
              onClick={handlePrevious}
              disabled={currentThesisIndex === 0}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>

            {isLastThesis ? (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isRevisionRequested ? "Reenviar" : "Enviar Respuestas"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded"
              >
                Siguiente →
              </button>
            )}
          </div>
        </div>

        {/* Thesis Navigation */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3">Todas las tesis:</h3>
          <div className="grid grid-cols-8 gap-2">
            {session.election.theses.map((thesis, index) => {
              const answer = answers.get(thesis._key);
              const isAnswered = answer && (answer.value || answer.value === 0);

              return (
                <button
                  key={thesis._key}
                  onClick={() => setCurrentThesisIndex(index)}
                  className={`aspect-square rounded flex items-center justify-center text-sm font-semibold transition-all ${
                    index === currentThesisIndex
                      ? "bg-blue-600 text-white ring-2 ring-blue-400"
                      : isAnswered
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
