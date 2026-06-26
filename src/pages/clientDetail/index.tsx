import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Dropdown, Modal, Input, message } from 'antd';
import {
  SaveOutlined, UserOutlined, CalendarOutlined, MoreOutlined, DownOutlined,
  SendOutlined, MobileOutlined, PhoneOutlined, WhatsAppOutlined,
  PlusCircleOutlined, PlusOutlined, MessageOutlined, ClockCircleOutlined, SearchOutlined,
} from '@ant-design/icons';
import AddActivityModal from '../../components/addActivityModal';
import AddClientModal from '../../components/addClientModal';
import { FaTelegram } from 'react-icons/fa';
import FollowUpCalendar from '../../components/followUpCalendar';
import {
  useGetLeadByIdQuery, useAssignLeadMutation, useUpdateLeadNotesMutation,
  useDeleteLeadMutation, useGetLeadActivitiesQuery, useUpdateLeadStatusMutation,
} from '../../services/leads';
import { useGetUsersByRoleQuery } from '../../services/user';
import { ConvertLeadRoute } from '../../routes/routepath';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface Group {
  label: string;
  color: string;
}

interface Assignee {
  _id:           string;
  name:          string;
  profileImage?: string;
  email?:        string;
  phoneNumber?:  string;
}

interface EditModal {
  visible: boolean;
  field:   string;
  value:   string;
}

interface TimeState {
  hour:   number;
  minute: string;
  ampm:   string;
}

/* ─── Module-level constants ─────────────────────────────────────────── */

const SOURCE_LABELS: Record<string, string> = {
  walking:      'Walk In',
  incoming:     'Incoming',
  social_media: 'Social Media',
  facebook:     'Facebook',
  reference:    'Reference',
  other:        'Other',
};

const LEAD_STAGES = [
  { value: 'interested',     label: 'Interested',     color: '#aaa',    icon: '⬜' },
  { value: 'meeting_booked', label: 'Meeting Booked', color: '#f5a623', icon: '🟧' },
  { value: 'proposal',       label: 'Proposal',       color: '#9b59b6', icon: '🟪' },
  { value: 'negotiating',    label: 'Negotiating',    color: '#3498db', icon: '🟦' },
  { value: 'closed_won',     label: 'Closed - Won',   color: '#2ecc71', icon: '✅' },
  { value: 'closed_lost',    label: 'Closed - Lost',  color: '#e74c3c', icon: '❌' },
  { value: 'uncontactable',  label: 'Uncontactable',  color: '#666',    icon: '✖'  },
];

const ALL_GROUPS: Group[] = [
  { label: 'Block',               color: '#e74c3c' },
  { label: 'Booked Appointment',  color: '#2c3e6b' },
  { label: 'call by self later',  color: '#f5a623' },
  { label: 'Client Referral',     color: '#e91e8c' },
  { label: 'Converted GC',        color: '#27ae60' },
  { label: 'Converted Huda',      color: '#2e7d32' },
  { label: 'DLF Pase 2',          color: '#1a4b8c' },
  { label: 'Existing Client',     color: '#8b2500' },
  { label: 'Ex-member',           color: '#2c3e6b' },
  { label: 'Expected',            color: '#2e7d32' },
];

/* ─── Helpers ────────────────────────────────────────────────────────── */

function formatActivityDate(dateStr: string): string {
  if (!dateStr) return '';
  const d      = new Date(dateStr);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatActivityTime(dateStr: string): string {
  if (!dateStr) return '';
  const d    = new Date(dateStr);
  let h      = d.getHours();
  const m    = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h          = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function formatDate(date: Date): string {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatTime(time: TimeState): string {
  return `${time.hour}:${time.minute} ${time.ampm}`;
}

function stageLabel(value: string): string {
  const known = LEAD_STAGES.find(s => s.value === value);
  if (known) return known.label;
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/* ─── Component ──────────────────────────────────────────────────────── */

const ClientDetail = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [followUpVisible,     setFollowUpVisible]     = useState(false);
  const [leadStage,           setLeadStage]           = useState<string | null>(null);
  const [leadStageOpen,       setLeadStageOpen]       = useState(false);
  const [leadStageMenuOpen,   setLeadStageMenuOpen]   = useState(false);
  const [leadSourceMenuOpen,  setLeadSourceMenuOpen]  = useState(false);
  const [groupsMenuOpen,      setGroupsMenuOpen]      = useState(false);
  const [groupsDropdownOpen,  setGroupsDropdownOpen]  = useState(false);
  const [selectedGroups,      setSelectedGroups]      = useState<Group[]>([]);
  const [groupSearch,         setGroupSearch]         = useState('');
  const [oppSizeMenuOpen,     setOppSizeMenuOpen]     = useState(false);
  const [editModal,           setEditModal]           = useState<EditModal>({ visible: false, field: '', value: '' });
  const [editContactModal,    setEditContactModal]    = useState(false);
  const [editNotesModal,      setEditNotesModal]      = useState(false);
  const [notesValue,          setNotesValue]          = useState('');
  const [addActivityModal,    setAddActivityModal]    = useState(false);
  const [assignModal,         setAssignModal]         = useState(false);
  const [assignSearch,        setAssignSearch]        = useState('');
  const [selectedAssignee,    setSelectedAssignee]    = useState<Assignee | null>(null);
  const [deleteConfirmOpen,   setDeleteConfirmOpen]   = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [selectedDate, setSelectedDate] = useState<Date>(tomorrow);
  const [selectedTime, setSelectedTime] = useState<TimeState>({ hour: 8, minute: '00', ampm: 'AM' });

  const { data: usersData } = useGetUsersByRoleQuery({ role: 'sales_representative' } as any);

  const filteredGroups = ALL_GROUPS.filter(g =>
    g.label.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const toggleGroup = (group: Group) => {
    setSelectedGroups(prev =>
      prev.find(g => g.label === group.label)
        ? prev.filter(g => g.label !== group.label)
        : [...prev, group]
    );
  };

  const { data: leadData, isLoading, refetch: refetchLead } = useGetLeadByIdQuery(id as any);
  const [assignLead,       { isLoading: isAssigning }]   = useAssignLeadMutation();
  const [updateLeadNotes,  { isLoading: isSavingNotes }] = useUpdateLeadNotesMutation();
  const [deleteLead,       { isLoading: isDeleting }]    = useDeleteLeadMutation();
  const [updateLeadStatus, { isLoading: isUpdatingStage }] = useUpdateLeadStatusMutation();

  const lead: any = (leadData as any)?.data || (leadData as any)?.lead || leadData || {};

  useEffect(() => {
    const raw = lead?.leadStage ?? lead?.status;
    if (!raw) return;
    const match = LEAD_STAGES.find(
      s => s.value === raw || s.label.toLowerCase() === String(raw).toLowerCase()
    );
    setLeadStage(match ? match.value : raw);
  }, [lead?.leadStage, lead?.status]);

  const handleStageChange = async (status: string) => {
    if (status === leadStage || isUpdatingStage) return;
    // Closed - Won: do NOT call the status API here. Open the convert-to-user page instead.
    if (status === 'closed_won') {
      setLeadStageOpen(false);
      navigate(`${ConvertLeadRoute}/${id}`);
      return;
    }
    const prev = leadStage;
    setLeadStage(status);
    setLeadStageOpen(false);
    try {
      await (updateLeadStatus as any)({ id, status }).unwrap();
      refetchLead();
    } catch (e: any) {
      setLeadStage(prev);
      // message.error(e?.data?.message || 'Failed to update lead stage');
      console.error('Update lead stage failed', e);
    }
  };

  const handleClearStage = async () => {
    if (isUpdatingStage) return;
    const prev = leadStage;
    setLeadStage(null);
    setLeadStageMenuOpen(false);
    try {
      await (updateLeadStatus as any)({ id, status: '' }).unwrap();
      refetchLead();
    } catch (e: any) {
      setLeadStage(prev);
      console.error('Clear lead stage failed', e);
    }
  };

  const { data: activitiesData } = useGetLeadActivitiesQuery(id as any);
  const timeline: any[] =
    (activitiesData as any)?.activities ||
    (activitiesData as any)?.data       ||
    (Array.isArray(activitiesData) ? activitiesData : []);

  /* ── Dropdowns ── */

  const leadStageDropdown = (
    <div className="lead-stage-dropdown">
      {LEAD_STAGES.map(s => (
        <div
          key={s.value}
          className={`lsd-item${leadStage === s.value ? ' lsd-item--active' : ''}`}
          onClick={() => handleStageChange(s.value)}
        >
          <span className={`lsd-radio${leadStage === s.value ? ' lsd-radio--checked' : ''}`} />
          <span className="lsd-icon">{s.icon}</span>
          <span className="lsd-label">{s.label}</span>
        </div>
      ))}
    </div>
  );

  const groupsDropdownPanel = (
    <div className="groups-dropdown">
      <div className="groups-search-row">
        <input
          className="groups-search-input"
          placeholder="Search Groups"
          value={groupSearch}
          onChange={e => setGroupSearch(e.target.value)}
          autoFocus
        />
        <SearchOutlined className="groups-search-icon" />
      </div>
      <div className="groups-list">
        {filteredGroups.map(g => (
          <div key={g.label} className="groups-item" onClick={() => toggleGroup(g)}>
            <span className="groups-item-color" style={{ background: g.color }} />
            <span className="groups-item-label">{g.label}</span>
            <span className={`groups-item-check${selectedGroups.find(s => s.label === g.label) ? ' groups-item-check--on' : ''}`} />
          </div>
        ))}
      </div>
    </div>
  );

  const followUpDropdown = (
    <FollowUpCalendar
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      onDateChange={setSelectedDate}
      onTimeChange={setSelectedTime}
      onApply={() => setFollowUpVisible(false)}
      onClose={() => setFollowUpVisible(false)}
    />
  );

  const optionsMenu = {
    items: [
      { key: 'edit-contact', label: 'Edit Contact Details' },
      { key: 'edit-notes',   label: 'Edit Client Notes'    },
      { key: 'delete',       label: <span style={{ color: '#ef4444' }}>Delete Client</span> },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'edit-contact') setEditContactModal(true);
      if (key === 'edit-notes')   { setNotesValue(String(lead.description || lead.notes || '')); setEditNotesModal(true); }
      if (key === 'delete')       setDeleteConfirmOpen(true);
    },
  };

  const teamMembers: any[] =
    (usersData as any)?.users ??
    (usersData as any)?.data  ??
    (Array.isArray(usersData) ? usersData : []);

  return (
    <div className="client-detail-page">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigate(-1)}>Clients</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{lead.name || '—'}</span>
        </div>
        <div className="header-right">
          {lead.status === 'closed_won' && !lead.convertedUserId && (
            <Button
              type="primary"
              icon={<UserOutlined />}
              className="quick-response-btn"
              onClick={() => navigate(`${ConvertLeadRoute}/${id}`)}
            >
              Convert to User
            </Button>
          )}
          <Button type="primary" icon={<SendOutlined />} className="quick-response-btn">Send Quick Response</Button>
          <Button icon={<MobileOutlined />} className="view-app-btn">View on App</Button>
        </div>
      </div>

      {/* Detail Header */}
      <div className="detail-header">
        <div className="header-left">
          <h1 className="client-name">{isLoading ? '...' : (lead.name || '—')}</h1>
          <div className="client-info-row">
            <div className="info-item assigned-to" onClick={() => setAssignModal(true)}>
              <span className="assigned-arrow">↗</span>
              <span className="info-label">ASSIGNED TO {(selectedAssignee?.name || lead.assignedTo?.name || '—').toUpperCase()}</span>
              <span className="info-arrow">›</span>
            </div>
            <Dropdown popupRender={() => followUpDropdown} trigger={['click']} open={followUpVisible} onOpenChange={setFollowUpVisible}>
              <Button className="info-item follow-up">
                <CalendarOutlined className="info-icon" />
                <span className="info-label">Follow Up Tomorrow</span>
                <span className="info-date">{formatDate(selectedDate)} - {formatTime(selectedTime)}</span>
                <DownOutlined className="dropdown-icon" />
              </Button>
            </Dropdown>
          </div>
        </div>
        <Dropdown menu={optionsMenu} trigger={['click']} placement="bottomRight">
          <Button className="options-btn">Options <MoreOutlined /></Button>
        </Dropdown>
      </div>

      {/* Main Content */}
      <div className="cd-body">

        {/* LEFT */}
        <div className="cd-left">
          <h3 className="cd-col-title">Client Info</h3>

          <div className="ci-card">
            <div className="ci-two-col">

              {/* Left contact fields */}
              <div className="ci-col-left">
                <div className="ci-field">
                  <span className="ci-label">DISPLAY NAME</span>
                  <span className="ci-value">{lead.name || '—'}</span>
                </div>

                <div className="ci-field">
                  <span className="ci-label">MOBILE NUMBER</span>
                  <div className="ci-value-row">
                    <span className="ci-value">{lead.number || '—'}</span>
                    {lead.number && (
                      <a href={`tel:${lead.number}`} className="ci-icon-btn ci-icon-btn--phone"><PhoneOutlined /></a>
                    )}
                  </div>
                </div>

                <div className="ci-field">
                  <span className="ci-label">WHATSAPP NUMBER</span>
                  <div className="ci-value-row">
                    <span className="ci-value">{lead.number || '—'}</span>
                    {lead.number && (
                      <a href={`https://wa.me/${lead.number}`} target="_blank" rel="noreferrer" className="ci-icon-btn ci-icon-btn--wa">
                        <WhatsAppOutlined />
                      </a>
                    )}
                  </div>
                </div>

                <div className="ci-field">
                  <span className="ci-label">EMAIL ADDRESS</span>
                  <span className="ci-value">{lead.email || '—'}</span>
                </div>

                <div className={`ci-field ci-field--editable ci-field--with-col${leadStageOpen ? ' ci-field--active' : ''}`}>
                  <Dropdown popupRender={() => leadStageDropdown} trigger={['click']} placement="bottomLeft" open={leadStageOpen} onOpenChange={setLeadStageOpen}>
                    <div className="ci-field-body" style={{ cursor: 'pointer' }}>
                      <span className="ci-label">LEAD STAGE</span>
                      <div className="ci-value-row">
                        {leadStage
                          ? <span className="ci-value">{stageLabel(leadStage)}</span>
                          : <span className="ci-placeholder">Click to select a value... <DownOutlined style={{ fontSize: 10 }} /></span>
                        }
                      </div>
                    </div>
                  </Dropdown>
                  <Dropdown
                    menu={{
                      items: [
                        { key: 'edit',  label: 'Edit field' },
                        // "Closed - Won" par lead user me convert ho chuki hoti hai — clear allow nahi
                        ...(leadStage === 'closed_won'
                          ? []
                          : [{ key: 'clear', label: <span style={{ color: '#e74c3c' }}>Clear field</span> }]),
                      ],
                      onClick: ({ key }: { key: string }) => { if (key === 'clear') handleClearStage(); },
                    }}
                    trigger={['click']} placement="bottomRight"
                    open={leadStageMenuOpen} onOpenChange={setLeadStageMenuOpen}
                  >
                    <div className={`ci-more-col${leadStageMenuOpen ? ' ci-more-col--active' : ''}`}><MoreOutlined /></div>
                  </Dropdown>
                </div>

                <div className="ci-field ci-field--editable ci-field--with-col">
                  <div className="ci-field-body">
                    <span className="ci-label">LEAD SOURCE</span>
                    <div className="ci-value-row">
                      <span className="ci-value">{SOURCE_LABELS[lead.source] || lead.source || '—'}</span>
                    </div>
                  </div>
                  <Dropdown
                    menu={{
                      items: [
                        { key: 'edit',  label: 'Edit field' },
                        { key: 'clear', label: <span style={{ color: '#e74c3c' }}>Clear field</span> },
                      ],
                    }}
                    trigger={['click']} placement="bottomRight"
                    open={leadSourceMenuOpen} onOpenChange={setLeadSourceMenuOpen}
                  >
                    <div className={`ci-more-col${leadSourceMenuOpen ? ' ci-more-col--active' : ''}`}><MoreOutlined /></div>
                  </Dropdown>
                </div>

                <div className="ci-field ci-field--editable ci-field--with-col">
                  <div className="ci-field-body" style={{ cursor: 'pointer' }} onClick={() => setEditModal({ visible: true, field: 'Opportunity Size', value: '' })}>
                    <span className="ci-label">OPPORTUNITY SIZE</span>
                    <div className="ci-value-row">
                      <span className="ci-placeholder">Click to enter a value...</span>
                    </div>
                  </div>
                  <Dropdown
                    menu={{
                      items: [
                        { key: 'edit',  label: 'Edit field' },
                        { key: 'clear', label: <span style={{ color: '#e74c3c' }}>Clear field</span> },
                      ],
                      onClick: ({ key }: { key: string }) => {
                        if (key === 'edit') setEditModal({ visible: true, field: 'Opportunity Size', value: '' });
                      },
                    }}
                    trigger={['click']} placement="bottomRight"
                    open={oppSizeMenuOpen} onOpenChange={setOppSizeMenuOpen}
                  >
                    <div className={`ci-more-col${oppSizeMenuOpen ? ' ci-more-col--active' : ''}`}><MoreOutlined /></div>
                  </Dropdown>
                </div>
              </div>

              <div className="ci-divider" />

              {/* Right: Groups + Notes */}
              <div className="ci-col-right">
                <div className={`ci-field ci-field--editable ci-field--with-col${groupsDropdownOpen ? ' ci-field--active' : ''}`}>
                  <Dropdown popupRender={() => groupsDropdownPanel} trigger={['click']} open={groupsDropdownOpen} onOpenChange={setGroupsDropdownOpen} placement="bottomLeft">
                    <div className="ci-field-body" style={{ cursor: 'pointer' }}>
                      <span className="ci-label">GROUPS</span>
                      <div className="ci-value-row ci-value-row--top">
                        <div className="ci-tags">
                          {selectedGroups.length > 0
                            ? selectedGroups.map((g, i) => (
                                <span key={i} className="group-tag" style={{ background: g.color }}>{g.label}</span>
                              ))
                            : <span className="ci-placeholder">Click to select groups... <DownOutlined /></span>}
                        </div>
                      </div>
                    </div>
                  </Dropdown>
                  <Dropdown
                    menu={{
                      items: [
                        { key: 'manage',     label: 'Manage groups' },
                        { key: 'remove-all', label: <span style={{ color: '#e74c3c' }}>Remove from all groups</span> },
                      ],
                      onClick: ({ key }: { key: string }) => {
                        if (key === 'remove-all') setSelectedGroups([]);
                      },
                    }}
                    trigger={['click']} placement="bottomRight"
                    open={groupsMenuOpen} onOpenChange={setGroupsMenuOpen}
                  >
                    <div className={`ci-more-col${groupsMenuOpen ? ' ci-more-col--active' : ''}`}><MoreOutlined /></div>
                  </Dropdown>
                </div>

                <div
                  className="ci-field ci-field--editable"
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setNotesValue(String(lead.description || lead.notes || '')); setEditNotesModal(true); }}
                >
                  <span className="ci-label">NOTES</span>
                  <span className="ci-value ci-notes">{lead.description || '—'}</span>
                </div>
              </div>

            </div>
          </div>

          <p className="ci-footer">
            You can set up <a href="#settings">custom client fields</a> and <a href="#settings">client groups</a> in your settings.
          </p>
        </div>

        {/* RIGHT */}
        <div className="cd-right">
          <div className="cd-section-title-row">
            <h3 className="cd-col-title">Sequences</h3>
            <Button type="link" icon={<PlusCircleOutlined />} className="cd-add-btn">Add to Sequence</Button>
          </div>
          <div className="cd-card">
            <div className="cd-empty-state">
              <ClockCircleOutlined className="cd-empty-icon" />
              <p className="cd-empty-title">Not currently part of any sequences</p>
              <p className="cd-empty-sub">Tap the <strong>+ Add to Sequence</strong> button above to add</p>
            </div>
          </div>

          <h3 className="cd-col-title" style={{ marginTop: 28 }}>Timeline</h3>
          <div className="cd-card">
            <div className="cd-timeline">
              <div className="cd-tl-row cd-tl-row--add" onClick={() => setAddActivityModal(true)} style={{ cursor: 'pointer' }}>
                <div className="cd-tl-left">
                  <div className="cd-tl-circle cd-tl-circle--add"><PlusOutlined /></div>
                  {timeline.length > 0 && <div className="cd-tl-connector" />}
                </div>
                <div className="cd-tl-add-label">Add Activity</div>
              </div>

              {timeline.map((item: any, i: number) => (
                <div key={item._id || i} className="cd-tl-row">
                  <div className="cd-tl-left">
                    <div className="cd-tl-circle" style={{ background: '#1890ff' }}><FaTelegram /></div>
                    {i < timeline.length - 1 && <div className="cd-tl-connector" />}
                  </div>
                  <div className="cd-tl-right">
                    <div className="cd-tl-meta">
                      <strong className="cd-tl-date">{formatActivityDate(item.activityDate)}</strong>
                      <span className="cd-tl-time">{formatActivityTime(item.activityDate)}</span>
                      <Dropdown
                        menu={{
                          items: [
                            { key: 'detail', label: 'Go to message detail' },
                            { key: 'delete', label: <span style={{ color: '#ff4d4f' }}>Delete activity</span>, danger: false },
                          ],
                        }}
                        trigger={['click']} placement="bottomLeft"
                      >
                        <MoreOutlined className="cd-tl-more" />
                      </Dropdown>
                    </div>
                    <div className="cd-tl-title-row">
                      <MessageOutlined className="cd-tl-type-icon" />
                      <p className="cd-tl-title">
                        {item.type ? item.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : '—'}
                      </p>
                    </div>
                    {item.details && <p className="cd-tl-desc">{item.details}</p>}
                    {item.createdBy?.name && (
                      <p className="cd-tl-by"><UserOutlined /> by {item.createdBy.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Opportunity Size Modal */}
      <Modal
        open={editModal.visible}
        onCancel={() => setEditModal({ ...editModal, visible: false })}
        footer={null}
        closable
        width={580}
        styles={{
          wrapper: { background: 'var(--card-bg)', borderRadius: 12, padding: '32px 28px 28px' },
          body:    { padding: 0 },
          mask:    { backdropFilter: 'blur(2px)' },
        }}
      >
        <h2 style={{ fontSize: 32, fontWeight: 800, margin: 0, marginBottom: 20, color: 'var(--sider-text)', lineHeight: 1.2 }}>{editModal.field}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--muted)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, background: 'var(--card-bg)' }}>
          <span style={{ fontSize: 16, color: 'var(--placeholder)', flexShrink: 0 }}>$</span>
          <Input
            value={editModal.value}
            onChange={e => setEditModal({ ...editModal, value: e.target.value })}
            style={{ flex: 1, height: 44, fontSize: 15, background: 'var(--bg)', color: 'var(--sider-text)', borderColor: 'var(--muted)', borderRadius: 6 }}
            autoFocus
          />
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          block
          style={{ height: 54, fontSize: 16, fontWeight: 700, background: '#17A2B8', border: 'none', borderRadius: 8, letterSpacing: 1.5 }}
          onClick={() => setEditModal({ ...editModal, visible: false })}
        >
          SAVE
        </Button>
      </Modal>

      <AddActivityModal
        open={addActivityModal}
        onClose={() => setAddActivityModal(false)}
        leadId={id}
        onSuccess={() => refetchLead()}
      />
      <AddClientModal
        open={editContactModal}
        onClose={() => setEditContactModal(false)}
        title="Edit Contact Details"
        initialData={lead}
      />

      {/* Assign Client Modal */}
      <Modal
        open={assignModal}
        onCancel={() => { setAssignModal(false); setAssignSearch(''); }}
        footer={null}
        closable
        width={620}
        className="assign-client-modal"
        styles={{
          wrapper: { background: 'var(--card-bg)', borderRadius: 12, padding: '32px 28px 28px' },
          body:    { padding: 0 },
          mask:    { backdropFilter: 'blur(2px)' },
        }}
      >
        <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 4px', color: 'var(--sider-text)' }}>Assign Client</h2>
        <p style={{ fontSize: 14, color: 'var(--placeholder)', marginBottom: 20 }}>Select a team member to assign this client to</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg)', marginBottom: 16, marginInline: '10px' }}>
          <SearchOutlined style={{ color: 'var(--placeholder)', fontSize: 16 }} />
          <input
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: 'var(--sider-text)' }}
            placeholder="Search team members"
            value={assignSearch}
            onChange={e => setAssignSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 440, overflowY: 'auto', paddingInline: '10px' }}>
          {!assignSearch && (
            <div
              onClick={() => setSelectedAssignee({ _id: 'myself', name: 'Fitclub (Myself)' })}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px', borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border-color)', outline: selectedAssignee?._id === 'myself' ? '2px solid #1890ff' : 'none', background: selectedAssignee?._id === 'myself' ? 'rgba(24,144,255,0.06)' : 'var(--bg)', transition: 'background 0.15s' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                <span style={{ color: '#17A2B8', fontSize: 11, fontWeight: 800 }}>FC</span>
              </div>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 15, color: 'var(--sider-text)' }}>Fitclub (Myself)</span>
              {selectedAssignee?._id === 'myself' && <span style={{ color: '#1890ff', fontSize: 18 }}>✓</span>}
            </div>
          )}

          {!assignSearch && (
            <div
              onClick={() => setSelectedAssignee({ _id: 'unassigned', name: 'Unassigned' })}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px', borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border-color)', outline: selectedAssignee?._id === 'unassigned' ? '2px solid #1890ff' : 'none', background: selectedAssignee?._id === 'unassigned' ? 'rgba(24,144,255,0.06)' : 'var(--bg)', transition: 'background 0.15s' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#17A2B8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UserOutlined style={{ fontSize: 18, color: '#fff' }} />
              </div>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 15, color: 'var(--sider-text)' }}>Unassigned</span>
              {selectedAssignee?._id === 'unassigned' && <span style={{ color: '#1890ff', fontSize: 18 }}>✓</span>}
            </div>
          )}

          {teamMembers
            .filter((u: any) =>
              u.name?.toLowerCase().includes(assignSearch.toLowerCase()) ||
              u.email?.toLowerCase().includes(assignSearch.toLowerCase()) ||
              u.phoneNumber?.includes(assignSearch)
            )
            .map((user: any) => {
              const isSelected = selectedAssignee?._id === user._id || (!selectedAssignee && lead.assignedTo?._id === user._id);
              return (
                <div
                  key={user._id}
                  onClick={() => setSelectedAssignee(user)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px', borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border-color)', outline: isSelected ? '2px solid #1890ff' : 'none', background: isSelected ? 'rgba(24,144,255,0.06)' : 'var(--bg)', transition: 'background 0.15s' }}
                >
                  {user.profileImage
                    ? <img src={user.profileImage} alt={user.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <UserOutlined style={{ fontSize: 18, color: 'var(--placeholder)' }} />
                      </div>
                  }
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 15, color: 'var(--sider-text)' }}>{user.name}</span>
                  <span style={{ fontSize: 13, color: 'var(--placeholder)' }}>{user.email || user.phoneNumber || ''}</span>
                  {isSelected && <span style={{ color: '#1890ff', fontSize: 18, marginLeft: 8 }}>✓</span>}
                </div>
              );
            })}
        </div>

        {selectedAssignee && selectedAssignee._id !== (lead.assignedTo?._id ?? lead.assignedTo) && (
          <button
            disabled={isAssigning}
            onClick={async () => {
              try {
                await (assignLead as any)({ id, salesPersonId: selectedAssignee._id }).unwrap();
                setAssignModal(false);
                setAssignSearch('');
                refetchLead();
              } catch (e) {
                console.error('Assign failed', e);
              }
            }}
            style={{ marginTop: 20, width: '100%', height: 52, background: '#17A2B8', border: 'none', borderRadius: 8, color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: 1, cursor: isAssigning ? 'not-allowed' : 'pointer', opacity: isAssigning ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.15s' }}
          >
            ✓ {isAssigning ? 'ASSIGNING...' : 'CONFIRM'}
          </button>
        )}
      </Modal>

      {/* Edit Client Notes Modal */}
      <Modal
        open={editNotesModal}
        onCancel={() => setEditNotesModal(false)}
        footer={null}
        closable
        width={560}
        styles={{
          wrapper: { background: 'var(--card-bg)', borderRadius: 12, padding: '32px 28px 28px' },
          body:    { padding: 0 },
          mask:    { backdropFilter: 'blur(2px)' },
        }}
      >
        <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 20px', color: 'var(--sider-text)' }}>Client Notes</h2>
        <Input.TextArea
          value={notesValue}
          onChange={e => setNotesValue(e.target.value)}
          placeholder="Add notes here..."
          style={{ height: 300, resize: 'none', background: 'var(--bg)', color: 'var(--sider-text)', borderColor: 'var(--border-color)', borderRadius: 8, fontSize: 14, marginBottom: 16 }}
        />
        <Button
          block
          icon={<SaveOutlined />}
          loading={isSavingNotes}
          onClick={async () => {
            try {
              await (updateLeadNotes as any)({ id, noteId: lead._id, notes: notesValue }).unwrap();
              refetchLead();
              setEditNotesModal(false);
            } catch (e) {
              console.error('Save notes failed', e);
            }
          }}
          style={{ height: 48, fontSize: 15, fontWeight: 700, background: '#17A2B8', borderColor: '#17A2B8', color: '#fff', borderRadius: 8, letterSpacing: '0.5px' }}
        >
          SAVE
        </Button>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirmOpen}
        onCancel={() => setDeleteConfirmOpen(false)}
        footer={null}
        closable
        width={420}
        styles={{
          wrapper: { background: 'var(--card-bg)', borderRadius: 12, padding: '32px 28px 28px' },
          body:    { padding: 0 },
          mask:    { backdropFilter: 'blur(2px)' },
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: 'var(--sider-text)' }}>Delete Client</h2>
        <p style={{ fontSize: 14, color: 'var(--placeholder)', marginBottom: 24 }}>
          Are you sure you want to delete <strong style={{ color: 'var(--sider-text)' }}>{lead.name}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button block onClick={() => setDeleteConfirmOpen(false)} style={{ height: 44, borderRadius: 8, borderColor: 'var(--muted)', color: 'var(--sider-text)', background: 'transparent' }}>
            Cancel
          </Button>
          <Button
            block danger loading={isDeleting}
            onClick={async () => {
              try {
                await (deleteLead as any)(id).unwrap();
                setDeleteConfirmOpen(false);
                navigate(-1);
              } catch (e) {
                console.error('Delete failed', e);
              }
            }}
            style={{ height: 44, borderRadius: 8, fontWeight: 700 }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ClientDetail;
