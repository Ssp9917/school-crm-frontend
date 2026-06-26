import React, { useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import './styles.scss';

const Calendar = ({ selectedDate, onDateChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    if (!startDate || (startDate && endDate)) {
      // Start new range
      setStartDate(clickedDate);
      setEndDate(null);
    } else {
      // Complete the range
      if (clickedDate < startDate) {
        setEndDate(startDate);
        setStartDate(clickedDate);
      } else {
        setEndDate(clickedDate);
      }
    }
  };

  const handleSetToAny = () => {
    setStartDate(null);
    setEndDate(null);
    if (onDateChange) {
      onDateChange(null);
    }
  };

  const handleDone = () => {
    if (startDate && endDate && onDateChange) {
      onDateChange({ start: startDate, end: endDate });
    }
  };

  const isInRange = (day) => {
    if (!startDate) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    if (endDate) {
      return date >= startDate && date <= endDate;
    } else if (hoveredDate) {
      const rangeStart = startDate < hoveredDate ? startDate : hoveredDate;
      const rangeEnd = startDate > hoveredDate ? startDate : hoveredDate;
      return date >= rangeStart && date <= rangeEnd;
    }
    return false;
  };

  const isStartOrEnd = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return (startDate && date.getTime() === startDate.getTime()) || 
           (endDate && date.getTime() === endDate.getTime());
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const inRange = isInRange(day);
    const isStartEnd = isStartOrEnd(day);

    days.push(
      <div
        key={day}
        className={`calendar-day ${inRange ? 'in-range' : ''} ${isStartEnd ? 'selected' : ''}`}
        onClick={() => handleDateClick(day)}
        onMouseEnter={() => setHoveredDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
        onMouseLeave={() => setHoveredDate(null)}
      >
        {day}
      </div>
    );
  }

  return (
    <div className='calender-con'>
    <div className="calendar-container">
      <div className="calendar-header">
        <LeftOutlined onClick={handlePrevMonth} className="nav-icon" />
        <h3 className="calendar-title">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <RightOutlined onClick={handleNextMonth} className="nav-icon" />
       
      </div>

      <div className="calendar-weekdays">
        <div className="weekday">S</div>
        <div className="weekday">M</div>
        <div className="weekday">T</div>
        <div className="weekday">W</div>
        <div className="weekday">T</div>
        <div className="weekday">F</div>
        <div className="weekday">S</div>
      </div>

      <div className="calendar-days">
        {days}
      </div>

     
    </div>
    <div className="set-any-way">
         <div className="calendar-set-any" onClick={handleSetToAny}>
          Set to Any
        </div>
         {startDate && endDate && (
          <button className="calendar-done-btn" onClick={handleDone}>
          Done
        </button>
      )}
    </div>
      </div>
  );
};

export default Calendar;
