import React from 'react';
import { Layout, Drawer } from 'antd';
import SiderComponent from '../../components/sider';
import MainHeader from '../../components/mainHeader'; 
import { Outlet, Navigate } from 'react-router-dom';

const { Sider, Content } = Layout;

const MainLayout = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = React.useState(window.innerWidth > 768 && window.innerWidth <= 1024);

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
      
      if (width > 1024) {
        setMobileDrawerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  return (
    <Layout style={{ width: "100vw", background: 'var(--bg)', height: "100vh", overflow: "hidden" }}>
      
      {/* SIDEBAR - Desktop only (>1024px) */}
      {!isMobile && !isTablet && (
        <Sider
          collapsible
          collapsed={collapsed} 
          width={260}
          collapsedWidth={70}
          trigger={null}
          style={{ background: 'var(--sider-bg)', height: '100vh', overflow: 'hidden' }}
        >
          <SiderComponent collapsed={collapsed} />
        </Sider>
      )}

      {/* SIDEBAR - Mobile/Tablet Drawer (<=1024px) */}
      {(isMobile || isTablet) && (
        <Drawer
          placement="left"
          onClose={toggleMobileDrawer}
          open={mobileDrawerOpen}
          width={260}
          styles={{
            body: { padding: 0, background: 'var(--sider-bg)' },
            header: { display: 'none' }
          }}
          className="mobile-sidebar-drawer"
        >
          <SiderComponent collapsed={false} />
        </Drawer>
      )}

      {/* RIGHT SIDE LAYOUT */}
      <Layout style={{ height: "100vh", display: "flex", flexDirection: "column",background: 'var(--bg)' }}>
        
        <MainHeader 
          collapsed={collapsed} 
          setCollapsed={setCollapsed}
          isMobile={isMobile || isTablet}
          toggleMobileDrawer={toggleMobileDrawer}
        />

        <Content style={{ 
          padding: 12,
          // flex: 1,
          paddingBottom:"80px",
          overflowY: "auto", 
          // overflowX: "hidden",
          background: 'var(--card-bg)', 
          color: 'var(--sider-text)',
          WebkitOverflowScrolling: 'touch'
        }}>
          <Outlet />
        </Content>

      </Layout>
    </Layout>
  );
};

export default MainLayout;
