import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Tag, Button, message } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import CommonTable from '../../components/commonTable';
import {
  useGetAddonSessionsQuery,
  useStartAddonSessionMutation,
  usePauseAddonSessionMutation,
  useResumeAddonSessionMutation,
} from '../../services/membership';
import usePermissions from '../../hooks/usePermissions';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface SessionRecord {
  _id?: string;
  sNo?: number;
  branch?: string;
  type?: string;
  isComplimentary?: boolean;
  addonType?: string;
  trainerName?: string;
  trainerId?: string;
  branchId?: string;
  sessions?: number;
  sessionDate?: string;
  status?: string;
  activeSeconds?: number;
}

interface TimerState {
  sessionId?: string;
  remainingSeconds?: number;
  status?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

const formatTime = (seconds: number): string => {
  if (!seconds || seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/* ─── Component ──────────────────────────────────────────────────────── */

const AddOnSessionDetail = () => {
  const { membershipId } = useParams<{ membershipId: string }>();
  const { hasPermission } = usePermissions();

  const { data: sessionData, isLoading } = useGetAddonSessionsQuery(membershipId as any);
  const [startAddonSession]  = useStartAddonSessionMutation();
  const [pauseAddonSession]  = usePauseAddonSessionMutation();
  const [resumeAddonSession] = useResumeAddonSessionMutation();

  const summary     = (sessionData as any)?.summary    || {};
  const sessions    = (sessionData as any)?.data        || [];
  const activeTimer = (sessionData as any)?.activeTimer || null;

  const [timerState,       setTimerState]       = useState<TimerState>({});
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = (sessionId: string, remainingSeconds: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerState({ sessionId, remainingSeconds, status: 'in_progress' });
    intervalRef.current = setInterval(() => {
      setTimerState(prev => {
        if ((prev.remainingSeconds ?? 0) <= 1) {
          clearInterval(intervalRef.current!);
          message.warning('Session time expired!');
          return { ...prev, remainingSeconds: 0, status: 'expired' };
        }
        return { ...prev, remainingSeconds: (prev.remainingSeconds ?? 0) - 1 };
      });
    }, 1000);
  };

  const showPausedState = (sessionId: string, remainingSeconds: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerState({ sessionId, remainingSeconds, status: 'paused' });
  };

  useEffect(() => {
    if (activeTimer) {
      const { sessionId, status, remainingSeconds } = activeTimer;
      if (status === 'in_progress') startCountdown(sessionId, remainingSeconds);
      else if (status === 'paused') showPausedState(sessionId, remainingSeconds);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTimerState({});
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeTimer]);

  const handleStartSession = async (record: SessionRecord) => {
    const sessionId = record._id ?? String(record.sNo);
    if (!record.trainerId) { message.warning('No trainer assigned to this session'); return; }
    setLoadingSessionId(sessionId);
    try {
      await (startAddonSession as any)({
        membershipId,
        trainerId:         record.trainerId,
        branchId:          record.branchId,
        couponServiceType: record.addonType,
      }).unwrap();
    } catch (error) {
      console.error('Error starting session:', error);
    } finally {
      setLoadingSessionId(null);
    }
  };

  const handlePauseSession = async (record: SessionRecord) => {
    setLoadingSessionId(record._id ?? String(record.sNo));
    try {
      await (pauseAddonSession as any)(record._id).unwrap();
    } catch (error) {
      console.error('Error pausing session:', error);
    } finally {
      setLoadingSessionId(null);
    }
  };

  const handleResumeSession = async (record: SessionRecord) => {
    setLoadingSessionId(record._id ?? String(record.sNo));
    try {
      await (resumeAddonSession as any)(record._id).unwrap();
    } catch (error) {
      console.error('Error resuming session:', error);
    } finally {
      setLoadingSessionId(null);
    }
  };

  const columns = [
    {
      title:     'S.No',
      dataIndex: 'sNo',
      key:       'sNo',
      width:     80,
      align:     'center' as const,
    },
    {
      title:     'Branch',
      dataIndex: 'branch',
      key:       'branch',
      width:     200,
      render:    (text: string) => text || 'N/A',
    },
    {
      title:     'Type',
      dataIndex: 'type',
      key:       'type',
      width:     120,
      align:     'center' as const,
      render:    (type: string, record: SessionRecord) =>
        record.isComplimentary ? (
          <Tag color="green" style={{ textTransform: 'capitalize' }}>Complimentary</Tag>
        ) : (
          <Tag color="blue" style={{ textTransform: 'capitalize' }}>{type || 'N/A'}</Tag>
        ),
    },
    {
      title:     'Add-On Type',
      dataIndex: 'addonType',
      key:       'addonType',
      width:     150,
      render:    (text: string) =>
        text ? <span style={{ textTransform: 'capitalize' }}>{text.replace(/_/g, ' ')}</span> : 'N/A',
    },
    {
      title:     'Trainer Name',
      dataIndex: 'trainerName',
      key:       'trainerName',
      width:     150,
      render:    (text: string) => text || 'N/A',
    },
    {
      title:     'Sessions',
      dataIndex: 'sessions',
      key:       'sessions',
      width:     120,
      align:     'center' as const,
      render:    (text: number) => text ?? '-',
    },
    {
      title:     'Session Date',
      dataIndex: 'sessionDate',
      key:       'sessionDate',
      width:     150,
      render:    (date: string) => {
        if (!date) return '-';
        const d = new Date(date);
        return `${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
      },
    },
    {
      title:     'Status',
      dataIndex: 'status',
      key:       'status',
      width:     120,
      render:    (status: string) => {
        let color = 'default';
        if      (status === 'completed')  color = 'green';
        else if (status === 'in_progress') color = 'blue';
        else if (status === 'pending')    color = 'orange';
        else if (status === 'cancelled')  color = 'red';
        return (
          <Tag color={color} style={{ textTransform: 'capitalize' }}>
            {status === 'in_progress' ? 'In Progress' : status || 'N/A'}
          </Tag>
        );
      },
    },
    {
      title:     'Timer',
      dataIndex: '_id',
      key:       'timer',
      width:     150,
      align:     'center' as const,
      render:    (id: string, record: SessionRecord) => {
        if (timerState.sessionId === id && (timerState.remainingSeconds ?? 0) > 0) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: timerState.status === 'paused' ? '#faad14' : '#1890ff', fontWeight: 600, fontSize: 14 }}>
              <ClockCircleOutlined />
              <span>{formatTime(timerState.remainingSeconds ?? 0)}</span>
            </div>
          );
        }
        if (record.status === 'in_progress' && (record.activeSeconds ?? 0) >= 0) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#1890ff', fontWeight: 600, fontSize: 14 }}>
              <ClockCircleOutlined />
              <span>{formatTime(record.activeSeconds ?? 0)}</span>
            </div>
          );
        }
        return '-';
      },
    },
    {
      title:  'Actions',
      key:    'actions',
      width:  150,
      fixed:  'right' as const,
      render: (_: unknown, record: SessionRecord) => {
        const sessionId  = record._id ?? String(record.sNo);
        const isRowLoading = loadingSessionId === sessionId;
        return (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {hasPermission('9-ud-addon-svc-start-session') && (
              record.status === 'in_progress' ? (
                <Button icon={<PauseCircleOutlined />} size="small" className="paused-button" onClick={() => handlePauseSession(record)} loading={isRowLoading} danger>
                  Pause
                </Button>
              ) : record.status === 'paused' ? (
                <Button icon={<PlayCircleOutlined />} size="small" className="continue-button" onClick={() => handleResumeSession(record)} loading={isRowLoading}>
                  Continue
                </Button>
              ) : (
                <Button type="primary" icon={<PlayCircleOutlined />} size="small" onClick={() => handleStartSession(record)} disabled={record.status === 'completed'} loading={isRowLoading}>
                  Start
                </Button>
              )
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="add-on-session-detail-container">
      <div className="header">
        <h2>Add-On Session Details</h2>
      </div>

      {summary.totalSessions && (
        <Card className="session-summary" style={{ marginBottom: 24 }}>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Total Sessions</span>
              <span className="stat-value">{summary.totalSessions || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Used Sessions</span>
              <span className="stat-value used">{summary.usedSessions || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Remaining Sessions</span>
              <span className="stat-value remaining">{summary.remainingSessions || 0}</span>
            </div>
          </div>
        </Card>
      )}

      <CommonTable
        columns={columns}
        dataSource={sessions}
        loading={isLoading}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default AddOnSessionDetail;
