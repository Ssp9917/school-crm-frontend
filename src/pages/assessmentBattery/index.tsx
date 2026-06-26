import { useMemo, useState } from "react";
import { Input, InputNumber, Select, Tag, Progress, Button, Tabs, Empty } from "antd";
import {
  HeartOutlined,
  ThunderboltOutlined,
  FireOutlined,
  SafetyCertificateOutlined,
  ColumnHeightOutlined,
  InteractionOutlined,
  AimOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import AssessmentHistory from "./BodyCompositionHistory";
import "./styles.scss";

/* ─── Grading model ──────────────────────────────────────────────────── */

type Grade = "Excellent" | "Good" | "Average" | "Below Average";

const GRADE_META: Record<Grade, { color: string; cls: string; score: number }> = {
  "Excellent":     { color: "#52c41a", cls: "excellent", score: 4 },
  "Good":          { color: "#1890ff", cls: "good",      score: 3 },
  "Average":       { color: "#faad14", cls: "average",   score: 2 },
  "Below Average": { color: "#ff4d4f", cls: "below",     score: 1 },
};

const GRADE_ORDER: Grade[] = ["Excellent", "Good", "Average", "Below Average"];

interface Band {
  grade: Grade;
  label: string;
  match?: (v: number) => boolean;
  value?: string;
}

interface TestDef {
  key:        string;
  category:   string;
  assessment: string;
  metric:     string;
  type:       "number" | "select";
  unit?:      string;
  icon:       React.ReactNode;
  bands:      Band[];
}

const TESTS: TestDef[] = [
  {
    key: "cardio",
    category: "Cardiovascular Endurance",
    assessment: "6-Minute Walk Test",
    metric: "Distance",
    type: "number",
    unit: "m",
    icon: <HeartOutlined />,
    bands: [
      { grade: "Excellent",     label: "> 700 m",     match: (v) => v > 700 },
      { grade: "Good",          label: "600–700 m",   match: (v) => v >= 600 },
      { grade: "Average",       label: "500–599 m",   match: (v) => v >= 500 },
      { grade: "Below Average", label: "< 500 m",     match: () => true },
    ],
  },
  {
    key: "maxStrength",
    category: "Maximal Strength",
    assessment: "3RM Strength Test (Upper & Lower Body)",
    metric: "Result",
    type: "select",
    icon: <ThunderboltOutlined />,
    bands: [
      { grade: "Excellent",     label: "Top 20%",       value: "top20" },
      { grade: "Good",          label: "Above Average", value: "above" },
      { grade: "Average",       label: "Meets Norms",   value: "norms" },
      { grade: "Below Average", label: "Below Norms",   value: "below" },
    ],
  },
  {
    key: "strengthEndurance",
    category: "Strength Endurance",
    assessment: "Push-Up Cadence Test",
    metric: "Repetitions",
    type: "number",
    unit: "reps",
    icon: <FireOutlined />,
    bands: [
      { grade: "Excellent",     label: "> 40",   match: (v) => v > 40 },
      { grade: "Good",          label: "30–40",  match: (v) => v >= 30 },
      { grade: "Average",       label: "15–29",  match: (v) => v >= 15 },
      { grade: "Below Average", label: "< 15",   match: () => true },
    ],
  },
  {
    key: "core",
    category: "Core Endurance & Stability",
    assessment: "McGill Core Endurance Battery",
    metric: "Hold Time",
    type: "number",
    unit: "sec",
    icon: <SafetyCertificateOutlined />,
    bands: [
      { grade: "Excellent",     label: "> 120 sec",   match: (v) => v > 120 },
      { grade: "Good",          label: "90–120 sec",  match: (v) => v >= 90 },
      { grade: "Average",       label: "60–89 sec",   match: (v) => v >= 60 },
      { grade: "Below Average", label: "< 60 sec",    match: () => true },
    ],
  },
  {
    key: "lowerFlex",
    category: "Lower Body Flexibility",
    assessment: "Sit-and-Reach Test",
    metric: "Reach",
    type: "number",
    unit: "cm",
    icon: <ColumnHeightOutlined />,
    bands: [
      { grade: "Excellent",     label: "> 15 cm",  match: (v) => v > 15 },
      { grade: "Good",          label: "6–15 cm",  match: (v) => v >= 6 },
      { grade: "Average",       label: "0–5 cm",   match: (v) => v >= 0 },
      { grade: "Below Average", label: "< 0 cm",   match: () => true },
    ],
  },
  {
    key: "upperMobility",
    category: "Upper Body Mobility",
    assessment: "Shoulder Mobility Assessment (Back Scratch Protocol)",
    metric: "Finger Distance",
    type: "select",
    icon: <InteractionOutlined />,
    bands: [
      { grade: "Excellent",     label: "Overlap > 5 cm",     value: "overlap" },
      { grade: "Good",          label: "Touch / Near Touch", value: "touch" },
      { grade: "Average",       label: "0–5 cm Apart",       value: "apart05" },
      { grade: "Below Average", label: "> 5 cm Apart",       value: "apart5" },
    ],
  },
  {
    key: "balance",
    category: "Dynamic Balance & Stability",
    assessment: "Star Excursion Balance Test (SEBT)",
    metric: "Reach Score",
    type: "number",
    unit: "% leg length",
    icon: <AimOutlined />,
    bands: [
      { grade: "Excellent",     label: "> 95% Leg Length", match: (v) => v > 95 },
      { grade: "Good",          label: "90–95%",           match: (v) => v >= 90 },
      { grade: "Average",       label: "80–89%",           match: (v) => v >= 80 },
      { grade: "Below Average", label: "< 80%",            match: () => true },
    ],
  },
];

/* ─── Helpers ────────────────────────────────────────────────────────── */

type EntryValue = number | string | null;

interface Assessment {
  id:      string;
  date:    string;            // yyyy-mm-dd
  entries: Record<string, EntryValue>;
}

const gradeFor = (test: TestDef, value: EntryValue): Grade | null => {
  if (value === null || value === undefined || value === "") return null;
  if (test.type === "number") {
    const v = Number(value);
    if (Number.isNaN(v)) return null;
    const band = test.bands.find((b) => b.match!(v));
    return band ? band.grade : null;
  }
  const band = test.bands.find((b) => b.value === value);
  return band ? band.grade : null;
};

/** Max points: every test gives up to 4 (Excellent=4, Good=3, Average=2, Below=1). */
const MAX_POINTS = TESTS.length * 4; // 28

interface Summary {
  overallGrade: Grade | null;
  percent:      number;          // points / MAX_POINTS
  score:        number;          // average grade score 0–4 (0 = no data)
  points:       number;          // total points earned (0–28)
  maxPoints:    number;          // 28
  completed:    number;
  counts:       Record<Grade, number>;
}

const summarize = (entries: Record<string, EntryValue>): Summary => {
  const counts: Record<Grade, number> = { "Excellent": 0, "Good": 0, "Average": 0, "Below Average": 0 };
  let scoreSum = 0;
  let completed = 0;
  TESTS.forEach((t) => {
    const g = gradeFor(t, entries[t.key] ?? null);
    if (g) { counts[g] += 1; scoreSum += GRADE_META[g].score; completed += 1; }
  });
  if (completed === 0)
    return { overallGrade: null, percent: 0, score: 0, points: 0, maxPoints: MAX_POINTS, completed: 0, counts };
  const avg = scoreSum / completed;
  const overallGrade: Grade =
    avg >= 3.5 ? "Excellent" : avg >= 2.5 ? "Good" : avg >= 1.5 ? "Average" : "Below Average";
  return {
    overallGrade,
    percent: Math.round((scoreSum / MAX_POINTS) * 100),
    score: Number(avg.toFixed(2)),
    points: scoreSum,
    maxPoints: MAX_POINTS,
    completed,
    counts,
  };
};

const today = () => new Date().toISOString().slice(0, 10);

/* ─── Shared gauge ───────────────────────────────────────────────────── */

const Gauge = ({ summary, size = 150 }: { summary: Summary; size?: number }) => (
  <Progress
    type="dashboard"
    percent={summary.percent}
    strokeColor={summary.overallGrade ? GRADE_META[summary.overallGrade].color : "var(--muted)"}
    trailColor="var(--inputBg)"
    size={size}
    format={() => (
      <div className="ab-gauge">
        <TrophyOutlined style={{ color: summary.overallGrade ? GRADE_META[summary.overallGrade].color : "var(--muted)" }} />
        <div className="ab-gauge-grade">{summary.points} / {summary.maxPoints}</div>
        <div className="ab-gauge-sub">{summary.overallGrade ?? `${summary.completed}/${TESTS.length} tests`}</div>
      </div>
    )}
  />
);

/* ─── Single assessment form ─────────────────────────────────────────── */

const AssessmentForm = ({
  assessment,
  onChange,
}: {
  assessment: Assessment;
  onChange: (next: Partial<Assessment>) => void;
}) => {
  const setEntry = (key: string, value: EntryValue) =>
    onChange({ entries: { ...assessment.entries, [key]: value } });

  const summary = useMemo(() => summarize(assessment.entries), [assessment.entries]);

  return (
    <div className="ab-assessment-pane">
      <div className="ab-pane-summary">
        <div className="ab-pane-meta">
          <label className="ab-field-label">Assessment date</label>
          <Input
            type="date"
            value={assessment.date}
            onChange={(e) => onChange({ date: e.target.value })}
            style={{ maxWidth: 200 }}
          />
          <div className="ab-grade-counts">
            {GRADE_ORDER.map((g) => (
              <div key={g} className={`ab-count ${GRADE_META[g].cls}`}>
                <span className="dot" />
                <span className="n">{summary.counts[g]}</span>
                <span className="lbl">{g}</span>
              </div>
            ))}
          </div>
        </div>
        <Gauge summary={summary} />
      </div>

      <div className="ab-grid">
        {TESTS.map((test) => {
          const grade = gradeFor(test, assessment.entries[test.key] ?? null);
          return (
            <div key={test.key} className={`ab-card ${grade ? GRADE_META[grade].cls : ""}`}>
              <div className="ab-card-head">
                <span className="ab-icon">{test.icon}</span>
                <div className="ab-card-titles">
                  <h3>{test.category}</h3>
                  <span className="ab-assessment">{test.assessment}</span>
                </div>
                {grade && <Tag color={GRADE_META[grade].color} className="ab-grade-tag">{grade}</Tag>}
              </div>

              <div className="ab-input-row">
                <label className="ab-field-label">{test.metric}</label>
                {test.type === "number" ? (
                  <InputNumber
                    value={assessment.entries[test.key] as number | undefined}
                    onChange={(v) => setEntry(test.key, v ?? null)}
                    placeholder={`Enter ${test.metric.toLowerCase()}`}
                    addonAfter={test.unit}
                    controls={false}
                    style={{ width: "100%" }}
                  />
                ) : (
                  <Select
                    value={(assessment.entries[test.key] as string) || undefined}
                    onChange={(v) => setEntry(test.key, v)}
                    placeholder="Select result"
                    allowClear
                    style={{ width: "100%" }}
                    options={test.bands.map((b) => ({ label: b.label, value: b.value! }))}
                  />
                )}
              </div>

              <div className="ab-bands">
                {test.bands.map((b) => (
                  <div key={b.grade} className={`ab-band ${GRADE_META[b.grade].cls} ${grade === b.grade ? "active" : ""}`}>
                    <span className="ab-band-grade">
                      {b.grade}
                      <span className="ab-band-pts">{GRADE_META[b.grade].score} pt</span>
                    </span>
                    <span className="ab-band-range">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Overall / progression view ─────────────────────────────────────── */

const Trend = ({ delta }: { delta: number }) => {
  if (delta > 0) return <RiseOutlined className="ab-trend up" />;
  if (delta < 0) return <FallOutlined className="ab-trend down" />;
  return <MinusOutlined className="ab-trend flat" />;
};

const OverallView = ({ assessments }: { assessments: Assessment[] }) => {
  const summaries = useMemo(() => assessments.map((a) => summarize(a.entries)), [assessments]);

  if (assessments.length === 0) {
    return <Empty className="ab-empty" description="No assessments yet — add one to start tracking" />;
  }

  const latest = summaries[summaries.length - 1];
  const prev = summaries.length > 1 ? summaries[summaries.length - 2] : null;
  const overallDelta = prev && latest.overallGrade && prev.overallGrade
    ? GRADE_META[latest.overallGrade].score - GRADE_META[prev.overallGrade].score
    : 0;

  // History rows: one per test (matching the assessment cards), plotted across
  // assessments by points (Excellent=4 … Below=1), labelled with the point value.
  const historyColumns = assessments.map((a) => ({ date: a.date || "—" }));
  const historyRows = TESTS.map((test) => ({
    label: test.category,
    sub:   test.assessment,
    unit:  "pts",
    points: assessments.map((a) => {
      const v = a.entries[test.key] ?? null;
      const g = gradeFor(test, v);
      if (!g || v === null || v === "") return { value: null, label: "" };
      const pts = GRADE_META[g].score;
      return { value: pts, label: `${pts}` };
    }),
  }));

  return (
    <div className="ab-overall">
      <div className="ab-overall-stats">
        <div className="ab-stat">
          <span className="ab-stat-label">Assessments taken</span>
          <span className="ab-stat-value">{assessments.length}</span>
        </div>
        <div className="ab-stat">
          <span className="ab-stat-label">Latest overall grade</span>
          <span className="ab-stat-value" style={{ color: latest.overallGrade ? GRADE_META[latest.overallGrade].color : "var(--muted)" }}>
            {latest.overallGrade ?? "—"}
          </span>
        </div>
        <div className="ab-stat">
          <span className="ab-stat-label">Trend vs previous</span>
          <span className="ab-stat-value">
            <Trend delta={overallDelta} /> {overallDelta > 0 ? "Improved" : overallDelta < 0 ? "Declined" : "Steady"}
          </span>
        </div>
      </div>

      <AssessmentHistory title="Assessment History" columns={historyColumns} rows={historyRows} domain={[1, 4]} />
    </div>
  );
};

/* ─── Demo data (remove once wired to a real source) ─────────────────── */

const DEMO_ASSESSMENTS: Assessment[] = [
  {
    id: "a-1", date: "2026-03-21",
    entries: { cardio: 540, maxStrength: "norms", strengthEndurance: 18, core: 70,  lowerFlex: 3,  upperMobility: "apart05", balance: 82 },
  },
  {
    id: "a-2", date: "2026-04-16",
    entries: { cardio: 610, maxStrength: "above", strengthEndurance: 28, core: 95,  lowerFlex: 8,  upperMobility: "touch",   balance: 88 },
  },
  {
    id: "a-3", date: "2026-05-06",
    entries: { cardio: 690, maxStrength: "above", strengthEndurance: 35, core: 110, lowerFlex: 12, upperMobility: "touch",   balance: 92 },
  },
  {
    id: "a-4", date: "2026-06-22",
    entries: { cardio: 720, maxStrength: "top20", strengthEndurance: 42, core: 130, lowerFlex: 17, upperMobility: "overlap", balance: 96 },
  },
];

/* ─── Page ───────────────────────────────────────────────────────────── */

const AssessmentBattery = () => {
  const [memberName, setMemberName] = useState("");
  const [seq, setSeq] = useState(5);
  const [assessments, setAssessments] = useState<Assessment[]>(DEMO_ASSESSMENTS);
  const [activeKey, setActiveKey] = useState("overall");

  const updateAssessment = (id: string, next: Partial<Assessment>) =>
    setAssessments((prev) => prev.map((a) => (a.id === id ? { ...a, ...next } : a)));

  const addAssessment = () => {
    const id = `a-${seq}`;
    setSeq((s) => s + 1);
    setAssessments((prev) => [...prev, { id, date: today(), entries: {} }]);
    setActiveKey(id);
  };

  const removeAssessment = (id: string) => {
    setAssessments((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (activeKey === id) setActiveKey(next.length ? next[next.length - 1].id : "overall");
      return next;
    });
  };

  const items = [
    {
      key: "overall",
      label: <span><TrophyOutlined /> Overall</span>,
      closable: false,
      children: <OverallView assessments={assessments} />,
    },
    ...assessments.map((a, i) => ({
      key: a.id,
      label: `Assessment ${i + 1}`,
      closable: assessments.length > 1,
      children: <AssessmentForm assessment={a} onChange={(next) => updateAssessment(a.id, next)} />,
    })),
  ];

  return (
    <div className="assessment-battery">
      <div className="ab-header">
        <div className="ab-title">
          <span className="ab-eyebrow">Fitclub Performance Lab</span>
          <h1>Assessment Battery</h1>
          <p>Track every assessment a member takes — each test is graded against the lab norms, with an overall progression view.</p>
        </div>
        <div className="ab-header-right">
          <div>
            <label className="ab-field-label">Member</label>
            <Input
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Member name (optional)"
              allowClear
              style={{ width: 220 }}
            />
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={addAssessment} className="ab-add">
            New Assessment
          </Button>
        </div>
      </div>

      <Tabs
        type="editable-card"
        activeKey={activeKey}
        onChange={setActiveKey}
        hideAdd
        onEdit={(targetKey, action) => {
          if (action === "remove" && typeof targetKey === "string") removeAssessment(targetKey);
        }}
        items={items}
        className="ab-tabs"
      />
    </div>
  );
};

export default AssessmentBattery;
