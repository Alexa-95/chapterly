type Bar = { label: string; value: number; hint: string };

/** Prosty wykres słupkowy (jedna seria) z podpowiedzią po najechaniu. */
export default function BarChart({ data, caption }: { data: Bar[]; caption: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <figure className="bars">
      <div className="bars-plot" role="img" aria-label={caption}>
        {data.map((d) => (
          <div key={d.label} className="bar-col" tabIndex={0}>
            <span className="bar-tip">{d.hint}</span>
            <div className="bar-track">
              <div className="bar" style={{ height: `${(d.value / max) * 100}%` }} />
            </div>
            <span className="bar-label">{d.label}</span>
          </div>
        ))}
      </div>
      <figcaption className="tiny muted">{caption}</figcaption>
    </figure>
  );
}
