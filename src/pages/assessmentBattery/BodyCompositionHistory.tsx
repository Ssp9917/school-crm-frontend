import { Fragment } from "react";

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface HistoryPoint {
  value: number | null;   // plotted position; null = not recorded for this column
  label: string;          // text shown at the point (raw value or grade)
}

export interface HistoryRow {
  label: string;          // e.g. "Cardiovascular Endurance"
  sub?:  string;          // e.g. "6-Minute Walk Test"
  unit?: string;          // e.g. "m"
  points: HistoryPoint[];
}

export interface HistoryColumn {
  date:  string;
  time?: string;
}

/* viewBox padding (0–100 units) — leaves room above for value labels */
const PAD_TOP = 34;
const PAD_BOTTOM = 22;

const xAt = (i: number, n: number) => (n <= 1 ? 50 : ((i + 0.5) / n) * 100);

/* ─── Component ──────────────────────────────────────────────────────── */

const AssessmentHistory = ({
  title,
  columns,
  rows,
  domain,
}: {
  title:   string;
  columns: HistoryColumn[];
  rows:    HistoryRow[];
  domain?: [number, number];   // fixed y-scale shared by all rows; omit for per-row min/max
}) => {
  const n = columns.length;

  return (
    <div className="bch">
      <div className="bch-title">{title}</div>

      <div className="bch-table">
        {rows.map((row, ri) => {
          const present = row.points.map((p) => p.value).filter((v): v is number => v != null);
          const min = domain ? domain[0] : present.length ? Math.min(...present) : 0;
          const max = domain ? domain[1] : present.length ? Math.max(...present) : 1;
          const span = max - min || 1;

          const coords = row.points.map((p, i) =>
            p.value == null
              ? null
              : {
                  x: xAt(i, n),
                  y: PAD_TOP + (1 - (p.value - min) / span) * (100 - PAD_TOP - PAD_BOTTOM),
                  label: p.label,
                },
          );
          const linePts = coords.filter(Boolean) as { x: number; y: number; label: string }[];

          return (
            <div className="bch-row" key={ri}>
              <div className="bch-label">
                <span className="bch-label-main">
                  {row.label} {row.unit && <em>({row.unit})</em>}
                </span>
                {row.sub && <span className="bch-label-sub">{row.sub}</span>}
              </div>
              <div className="bch-plot">
                {linePts.length > 1 && (
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="bch-svg">
                    <polyline
                      points={linePts.map((p) => `${p.x},${p.y}`).join(" ")}
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                )}
                {coords.map((c, i) =>
                  c ? (
                    <Fragment key={i}>
                      <span className="bch-val" style={{ left: `${c.x}%`, top: `${c.y}%` }}>{c.label}</span>
                      <span className="bch-dot" style={{ left: `${c.x}%`, top: `${c.y}%` }} />
                    </Fragment>
                  ) : null,
                )}
              </div>
            </div>
          );
        })}

        <div className="bch-row bch-dates-row">
          <div className="bch-label" />
          <div className="bch-plot">
            {columns.map((c, i) => (
              <span className="bch-date" style={{ left: `${xAt(i, n)}%` }} key={i}>
                <span className="bch-date-day">{c.date}</span>
                {c.time && <span className="bch-date-time">{c.time}</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentHistory;
