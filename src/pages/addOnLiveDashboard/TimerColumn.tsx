import React, { useState, useEffect } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';

const TimerColumn = ({ activeSeconds = 0, remainingSeconds = 0, maxDurationSeconds = 3600, status = 'pending' }) => {
  const [timeElapsed, setTimeElapsed] = useState(activeSeconds);
  const [timeRemaining, setTimeRemaining] = useState(remainingSeconds);

  useEffect(() => {
    // Reset when props change
    setTimeElapsed(activeSeconds);
    setTimeRemaining(remainingSeconds);
  }, [activeSeconds, remainingSeconds]);

  useEffect(() => {
    // Only run timer if status is in_progress
    if (status !== 'in_progress' || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, timeRemaining]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't show timer for pending or completed sessions
  if (status === 'pending' || status === 'completed') {
    return <span>-</span>;
  }

  // Determine color based on status and remaining time
  let color = '#1890ff'; // blue for in_progress
  if (status === 'paused') {
    color = '#faad14'; // orange for paused
  } else if (timeRemaining < 600 && status === 'in_progress') {
    color = '#ff4d4f'; // red if less than 10 minutes remaining
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '6px',
      color: color,
      fontWeight: '600',
      fontSize: '14px'
    }}>
      <ClockCircleOutlined />
      <span>{formatTime(timeElapsed)}</span>
      {/* {timeRemaining > 0 && (
        <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#888' }}>
          / {formatTime(maxDurationSeconds)}
        </span>
      )} */}
    </div>
  );
};

export default TimerColumn;
