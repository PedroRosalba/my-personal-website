import type { Receipt } from "@/content/projects";

const STATE: Record<Receipt["state"], string> = { merged: "Merged", review: "In review", reported: "Reported" };

const n = (x: number) => x.toLocaleString("en-US");
const day = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** Real pull requests as cards: status, repo and number, size, title, and one line on what changed. Each opens it. */
export function Receipts({ receipts }: { receipts: Receipt[] }) {
  return (
    <ul className="receipts">
      {receipts.map((r) => (
        <li key={r.href}>
          <a className="receipt" href={r.href} target="_blank" rel="noreferrer">
            <span className="r-top">
              <span className={`r-state r-${r.state}`}>{STATE[r.state]}</span>
              <span className="r-ref">
                {r.repo} #{r.number}
                {r.fixedIn ? ` → fixed in #${r.fixedIn}` : null}
              </span>
              {r.added != null && r.removed != null ? (
                <span className="r-size">
                  +{n(r.added)} −{n(r.removed)}
                </span>
              ) : null}
            </span>
            <span className="r-title">{r.title}</span>
            <span className="r-what">{r.what}</span>
            <time className="r-date" dateTime={r.date}>
              {day(r.date)}
            </time>
          </a>
        </li>
      ))}
    </ul>
  );
}
