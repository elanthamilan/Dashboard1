import React from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  BarChartOutlined,
  ApartmentOutlined // Add this
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header, Sider, Content, Footer } = Layout;

const menuItems = [
  { key: '/', icon: <HomeOutlined />, label: <Link to="/">Home</Link> },
  { key: '/admissions', icon: <TeamOutlined />, label: <Link to="/admissions">Admissions</Link> },
  { key: '/attendance', icon: <CalendarOutlined />, label: <Link to="/attendance">Attendance</Link> },
  { key: '/billing', icon: <DollarOutlined />, label: <Link to="/billing">Billing</Link> },
  { key: '/performance', icon: <BarChartOutlined />, label: <Link to="/performance">Performance</Link> },
  { key: '/principal-view', icon: <ApartmentOutlined />, label: <Link to="/principal-view">Principal View</Link> },
];

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Highlight the current menu item based on the route
  const selectedKey = menuItems.find(item => location.pathname.startsWith(item.key))?.key || '/';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ height: 48, margin: 16, color: '#fff', fontWeight: 'bold', fontSize: 20, textAlign: 'center' }}>
          SIS Dashboard
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', fontSize: 18, fontWeight: 500, boxShadow: '0 2px 8px #f0f1f2' }}>
          {/* You can add user info, notifications, etc. here */}
          School Information System
        </Header>
        <Content style={{ margin: '24px 16px 0', background: '#fff', minHeight: 360, borderRadius: 8, boxShadow: '0 1px 4px #f0f1f2' }}>
          {children}
        </Content>
        <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
          © {new Date().getFullYear()} School Dashboard
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
