import {
  PieChartOutlined,
  UserOutlined,
  TeamOutlined,
  SolutionOutlined,
  CalendarOutlined,
  BarChartOutlined,
  MailOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  StarOutlined,
  ShopOutlined,
  CreditCardOutlined,
  GiftOutlined,
  CarOutlined,
  WalletOutlined,
  MessageOutlined,
  SmileOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  PlusCircleOutlined,
  HistoryOutlined,
  SearchOutlined,
  StopOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  AuditOutlined,
  IdcardOutlined,
  UsergroupAddOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { AddEmployeeRoute, AddGeneralStaffRoute, AddRoleRoute, AddUserRoute, AllEmployeesRoute, AllGeneralStaffRoute, AllRolesRoute, AllTrainersRoute, AllDirectorsRoute, Home, AllUsersRoute, AllAddOnsUsersRoute, AllMembershipUsersRoute, DirectorAttendanceRoute, UserAttendanceRoute, EmployeeAttendanceRoute, TrainerAttendanceRoute, GeneralStaffAttendanceRoute, AllPackagesRoute, AllAddOnSlotsRoute, AddAddOnSlotRoute, AllAddOnPackagesRoute, AllBranchesRoute, AddBranchRoute, AllCouponsRoute, AddCouponRoute, AllFeedbacksRoute, AddBiometricRoute, AllBiometricsRoute, AllInventoryRoute, AddInventoryRoute, AddOnLiveDashboardRoute, WalkInIncomingRoute, ClientsRoute, AllDepartmentsRoute, AddDepartmentRoute, AllInvoiceRoute, AddInvoiceRoute, PartialInvoiceRoute, AllAcademicSetupRoute, AllParentsRoute } from '../../routes/routepath';

const items = [
  {
    key: '1',
    label:<Link to={Home}>Dashboard</Link>,
    icon: <PieChartOutlined />,
  },
  {
    key: '2',
    label: <Link to={AllRolesRoute}>Role</Link>,
    icon: <UserOutlined />,
  },
  {
    key: '3',
    label: <Link to={AllDirectorsRoute}>Director</Link>,
    icon: <TeamOutlined />,
  },
  // {
  //   key: '4',
  //   label: 'Attendance Management',
  //   icon: <CalendarOutlined />,
  //   children: [
  //     { key: '4-1', label: <Link to={DirectorAttendanceRoute}>Director Attendance</Link> },
  //     // { key: '4-2', label: <Link to={UserAttendanceRoute}>User Attendance</Link> },
  //     // { key: '4-3', label: <Link to={EmployeeAttendanceRoute}>Employee Attendance</Link> },
  //     // { key: '4-4', label: <Link to={TrainerAttendanceRoute}>Trainer Attendance</Link> },
  //     // { key: '4-5', label: <Link to={GeneralStaffAttendanceRoute}>General Staff Attendance</Link> },
  //   ],
  // },
  {
    key: '5',
    label: 'Biometric',
    icon: <SolutionOutlined />,
    children: [
      { key: '5-1', label: <Link to={AllBiometricsRoute}>All Biometrics</Link>, icon: <UnorderedListOutlined /> },
      // { key: '5-2', label: <Link to={AddBiometricRoute}>Add Biometric</Link> },
    ],
  },
  // {
  //   key: '6',
  //   label: 'Requests',
  //   icon: <MailOutlined />,
  //   children: [
  //     { key: '6-1', label: 'All Request' },
  //   ],
  // },
  // {
  //   key: '7',
  //   label: 'Sales Report',
  //   icon: <BarChartOutlined />,
  //   children: [
  //     { key: '7-1', label: 'Performance Graph' },
  //     { key: '7-2', label: 'Report' },
  //     { key: '7-3', label: 'Revenue History' },
  //   ],
  // },
  {
    key: '8',
    label: 'Employee Management',
    icon: <TeamOutlined />,
    children: [
      { key: '8-1', label: <Link to={AllEmployeesRoute}>All Employees</Link>, icon: <TeamOutlined /> },
      { key: '8-2', label: <Link to={AllGeneralStaffRoute}>All General Staff</Link>, icon: <UsergroupAddOutlined /> },
      { key: '8-3', label: <Link to={AllTrainersRoute}>All Teachers</Link>, icon: <SolutionOutlined /> },
    ],
  },
  {
    key: '9',
    label: 'User Management',
    icon: <UserOutlined />,
    children: [
      { key: '9-1', label: <Link to={AllUsersRoute}>All Users</Link>, icon: <UnorderedListOutlined /> },
      { key: '9-10', label: <Link to={AllMembershipUsersRoute}>All Students</Link>, icon: <IdcardOutlined /> },
      { key: '9-11', label: <Link to={AllParentsRoute}>All Parents</Link>, icon: <UserOutlined /> },
      { key: '9-2', label: <Link to={AddUserRoute}>Add User</Link>, icon: <PlusCircleOutlined /> },
      { key: '9-3', label: <Link to={AllAddOnsUsersRoute}>All Add-On's Users</Link>, icon: <UsergroupAddOutlined /> },
      { key: '9-4', label: <Link to={AddOnLiveDashboardRoute}>Add On Live Dashboard</Link>, icon: <DashboardOutlined /> },
      // { key: '9-5', label: <Link to={WalkInIncomingRoute}>Walk-in / Incoming</Link> },
      { key: '9-6', label: 'user-assissment', icon: <AuditOutlined /> },
      { key: '9-7', label: 'Activity Log', icon: <HistoryOutlined /> },
      { key: '9-8', label: 'Blacklist User', icon: <StopOutlined /> },
      { key: '9-9', label: 'Search Users', icon: <SearchOutlined /> },
    ],
  },
  {
    key: '10',
    label: 'Lead Management',
    icon: <BarChartOutlined />,
    children: [
      { key: '10-1', label: <Link to={ClientsRoute}>Clients</Link>, icon: <SolutionOutlined /> },
      { key: '10-2', label: 'Content', icon: <FileTextOutlined /> },
      { key: '10-3', label: 'Activities', icon: <HistoryOutlined /> },
      { key: '10-4', label: 'Team', icon: <TeamOutlined /> },
      { key: '10-5', label: 'Analytics', icon: <LineChartOutlined /> },
      { key: '10-6', label: 'Automations', icon: <ThunderboltOutlined /> },
    ],
  },
  // {
  //   key: '11',
  //   label: 'Data Management',
  //   icon: <FolderOpenOutlined />,
  //   children: [
  //     { key: '11-1', label: 'Upload Data' },
  //     { key: '11-2', label: 'View Data' },
  //     { key: '11-3', label: 'Search Data' },
  //     { key: '11-4', label: 'Walkin incoming' },
  //   ],
  // },
  // {
  //   key: '12',
  //   label: 'Group Class',
  //   icon: <StarOutlined />,
  //   children: [
  //     { key: '12-1', label: 'All Group Class' },
  //     { key: '12-2', label: 'Add Group Class' },
  //     { key: '12-3', label: 'All Group Class Slots' },
  //     { key: '12-4', label: 'Add Group Class Slot' },
  //   ],
  // },
  {
    key: '12',
    label: 'Academic & Fee Setup',
    icon: <ShopOutlined />,
    children: [
      { key: '12-1', label: <Link to={AllPackagesRoute}>Fee Structures</Link>, icon: <UnorderedListOutlined /> },
      { key: '12-4', label: <Link to={AllAcademicSetupRoute}>Academic Setup</Link>, icon: <ScheduleOutlined /> },
      { key: '12-2', label: <Link to={AllAddOnSlotsRoute}>All Add-on's Slots</Link>, icon: <AppstoreOutlined /> },
      { key: '12-3', label: <Link to={AllAddOnPackagesRoute}>All Add On's Package</Link>, icon: <GiftOutlined /> },
    ],
  },
  {
    key: '13',
    label: 'Trial Bookings',
    icon: <SmileOutlined />,
    children: [
      { key: '13-1', label: 'All Trial Bookings', icon: <ScheduleOutlined /> },
    ],
  },
  {
    key: '14',
    label: 'Branch',
    icon: <ShopOutlined />,
    children: [
      { key: '14-1', label: <Link to={AllBranchesRoute}>All Branches</Link>, icon: <UnorderedListOutlined /> },
      { key: '14-2', label: <Link to={AddBranchRoute}>Add Branch</Link>, icon: <PlusCircleOutlined /> },
    ],
  },
  {
    key: '16',
    label: 'Coupon',
    icon: <GiftOutlined />,
    children: [
      { key: '16-1', label: <Link to={AllCouponsRoute}>All Coupons</Link>, icon: <UnorderedListOutlined /> },
      { key: '16-2', label: 'Add Coupon', icon: <PlusCircleOutlined /> },
      { key: '16-3', label: 'Activity Log', icon: <HistoryOutlined /> },
    ],
  },
  // {
  //   key: '17',
  //   label: 'Banner',
  //   icon: <FileTextOutlined />,
  //   children: [
  //     { key: '17-1', label: 'All Banner' },
  //     { key: '17-2', label: 'Add Banner' },
  //   ],
  // },
  // {
  //   key: '18',
  //   label: 'Social Media',
  //   icon: <FileTextOutlined />,
  //   children: [
  //     { key: '18-1', label: 'All Socials Links' },
  //     { key: '18-2', label: 'Add Socials Links' },
  //   ],
  // },
  // {
  //   key: '19',
  //   label: 'Social Media',
  //   icon: <MessageOutlined />,
  //   children: [
  //     { key: '18-2', label: 'Add Socials Links' },
  //   ],
  // },
  // {
  //   key: '19',
  //   label: 'Parking Management',
  //   icon: <CarOutlined />,
  //   children: [
  //     { key: '19-1', label: 'All valet' },
  //     { key: '19-2', label: 'All Vehicles' },
  //     { key: '19-3', label: 'Vehicles history' },
  //   ],
  // },
  // {
  //   key: '20',
  //   label: 'Wallet Management',
  //   icon: <WalletOutlined />,
  //   children: [
  //     { key: '20-1', label: 'All Transaction' },
  //   ],
  // },
  {
    key: '21',
    label: 'Feedback Management',
    icon: <MessageOutlined />,
    children: [
      { key: '21-1', label: <Link to={AllFeedbacksRoute}>All Feedbacks</Link>, icon: <UnorderedListOutlined /> },
    ],
  },
  {
    key: '24',
    label: 'Invoice Management',
    icon: <CreditCardOutlined />,
    children: [
      { key: '24-1', label: <Link to={AllInvoiceRoute}>All Invoices</Link>, icon: <UnorderedListOutlined /> },
      { key: '24-3', label: <Link to={PartialInvoiceRoute}>Partial Invoices</Link>, icon: <CreditCardOutlined /> },
    ],
  },
  {
    key: '18',
    label: 'Inventory Management',
    icon: <AppstoreOutlined />,
    children: [
      { key: '18-1', label: <Link to={AllInventoryRoute}>All Inventory</Link>, icon: <UnorderedListOutlined /> },
    ],
  },
];

export { items };
