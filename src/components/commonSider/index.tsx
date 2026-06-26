import React from 'react';
import './styles.scss';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';

const CommonSider = ({ items = [], activeKey, onSelect, mobileTabsProps }) => {
  return (
    <>
      {/* Mobile Tabs for responsive */}
        <div className="mobile-tabs">
          <Menu
            mode="horizontal"
            overflowedIndicator="..."
            selectedKeys={[mobileTabsProps.currentTab]}
            onClick={mobileTabsProps.onTabClick}
            items={mobileTabsProps.tabItems}
          />
        </div>
      <aside className="common-sider">
        <ul>
          {items.map(item => (
            <li key={item.key}>
              <Link to={item.path || item.key} className={activeKey === item.key ? 'active' : ''}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
};

export default CommonSider;
