export default function ModulePage({ title, summary }) {
  return (
    <section>
      <h1>{title}</h1>
      <p>{summary}</p>
      <p className="muted">Scaffolded from PRD requirements. Next step is implementing full CRUD and reporting workflows.</p>
    </section>
  );
}
