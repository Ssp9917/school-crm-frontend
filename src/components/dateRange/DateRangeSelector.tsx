import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import dayjs, { Dayjs } from "dayjs";
import { CalendarOutlined, DownOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import "./styles.scss";

interface DateSelection {
  startDate: Date;
  endDate: Date;
  key: string;
}

interface DateRangeSelectorProps {
  // Loosely typed to stay a drop-in for the previously-untyped component;
  // at runtime the payload is always a DateSelection ({ startDate, endDate, key }).
  onChange?: (selection: any) => void;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const PRESETS: { label: string; getRange: () => [Dayjs, Dayjs] }[] = [
  { label: "Today",      getRange: () => [dayjs().startOf("day"), dayjs().startOf("day")] },
  { label: "Yesterday",  getRange: () => [dayjs().subtract(1, "day").startOf("day"), dayjs().subtract(1, "day").startOf("day")] },
  { label: "This Week",  getRange: () => [dayjs().startOf("week"), dayjs().endOf("week").startOf("day")] },
  { label: "Last Week",  getRange: () => [dayjs().subtract(1, "week").startOf("week"), dayjs().subtract(1, "week").endOf("week").startOf("day")] },
  { label: "This Month", getRange: () => [dayjs().startOf("month"), dayjs().endOf("month").startOf("day")] },
  { label: "Last Month", getRange: () => [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month").startOf("day")] },
];

// Build a month grid (whole weeks, Sunday-first) including leading/trailing
// days from neighbouring months so the grid is always rectangular.
const buildMonthMatrix = (monthDate: Dayjs): Dayjs[] => {
  const firstOfMonth = monthDate.startOf("month");
  const startWeekday = firstOfMonth.day(); // 0 = Sunday
  const gridStart = firstOfMonth.subtract(startWeekday, "day");
  const daysInMonth = firstOfMonth.daysInMonth();
  const weeks = Math.ceil((startWeekday + daysInMonth) / 7);
  const cells: Dayjs[] = [];
  for (let i = 0; i < weeks * 7; i++) cells.push(gridStart.add(i, "day"));
  return cells;
};

const DateRangeSelector = ({ onChange }: DateRangeSelectorProps) => {
  const today = dayjs().startOf("day");

  const [start, setStart]         = useState<Dayjs>(today);
  const [end, setEnd]             = useState<Dayjs>(today);
  const [selecting, setSelecting] = useState(false);
  const [hovered, setHovered]     = useState<Dayjs | null>(null);
  const [viewDate, setViewDate]   = useState<Dayjs>(today.startOf("month"));

  const [show, setShow]     = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const pickerRef = useRef<HTMLDivElement>(null);
  const popupRef  = useRef<HTMLDivElement>(null);

  // Media queries for responsive behavior
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  const monthsToShow = isMobile || isTablet ? 1 : 2;

  // Close on outside click (popup is portaled, so check both refs)
  useEffect(() => {
    if (!show) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideTrigger = pickerRef.current && pickerRef.current.contains(target);
      const insidePopup = popupRef.current && popupRef.current.contains(target);
      if (!insideTrigger && !insidePopup) setShow(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show]);

  // Reset the in-progress selection whenever the popup closes
  useEffect(() => {
    if (!show) {
      setSelecting(false);
      setHovered(null);
    } else {
      // Open on the month containing the current start date
      setViewDate(start.startOf("month"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // Position the (portaled) picker just below the trigger, anchored so it
  // never spills off-screen. Rendered in document.body so it floats above
  // the layout (sider, header, scrolling content) instead of being clipped.
  useEffect(() => {
    if (!show || isMobile || !pickerRef.current) return;
    const reposition = () => {
      if (!pickerRef.current) return;
      const rect = pickerRef.current.getBoundingClientRect();
      const pickerWidth = isTablet ? 420 : 700;
      const margin = 8;
      let left = rect.left;
      if (left + pickerWidth > window.innerWidth - margin) {
        left = Math.max(margin, rect.right - pickerWidth);
      }
      setCoords({ top: rect.bottom + 6, left });
    };
    reposition();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [show, isMobile, isTablet]);

  const emit = (s: Dayjs, e: Dayjs) => {
    onChange?.({ startDate: s.toDate(), endDate: e.toDate(), key: "selection" });
  };

  const handleDayClick = (day: Dayjs) => {
    if (!selecting) {
      // First click — begin a new range
      setStart(day);
      setEnd(day);
      setHovered(day);
      setSelecting(true);
      emit(day, day);
    } else {
      // Second click — close the range (normalise direction)
      let s = start;
      let e = day;
      if (day.isBefore(start, "day")) {
        s = day;
        e = start;
      }
      setStart(s);
      setEnd(e);
      setSelecting(false);
      setHovered(null);
      emit(s, e);
    }
  };

  const handlePreset = (preset: typeof PRESETS[number]) => {
    const [s, e] = preset.getRange();
    setStart(s);
    setEnd(e);
    setSelecting(false);
    setHovered(null);
    setViewDate(s.startOf("month"));
    emit(s, e);
  };

  const formatTrigger = (d: Dayjs) => d.format(isMobile ? "MMM D, YY" : "MMM D, YYYY");
  const displayText = `${formatTrigger(start)} - ${formatTrigger(end)}`;

  // Range bounds for highlighting (with live hover preview while selecting)
  const previewEnd = selecting && hovered ? hovered : end;
  const rangeLo = start.isAfter(previewEnd, "day") ? previewEnd : start;
  const rangeHi = start.isAfter(previewEnd, "day") ? start : previewEnd;
  const isRange = !rangeLo.isSame(rangeHi, "day");

  const currentYear = today.year();
  const years: number[] = [];
  for (let y = currentYear - 20; y <= currentYear + 10; y++) years.push(y);

  const renderMonth = (monthDate: Dayjs) => {
    const cells = buildMonthMatrix(monthDate);
    return (
      <div className="cdr-month" key={monthDate.format("YYYY-MM")}>
        <div className="cdr-month-name">{monthDate.format("MMM YYYY")}</div>
        <div className="cdr-weekdays">
          {WEEKDAYS.map((w) => (
            <span key={w} className="cdr-weekday">{w}</span>
          ))}
        </div>
        <div className="cdr-days">
          {cells.map((day) => {
            const passive = day.month() !== monthDate.month();
            const isToday = day.isSame(today, "day");
            const inRange = isRange && !day.isBefore(rangeLo, "day") && !day.isAfter(rangeHi, "day");
            const isStart = day.isSame(rangeLo, "day");
            const isEnd = day.isSame(rangeHi, "day");
            const cls = [
              "cdr-day",
              passive ? "cdr-day--passive" : "",
              isToday ? "cdr-day--today" : "",
              inRange ? "cdr-day--in-range" : "",
              isStart ? "cdr-day--start" : "",
              isEnd ? "cdr-day--end" : "",
            ].filter(Boolean).join(" ");
            return (
              <button
                type="button"
                key={day.format("YYYY-MM-DD")}
                className={cls}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => { if (selecting) setHovered(day); }}
              >
                <span className="cdr-day-num">{day.date()}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="date-range-selector" ref={pickerRef}>
      <button
        type="button"
        className="date-range-trigger"
        onClick={() => setShow((s) => !s)}
      >
        <CalendarOutlined className="date-range-icon" />
        <span className="date-range-text">{displayText}</span>
        <DownOutlined className="date-range-arrow" />
      </button>

      {show && createPortal(
        <>
          <div className="date-range-overlay" onClick={() => setShow(false)} />
          <div
            ref={popupRef}
            className={`date-range-picker-container${isMobile ? " is-mobile" : ""}`}
            style={isMobile ? undefined : { top: coords.top, left: coords.left }}
          >
            <div className="cdr">
              {!isMobile && (
                <div className="cdr-presets">
                  {PRESETS.map((p) => {
                    const [ps, pe] = p.getRange();
                    const selected = !selecting && ps.isSame(start, "day") && pe.isSame(end, "day");
                    return (
                      <button
                        type="button"
                        key={p.label}
                        className={`cdr-preset${selected ? " cdr-preset--selected" : ""}`}
                        onClick={() => handlePreset(p)}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="cdr-main">
                {!isMobile && (
                  <div className="cdr-display">
                    <div className={`cdr-display-item${!selecting ? " cdr-display-item--active" : ""}`}>
                      {start.format("MMM D, YYYY")}
                    </div>
                    <span className="cdr-display-sep">→</span>
                    <div className={`cdr-display-item${selecting ? " cdr-display-item--active" : ""}`}>
                      {end.format("MMM D, YYYY")}
                    </div>
                  </div>
                )}

                <div className="cdr-nav">
                  <button
                    type="button"
                    className="cdr-nav-btn"
                    onClick={() => setViewDate((v) => v.subtract(1, "month"))}
                    aria-label="Previous month"
                  >
                    <LeftOutlined />
                  </button>
                  <div className="cdr-nav-selects">
                    <select
                      value={viewDate.month()}
                      onChange={(e) => setViewDate((v) => v.month(Number(e.target.value)))}
                    >
                      {MONTH_NAMES.map((m, i) => (
                        <option key={m} value={i}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={viewDate.year()}
                      onChange={(e) => setViewDate((v) => v.year(Number(e.target.value)))}
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="cdr-nav-btn"
                    onClick={() => setViewDate((v) => v.add(1, "month"))}
                    aria-label="Next month"
                  >
                    <RightOutlined />
                  </button>
                </div>

                <div className="cdr-months">
                  {Array.from({ length: monthsToShow }).map((_, i) =>
                    renderMonth(viewDate.add(i, "month"))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default DateRangeSelector;
