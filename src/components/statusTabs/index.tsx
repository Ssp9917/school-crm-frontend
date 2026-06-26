import React from 'react';
import { Select } from 'antd';
import './styles.scss';

const StatusTabs = ({ activeTab, onTabChange, tabs }) => {
  return (
    <>
      {/* Desktop View - Buttons */}
      <div className="status-tabs desktop-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label} <span className={`count count-${tab.key}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Mobile View - Select Dropdown */}
      <div className="mobile-tabs-select">

      <Select
        value={activeTab}
        onChange={onTabChange}
        className="status-tabs"
        style={{ width: '100%',height:42 }}
        >
        {tabs.map((tab) => (
          <Select.Option key={tab.key} value={tab.key}>
            {tab.label} ({tab.count})
          </Select.Option>
        ))}
      </Select>
        </div>
    </>
  );
};

export default StatusTabs;
