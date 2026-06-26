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

  return (
    <div className="dashboard-wrapper">
      <div className="revenue-charts-section">
        <div className="charts-grid">
          <HierarchicalChart
            title="Sales Today Revenue"
            amount={todayData.totalSales.toLocaleString('en-IN')}
            data={todayData.employees}
            type="sales"
          />
          <HierarchicalChart
            title="Trainers Today Revenue"
            amount={todayData.totalTrainers.toLocaleString('en-IN')}
            data={todayData.trainers}
            type="trainers"
          />
        </div>

        <div className="charts-grid">
          <HierarchicalChart
            title="Sales Revenue"
            amount={monthlyData.totalSales.toLocaleString('en-IN')}
            period={selectedRange}
            data={monthlyData.employees}
            type="sales"
            onPeriodChange={(value: string) => setSelectedRange(value)}
          />
          <HierarchicalChart
            title="Trainers Revenue"
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
