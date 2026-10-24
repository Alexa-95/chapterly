import { desc } from "drizzle-orm";
import { goals } from "@/db/schema";
import { setGoal } from "@/lib/actions";
import { getDb } from "@/lib/db";
import { booksWord } from "@/lib/format";
import { finishedPerYear } from "@/lib/stats";
import GoalRing from "@/components/GoalRing";
import ProgressBar from "@/components/ProgressBar";

export const metadata = { title: "Goals" };

export default async function GoalsPage() {
  const year = new Date().getFullYear();
  const [allGoals, perYear] = await Promise.all([
    getDb().select().from(goals).orderBy(desc(goals.year)),
    finishedPerYear(),
  ]);
  const current = allGoals.find((g) => g.year === year);
  const done = perYear.get(year) ?? 0;

  // How many books per month are needed to stay on track
  const monthsLeft = 12 - new Date().getMonth();
  const perMonth = current ? Math.max(0, Math.ceil((current.target - done) / monthsLeft)) : 0;

  return (
    <div className="stack-lg">
      <header className="page-head">
        <h1>Reading goals</h1>
        <p className="muted">A small resolution, many good evenings.</p>
      </header>

      <section className="card goal-card">
        <GoalRing done={done} target={current?.target ?? 0} size={170} />
        <div className="stack">
          <h2>{year}</h2>
          {current ? (
            <p className="muted">
              {done >= current.target
                ? "Goal reached — congratulations! 🌿"
                : `You've read ${booksWord(done)}. To stay on track, you need about ${booksWord(perMonth)} a month.`}
            </p>
          ) : (
            <p className="muted">Decide how many books you want to read this year.</p>
          )}
          <form action={setGoal} className="row">
            <input type="hidden" name="year" value={year} />
            <input type="number" name="target" min={1} max={999} defaultValue={current?.target ?? 12} className="input-narrow" aria-label="Number of books" />
            <button className="btn btn-primary btn-small">{current ? "Change goal" : "Set goal"}</button>
          </form>
        </div>
      </section>

      {allGoals.some((g) => g.year !== year) && (
        <section className="stack">
          <h2>Previous years</h2>
          <ul className="goal-list">
            {allGoals
              .filter((g) => g.year !== year)
              .map((g) => {
                const n = perYear.get(g.year) ?? 0;
                return (
                  <li key={g.year} className="card">
                    <div className="section-head">
                      <strong>{g.year}</strong>
                      <span className="small muted">
                        {n} / {g.target} {n >= g.target ? "✓" : ""}
                      </span>
                    </div>
                    <ProgressBar value={n} max={g.target} />
                  </li>
                );
              })}
          </ul>
        </section>
      )}
    </div>
  );
}
