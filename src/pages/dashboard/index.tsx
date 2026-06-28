import { useSelector } from 'react-redux';
import { useState } from 'react';
import HierarchicalChart from '../../components/charts/HierarchicalChart';
import { useGetSalesTodayQuery, useGetSalesMonthlyQuery } from '../../services/upline';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface SalesPerson {
  id:         string;
  name:       string;
  revenue:    number;
  image?:     string;
  branchName?: string;
}

interface SalesData {
  employees:     SalesPerson[];
  trainers:      SalesPerson[];
  totalSales:    number;
  totalTrainers: number;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const FILTER_MAP: Record<string, string> = {
  '0':   'this_month',
  '1':   'last_month',
  '3':   '3_months',
  '6':   '6_months',
  'all': 'all',
};

const EMPTY_SALES_DATA: SalesData = { employees: [], trainers: [], totalSales: 0, totalTrainers: 0 };

/* ─── Helpers ────────────────────────────────────────────────────────── */

function mapSalesPerson(item: any, revenueKey: string): SalesPerson {
  return {
    id:         item.id,
    name:       item.name || item.employeeId?.name,
    revenue:    item[revenueKey] || 0,
    image:      item.photo || item.employeeId?.photo,
    branchName: item.branchName,
  };
}

function transformSalesData(apiData: any, revenueKey: string): SalesData {
  if (!apiData?.data) return EMPTY_SALES_DATA;
  const employees: SalesPerson[] = (apiData.data.employee ?? []).map((i: any) => mapSalesPerson(i, revenueKey));
  const trainers:  SalesPerson[] = (apiData.data.trainer  ?? []).map((i: any) => mapSalesPerson(i, revenueKey));
  return {
    employees,
    trainers,
    totalSales:    employees.reduce((s, e) => s + e.revenue, 0),
    totalTrainers: trainers.reduce((s, t)  => s + t.revenue, 0),
  };
}

/* ─── Component ──────────────────────────────────────────────────────── */

import { Typography, Card, Row, Col, Statistic } from 'antd';
import { BookOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';

const { Title } = Typography;

function Dashboard() {
  const branchId         = useSelector((state: any) => state.branch.selectedBranch);
  const selectedBranchId = typeof branchId === 'object' ? (branchId?._id || branchId?.id) : branchId;

  const [selectedRange, setSelectedRange] = useState('0');

  const currentFilter = FILTER_MAP[selectedRange] ?? 'this_month';

  const { data: salesTodayData }  = useGetSalesTodayQuery(
    (selectedBranchId ? { branchId: selectedBranchId } : undefined) as any
  );
  const { data: salesMonthlyData } = useGetSalesMonthlyQuery({
    filter: currentFilter,
    ...(selectedBranchId && { branchId: selectedBranchId }),
  } as any);

  const todayData:   SalesData = transformSalesData(salesTodayData,  'todaySales');
  const monthlyData: SalesData = transformSalesData(salesMonthlyData, 'thisMonthSales');

  const [user, setUser] = useState<any>(null);

  useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(storedUser);
    } catch (e) {
      console.error(e);
    }
  });

  const userType = user?.userType?.toUpperCase() || '';
  const roleName = user?.roleId?.name?.toUpperCase() || '';

  const isTeacher = userType === 'TEACHER' || roleName === 'TEACHER';
  const isStudent = userType === 'USER' || roleName === 'STUDENT';
  const isParent  = userType === 'PARENT' || roleName === 'PARENT';

  if (isTeacher) {
    return (
      <div className="dashboard-wrapper" style={{ padding: '24px' }}>
        <Title level={2}>Teacher Portal</Title>
        <p>Welcome back, {user?.name}!</p>
        <Row gutter={16} style={{ marginTop: '24px' }}>
          <Col span={8}>
            <Card>
              <Statistic title="Classes Today" value={4} prefix={<BookOutlined />} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Students Present" value={85} suffix="%" prefix={<TeamOutlined />} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Upcoming Exams" value={1} prefix={<CalendarOutlined />} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  if (isStudent || isParent) {
    return (
      <div className="dashboard-wrapper" style={{ padding: '24px' }}>
        <Title level={2}>{isParent ? 'Parent Portal' : 'Student Portal'}</Title>
        <p>Welcome back, {user?.name}!</p>
        <Row gutter={16} style={{ marginTop: '24px' }}>
          <Col span={8}>
            <Card>
              <Statistic title="My Attendance" value={92} suffix="%" prefix={<CalendarOutlined />} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Assignments Due" value={3} prefix={<BookOutlined />} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Upcoming Exams" value={2} prefix={<CalendarOutlined />} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="revenue-charts-section">
        <div className="charts-grid">
          <HierarchicalChart
            title="Fee Today Collection"
            amount={todayData.totalSales.toLocaleString('en-IN')}
            data={todayData.employees}
            type="sales"
          />
          <HierarchicalChart
            title="Teachers Today Revenue"
            amount={todayData.totalTrainers.toLocaleString('en-IN')}
            data={todayData.trainers}
            type="trainers"
          />
        </div>

        <div className="charts-grid">
          <HierarchicalChart
            title="Monthly Fee Collection"
            amount={monthlyData.totalSales.toLocaleString('en-IN')}
            period={selectedRange}
            data={monthlyData.employees}
            type="sales"
            onPeriodChange={(value: string) => setSelectedRange(value)}
          />
          <HierarchicalChart
            title="Teachers Monthly Revenue"
            amount={monthlyData.totalTrainers.toLocaleString('en-IN')}
            period={selectedRange}
            data={monthlyData.trainers}
            type="trainers"
            onPeriodChange={(value: string) => setSelectedRange(value)}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
