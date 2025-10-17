interface AppProps {
  title: string;
  theses: any;
}

export function App({ title, theses }: AppProps) {
  console.log(theses);
  return (
    <section>
      <h1>Votometro</h1>
      <h2>{title}</h2>

      <h3>Theses</h3>
      <ul>
        {theses.map((thesis: any) => (
          <li key={thesis._id}>
            <h4>{thesis.title}</h4>
            <p>{thesis.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
