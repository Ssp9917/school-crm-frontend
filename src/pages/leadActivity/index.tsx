import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientDetailRoute } from '../../routes/routepath';
import { Dropdown, Select } from 'antd';
import {
  PhoneOutlined, MessageOutlined, CalendarOutlined, FileTextOutlined,
  PaperClipOutlined, WhatsAppOutlined, SendOutlined,
  MoreOutlined, CaretUpOutlined, ClockCircleOutlined,
  TeamOutlined, CheckOutlined, LeftOutlined, RightOutlined, DownOutlined,
  UserOutlined, FileOutlined, SwapOutlined,
  CheckCircleOutlined, CloseCircleOutlined, StopOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import './styles.scss';
import AddActivityModal from '../../components/addActivityModal';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface TypeConfigEntry {
  color: string;
  bg:    string;
  icon:  React.ReactNode;
  label: string;
}

interface ActivityItem {
  id:       number;
  clientId: number;
  dateKey:  string;
  time:     string;
  type:     string;
  name:     string;
  note:     string;
  by:       string;
}

interface ActivityGroup {
  dateKey: string;
  label:   string;
  day:     string;
  isToday: boolean;
  items:   ActivityItem[];
}

interface TeamMember {
  id:       number;
  name:     string;
  initials: string;
  color:    string;
}

interface MiniCalendarProps {
  value:    Dayjs | null;
  onChange: (d: Dayjs) => void;
}

interface ActivityCardProps {
  item: ActivityItem;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const TYPE_CONFIG: Record<string, TypeConfigEntry> = {
  phone:        { color: '#8B5CF6', bg: 'rgba(139,92,246,0.18)',  icon: <PhoneOutlined />,     label: 'Phone Call'         },
  message:      { color: '#3B82F6', bg: 'rgba(59,130,246,0.18)',  icon: <MessageOutlined />,   label: 'Message'            },
  meeting:      { color: '#10B981', bg: 'rgba(16,185,129,0.18)',  icon: <CalendarOutlined />,  label: 'Meeting'            },
  note:         { color: '#F59E0B', bg: 'rgba(245,158,11,0.18)',  icon: <FileTextOutlined />,  label: 'Note'               },
  content_msg:  { color: '#17A2B8', bg: 'rgba(23,162,184,0.18)', icon: <SendOutlined />,       label: 'Content: Messages'  },
  content_file: { color: '#17A2B8', bg: 'rgba(23,162,184,0.18)', icon: <PaperClipOutlined />, label: 'Content: Files'     },
  content_page: { color: '#17A2B8', bg: 'rgba(23,162,184,0.18)', icon: <FileTextOutlined />,  label: 'Content: Pages'     },
  whatsapp:     { color: '#25D366', bg: 'rgba(37,211,102,0.12)',  icon: <WhatsAppOutlined />,  label: 'WhatsApp Sequence'  },
};

const FILTER_TYPES = [
  { key: 'phone',        icon: <PhoneOutlined />,     label: 'Phone Calls',   color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  { key: 'message',      icon: <MessageOutlined />,   label: 'Messages',      color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  { key: 'meeting',      icon: <CalendarOutlined />,  label: 'Meetings',      color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  { key: 'note',         icon: <FileTextOutlined />,  label: 'Notes',         color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  { key: 'content_msg',  icon: <SendOutlined />,      label: 'Content Msg',   color: '#17A2B8', bg: 'rgba(23,162,184,0.12)' },
  { key: 'content_file', icon: <PaperClipOutlined />, label: 'Content Files', color: '#17A2B8', bg: 'rgba(23,162,184,0.12)' },
  { key: 'content_page', icon: <FileTextOutlined />,  label: 'Content Pages', color: '#17A2B8', bg: 'rgba(23,162,184,0.12)' },
  { key: 'whatsapp',     icon: <WhatsAppOutlined />,  label: 'WhatsApp',      color: '#25D366', bg: 'rgba(37,211,102,0.12)' },
];

const LEAD_STAGES = [
  { key: 'interested',    label: 'Interested',     color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)', icon: <UserOutlined />         },
  { key: 'meeting',       label: 'Meeting Booked', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  icon: <CalendarOutlined />     },
  { key: 'proposal',      label: 'Proposal',       color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)',  icon: <FileOutlined />         },
  { key: 'negotiating',   label: 'Negotiating',    color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  icon: <SwapOutlined />         },
  { key: 'closed_won',    label: 'Closed - Won',   color: '#10B981', bg: 'rgba(16,185,129,0.12)',  icon: <CheckCircleOutlined />  },
  { key: 'closed_lost',   label: 'Closed - Lost',  color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   icon: <CloseCircleOutlined />  },
  { key: 'uncontactable', label: 'Uncontactable',  color: '#6B7280', bg: 'rgba(107,114,128,0.12)', icon: <StopOutlined />         },
];

const TEAM_MEMBERS: TeamMember[] = [
  { id: 1, name: 'Fitclub',           initials: 'F', color: '#1e3a5f' },
  { id: 2, name: 'Amit Singh Dahiya', initials: 'A', color: '#8B5CF6' },
  { id: 3, name: 'Ravi Kumar',        initials: 'R', color: '#10B981' },
  { id: 4, name: 'Dhun',              initials: 'D', color: '#F59E0B' },
];

const ACTIVITY_GROUPS: ActivityGroup[] = [
  {
    dateKey: '2026-05-28', label: 'MAY 28, 2026', day: 'Today', isToday: true,
    items: [
      { id: 1, clientId: 1, dateKey: '2026-05-28', time: '09:34 AM', type: 'phone', name: 'Sumaiya', note: 'She will let me know price given 10k a monthly', by: 'Ravi Kumar' },
    ],
  },
  {
    dateKey: '2026-06-01', label: 'JUN 01, 2026', day: 'Monday', isToday: false,
    items: [
      { id: 2, clientId: 2, dateKey: '2026-06-01', time: '12:00 PM', type: 'phone', name: 'Deepak Malhan', note: "He's already member for another gym for 4 month he'll joining after 4 months.", by: 'Dhun' },
    ],
  },
  {
    dateKey: '2026-08-01', label: 'AUG 01, 2026', day: 'Saturday', isToday: false,
    items: [
      { id: 3, clientId: 3, dateKey: '2026-08-01', time: '12:00 PM', type: 'phone', name: 'Shaurya Malik', note: 'Sir, some other program is going on in your membership, it will end in August, sir, I will come here again.', by: 'Dhun' },
    ],
  },
];

/* ─── Helpers ────────────────────────────────────────────────────────── */

const AVATAR_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#17A2B8'];

const avatarColor = (name: string): string => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};

/* ─── Sub-components ─────────────────────────────────────────────────── */

const MiniCalendar = ({ value, onChange }: MiniCalendarProps) => {
  const [viewMonth, setViewMonth] = useState<Dayjs>(() => (value || dayjs()).startOf('month'));
  const today     = dayjs();
  const firstDOW  = viewMonth.day();
  const daysCount = viewMonth.daysInMonth();

  const cells: (number | null)[] = [
    ...Array<null>(firstDOW).fill(null),
    ...Array.from({ length: daysCount }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="la-cal">
      <div className="la-cal-hd">
        <span className="la-cal-mlabel">{viewMonth.format('MMMM YYYY')}</span>
        <div className="la-cal-nav">
          <button className="la-cal-nav-btn" onClick={() => setViewMonth(m => m.subtract(1, 'month'))}><LeftOutlined /></button>
          <button className="la-cal-nav-btn" onClick={() => setViewMonth(m => m.add(1, 'month'))}><RightOutlined /></button>
        </div>
      </div>
      <div className="la-cal-grid">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <span key={i} className="la-cal-dow">{d}</span>
        ))}
        {cells.map((day, idx) =>
          day === null ? <span key={idx} /> : (
            <button
              key={idx}
              className={[
                'la-cal-day',
                viewMonth.date(day).isSame(today, 'day')         ? 'la-cal-day--today' : '',
                value && viewMonth.date(day).isSame(value, 'day') ? 'la-cal-day--sel'   : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onChange(viewMonth.date(day))}
            >
              {day}
            </button>
          )
        )}
      </div>
      <div className="la-cal-foot">
        <button
          className="la-cal-today-btn"
          onClick={() => { setViewMonth(today.startOf('month')); onChange(today); }}
        >
          TODAY
        </button>
      </div>
    </div>
  );
};

const ActivityCard = ({ item }: ActivityCardProps) => {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.phone;

  const handleMenu = ({ key }: { key: string }) => {
    if (key === 'view-client') navigate(`${ClientDetailRoute}/${item.clientId}`);
    if (key === 'edit') setEditOpen(true);
  };

  const menuItems = [
    { key: 'view-client', label: 'View client details' },
    { key: 'edit',        label: 'View or edit activity' },
    { key: 'delete',      label: 'Delete activity', danger: true },
  ];

  return (
    <>
      <AddActivityModal open={editOpen} onClose={() => setEditOpen(false)} item={item as any} />
      <div
        className="la-card"
        style={{ '--accent': cfg.color } as React.CSSProperties}
        onClick={() => navigate(`${ClientDetailRoute}/${item.clientId}`)}
      >
        <div className="la-card-time">
          <ClockCircleOutlined className="la-time-icon" />
          {item.time}
        </div>
        <div className="la-card-icon" style={{ background: cfg.bg, color: cfg.color }}>
          {cfg.icon}
        </div>
        <div className="la-card-body">
          <div className="la-card-header">
            <div>
              <span className="la-card-name">{item.name}</span>
              <span className="la-card-type" style={{ color: cfg.color, background: cfg.bg }}>
                {cfg.label}
              </span>
            </div>
            <div onClick={e => e.stopPropagation()}>
              <Dropdown menu={{ items: menuItems, onClick: handleMenu }} trigger={['click']} placement="bottomRight">
                <button className="la-card-more"><MoreOutlined /></button>
              </Dropdown>
            </div>
          </div>
          <p className="la-card-note">{item.note}</p>
          <div className="la-card-by">
            <span className="la-by-avatar" style={{ background: avatarColor(item.by) }}>
              {item.by[0]}
            </span>
            <span className="la-by-name">by {item.by}</span>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─── Page ───────────────────────────────────────────────────────────── */

const LeadActivity = () => {
  const [dateFilter,    setDateFilter]    = useState<Dayjs | null>(null);
  const [calOpen,       setCalOpen]       = useState(false);
  const [calPos,        setCalPos]        = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [activeTypes,   setActiveTypes]   = useState<string[]>([]);
  const [activeStages,  setActiveStages]  = useState<string[]>([]);
  const [activeMembers, setActiveMembers] = useState<number[]>([]);
  const dpBtnRef = useRef<HTMLDivElement>(null);

  const openCal = () => {
    if (dpBtnRef.current) {
      const r = dpBtnRef.current.getBoundingClientRect();
      setCalPos({ top: r.bottom + 6, left: r.left });
    }
    setCalOpen(o => !o);
  };

  const filterCount = activeTypes.length + activeStages.length + activeMembers.length + (dateFilter ? 1 : 0);

  const toggleType  = (k: string) => setActiveTypes(p  => p.includes(k) ? p.filter(x => x !== k) : [...p, k]);
  const toggleStage = (k: string) => setActiveStages(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k]);
  const clearAll    = ()          => { setActiveTypes([]); setActiveStages([]); setActiveMembers([]); setDateFilter(null); setCalOpen(false); };

  const visibleGroups = useMemo(() => {
    if (!activeTypes.length && !activeMembers.length && !dateFilter) return ACTIVITY_GROUPS;
    return ACTIVITY_GROUPS.map(g => ({
      ...g,
      items: g.items.filter(item => {
        const typeOk   = !activeTypes.length   || activeTypes.includes(item.type);
        const memberOk = !activeMembers.length || activeMembers.some(id => {
          const m = TEAM_MEMBERS.find(t => t.id === id);
          return m && item.by === m.name;
        });
        const dateOk   = !dateFilter || item.dateKey === dateFilter.format('YYYY-MM-DD');
        return typeOk && memberOk && dateOk;
      }),
    })).filter(g => g.items.length > 0);
  }, [activeTypes, activeMembers, dateFilter]);

  return (
    <div className="la-page">

      <div className="la-header">
        <div className="la-header-left">
          <h1 className="la-title">Activity Timeline</h1>
          <p className="la-subtitle">Track all client interactions and follow-ups</p>
        </div>
      </div>

      <div className="la-topbar">
        {/* Date picker */}
        <div className="la-date-picker-wrap">
          <div ref={dpBtnRef} className="la-date-picker-btn" onClick={openCal}>
            <CalendarOutlined className="la-dp-icon" />
            <span className="la-dp-text">
              {dateFilter ? dateFilter.format('MMM D, YYYY') : 'All Dates'}
            </span>
            {dateFilter ? (
              <button
                className="la-dp-clear"
                onClick={e => { e.stopPropagation(); setDateFilter(null); setCalOpen(false); }}
              >×</button>
            ) : (
              <DownOutlined className="la-dp-arrow" />
            )}
          </div>
          {calOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setCalOpen(false)} />
              <div className="la-cal-popup" style={{ top: calPos.top, left: calPos.left }}>
                <MiniCalendar
                  value={dateFilter}
                  onChange={d => { setDateFilter(d); setCalOpen(false); }}
                />
              </div>
            </>
          )}
        </div>

        {/* Team member multi-select */}
        <Select
          className="la-member-select"
          classNames={{ popup: { root: 'la-member-select-dropdown' } }}
          mode="multiple"
          showSearch
          placeholder="Search team member..."
          value={activeMembers}
          onChange={setActiveMembers}
          style={{ flex: 1, maxWidth: 340 }}
          optionRender={option => {
            const m = TEAM_MEMBERS.find(t => t.id === option.value);
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="la-member-av" style={{ background: m?.color ?? '#888', width: 24, height: 24, fontSize: 11 }}>
                  {m?.initials}
                </span>
                <span>{option.label}</span>
              </div>
            );
          }}
          options={TEAM_MEMBERS.map(m => ({ value: m.id, label: m.name }))}
        />

        {filterCount > 0 && (
          <button className="la-topbar-clear" onClick={clearAll}>
            Clear all ({filterCount})
          </button>
        )}
      </div>

      <div className="la-body">

        {/* Sidebar */}
        <aside className="la-sidebar">
          <h3 className="la-section-title">
            <span>Activity Type</span>
            {activeTypes.length > 0 && <span className="la-filter-badge">{activeTypes.length}</span>}
            {activeTypes.length > 0 && (
              <button className="la-filter-clear" onClick={() => setActiveTypes([])}>Clear</button>
            )}
          </h3>
          <div className="la-widget">
            <div className="la-filter-list">
              {FILTER_TYPES.map(ft => {
                const isOn = activeTypes.includes(ft.key);
                return (
                  <div
                    key={ft.key}
                    className={`la-filter-item${isOn ? ' la-filter-item--on' : ''}`}
                    style={{ '--item-color': ft.color, '--item-bg': ft.bg } as React.CSSProperties}
                    onClick={() => toggleType(ft.key)}
                  >
                    <span className="la-fi-icon">{ft.icon}</span>
                    <span className="la-fi-label">{ft.label}</span>
                    <span className={`la-fi-check${isOn ? ' la-fi-check--on' : ''}`}>
                      {isOn && <CheckOutlined />}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <h3 className="la-section-title">
            <span>Lead Stage</span>
            {activeStages.length > 0 && <span className="la-filter-badge">{activeStages.length}</span>}
            {activeStages.length > 0 && (
              <button className="la-filter-clear" onClick={() => setActiveStages([])}>Clear</button>
            )}
          </h3>
          <div className="la-widget">
            <div className="la-filter-list">
              {LEAD_STAGES.map(st => {
                const isOn = activeStages.includes(st.key);
                return (
                  <div
                    key={st.key}
                    className={`la-filter-item${isOn ? ' la-filter-item--on' : ''}`}
                    style={{ '--item-color': st.color, '--item-bg': st.bg } as React.CSSProperties}
                    onClick={() => toggleStage(st.key)}
                  >
                    <span className="la-fi-icon">{st.icon}</span>
                    <span className="la-fi-label">{st.label}</span>
                    <span className={`la-fi-check${isOn ? ' la-fi-check--on' : ''}`}>
                      {isOn && <CheckOutlined />}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Timeline */}
        <main className="la-timeline">
          <div className="la-timeline-header">
            <h2 className="la-tl-title">Timeline</h2>
            <button className="la-load-prev">
              <CaretUpOutlined /> LOAD PREVIOUS ACTIVITIES
            </button>
          </div>

          <div className="la-tl-body">
            {visibleGroups.length === 0 ? (
              <div className="la-empty">
                <CalendarOutlined className="la-empty-icon" />
                <p>No activities match your filters</p>
              </div>
            ) : (
              visibleGroups.map(group => (
                <div key={group.dateKey} className="la-group">
                  <div className="la-group-header">
                    <div className="la-group-date-wrap">
                      <span className="la-group-date">{group.label}</span>
                      {group.isToday && <span className="la-today-pill">Today</span>}
                      <span className="la-group-day">{group.day}</span>
                    </div>
                    <span className="la-group-count">
                      <TeamOutlined /> {group.items.length} {group.items.length === 1 ? 'activity' : 'activities'}
                    </span>
                  </div>
                  <div className="la-group-items">
                    {group.items.map((item, idx) => (
                      <div key={item.id} className="la-item-wrap">
                        {idx < group.items.length - 1 && <div className="la-connector" />}
                        <ActivityCard item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

            <div className="la-end-marker">
              <span className="la-end-line" />
              <span className="la-end-text">End of timeline activities</span>
              <span className="la-end-line" />
            </div>
          </div>
        </main>

      </div>
    </div>
  );
};

export default LeadActivity;
