import React, { useState } from 'react';
import { Button } from 'antd';
import { LeftOutlined, RightOutlined, DownOutlined } from '@ant-design/icons';
import './styles.scss';

const FollowUpCalendar = ({ selectedDate, selectedTime, onDateChange, onTimeChange, onApply, onClose, compact = false }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [showHourDropdown, setShowHourDropdown] = useState(false);
  const [showMinuteDropdown, setShowMinuteDropdown] = useState(false);
  const [showAmPmDropdown, setShowAmPmDropdown] = useState(false);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    if (day) {
      const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      onDateChange(newDate);
    }
  };

  const handleQuickOption = (type) => {
    const today = new Date();
    let newDate;
    
    switch(type) {
      case 'today':
        newDate = today;
        break;
      case 'tomorrow':
        newDate = new Date(today);
        newDate.setDate(today.getDate() + 1);
        break;
      case 'week':
        newDate = new Date(today);
        newDate.setDate(today.getDate() + 7);
        break;
      case 'month':
        newDate = new Date(today);
        newDate.setMonth(today.getMonth() + 1);
        break;
      case 'someday':
        // Set to a far future date
        newDate = new Date(today);
        newDate.setFullYear(today.getFullYear() + 1);
        break;
      case 'remove':
        onClose();
        return;
      default:
        return;
    }
    
    onDateChange(newDate);
    setCurrentMonth(newDate);
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => {
    if (!day) return false;
    const selected = new Date(selectedDate);
    return day === selected.getDate() && 
           currentMonth.getMonth() === selected.getMonth() && 
           currentMonth.getFullYear() === selected.getFullYear();
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handleHourChange = (hour) => {
    const newTime = { ...selectedTime, hour };
    onTimeChange(newTime);
    setShowHourDropdown(false);
  };

  const handleMinuteChange = (minute) => {
    const newTime = { ...selectedTime, minute };
    onTimeChange(newTime);
    setShowMinuteDropdown(false);
  };

  const handleAmPmChange = (ampm) => {
    const newTime = { ...selectedTime, ampm };
    onTimeChange(newTime);
    setShowAmPmDropdown(false);
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={`follow-up-calendar${compact ? ' follow-up-calendar--compact' : ''}`}>
      <div className="calendar-container">
        <div className="calendar-left">
          <div className="calendar-header">
            <button className="nav-btn" onClick={handlePrevMonth}>
              <LeftOutlined />
            </button>
            <span className="month-year">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button className="nav-btn" onClick={handleNextMonth}>
              <RightOutlined />
            </button>
          </div>

          <div className="calendar-grid">
            <div className="weekdays">
              {daysOfWeek.map((day, index) => (
                <div key={index} className="weekday">{day}</div>
              ))}
            </div>
            <div className="days">
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`day ${day ? 'active' : 'empty'} ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''}`}
                  onClick={() => handleDateClick(day)}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="time-picker">
            <div className="time-select-group">
              <div className="time-dropdown">
                <button className="time-btn" onClick={() => setShowHourDropdown(!showHourDropdown)}>
                  {selectedTime.hour} <DownOutlined />
                </button>
                {showHourDropdown && (
                  <div className="dropdown-menu">
                    {hours.map(hour => (
                      <div 
                        key={hour} 
                        className="dropdown-item"
                        onClick={() => handleHourChange(hour)}
                      >
                        {hour}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <span className="time-separator">:</span>
              
              <div className="time-dropdown">
                <button className="time-btn" onClick={() => setShowMinuteDropdown(!showMinuteDropdown)}>
                  {selectedTime.minute} <DownOutlined />
                </button>
                {showMinuteDropdown && (
                  <div className="dropdown-menu">
                    {minutes.map(minute => (
                      <div 
                        key={minute} 
                        className="dropdown-item"
                        onClick={() => handleMinuteChange(minute)}
                      >
                        {minute}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="time-dropdown ampm">
                <button className="time-btn ampm-btn" onClick={() => setShowAmPmDropdown(!showAmPmDropdown)}>
                  {selectedTime.ampm}
                </button>
                {showAmPmDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={() => handleAmPmChange('AM')}>AM</div>
                    <div className="dropdown-item" onClick={() => handleAmPmChange('PM')}>PM</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {compact && (
            <Button type="primary" className="apply-btn" onClick={onApply} style={{ marginTop: 12 }}>
              Apply
            </Button>
          )}
        </div>

        {!compact && (
          <div className="calendar-right">
            <div className="quick-option" onClick={() => handleQuickOption('today')}>
              Set to today
            </div>
            <div className="quick-option" onClick={() => handleQuickOption('tomorrow')}>
              Set to tomorrow
            </div>
            <div className="quick-option" onClick={() => handleQuickOption('week')}>
              Set to 1 week from now
            </div>
            <div className="quick-option" onClick={() => handleQuickOption('month')}>
              Set to 1 month from now
            </div>
            <div className="quick-option" onClick={() => handleQuickOption('someday')}>
              Set to someday
            </div>
            <div className="quick-option remove" onClick={() => handleQuickOption('remove')}>
              Remove follow up
            </div>
            <Button type="primary" className="apply-btn" onClick={onApply}>
              Apply
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowUpCalendar;
