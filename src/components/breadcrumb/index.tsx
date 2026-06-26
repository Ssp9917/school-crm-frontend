import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import './styles.scss';

// items: [{ label: 'Home', to: '/' , icon: <HomeOutlined/> }, { label: 'Users', to: '/users' }, { label: 'Add User' }]
const PageBreadcrumb = ({ items = [] }) => {
  return (
    <div className="page-breadcrumb">
      <Breadcrumb>
        {items?.map((it, idx) => {
          const isLast = idx === items.length - 1;
          if (it.to && !isLast) {
            return (
              <Breadcrumb.Item key={idx}>
                <Link to={it.to}>{it.icon ? it.icon : it.label}</Link>
              </Breadcrumb.Item>
            );
          }

          // last item or item without link
          return (
            <Breadcrumb.Item key={idx}>{it.icon ? it.icon : it.label}</Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    </div>
  );
};

export default PageBreadcrumb;
