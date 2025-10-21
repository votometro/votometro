interface QuizProps {
  title: string;
  theses: any;
}

export function Quiz({ title, theses }: QuizProps) {
  console.log(theses);
  return (
    <section className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">Votómetro</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-8">{title}</h2>

        <h3 className="text-xl font-bold text-text-primary mb-6">Tesis</h3>
        <ul className="space-y-6">
          {theses.map((thesis: any) => (
            <li key={thesis._id} className="bg-surface p-6 rounded-lg shadow-md">
              <h4 className="text-lg font-semibold text-text-primary mb-2">{thesis.title}</h4>
              <p className="text-text-secondary">{thesis.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
