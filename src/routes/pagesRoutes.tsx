import AllFeedbacks from "../pages/allFeedbacks";
import AllDepartments from "../pages/allDepartments";
import AddDepartment from "../pages/addDepartment";
import { AllFeedbacksRoute, EditRoleRoute, userFeedbackRoute, AllDepartmentsRoute, AddDepartmentRoute, BlacklistRequestsRoute, SuperAdminDashboardRoute, FranchiseDashboardRoute, ClubManagerDashboardRoute, CustomerServiceDashboardRoute, SalesDashboardRoute, AllAcademicSetupRoute, AllParentsRoute, AllTenantsRoute, StudentAttendanceRoute, ExamsPageRoute, PayrollPageRoute, SchoolProfileRoute, SaaSPlansRoute } from "./routepath";
import AddCoupon from "../pages/addCoupon";
import { AddCouponRoute } from "./routepath";
import AllCoupons from "../pages/allCoupons";
import { AllCouponsRoute } from "./routepath";
import AcademicSetup from "../pages/academicSetup";
import Parents from "../pages/parents";
import SchoolOnboarding from "../pages/tenants";
import StudentAttendance from "../pages/studentAttendance";
import ExamsPage from "../pages/exams";
import PayrollPage from "../pages/payroll";
import SchoolProfile from "../pages/schoolProfile";
import SaaSPlans from "../pages/saasPlans";
 

import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { AddEmployeeRoute, AddUserRoute, EditUserRoute, EditEmployeeRoute, EditGeneralStaffRoute, EditTrainerRoute, AllEmployeesRoute, AllGeneralStaffRoute, AddGeneralStaffRoute, AllTrainersRoute, AddTrainerRoute, AllRolesRoute, AddRoleRoute, AllDirectorsRoute, AddDirectorRoute, EditDirectorRoute, AllPackagesRoute, AddPackageRoute, EditPackageRoute, AllAddOnSlotsRoute, AddAddOnSlotRoute, AllAddOnPackagesRoute, Home, loginRoute, forgotPasswordRoute, AllUsersRoute, AllAddOnsUsersRoute, DirectorAttendanceRoute, UserAttendanceRoute, EmployeeAttendanceRoute, TrainerAttendanceRoute, GeneralStaffAttendanceRoute, ViewFormRoute, EmployeeDetailRoute, EmployeeDetailAttendanceRoute, EmployeeDetailEmployeeIdRoute, EmployeeDetailSalaryRoute, EmployeeDetailSalesHistoryRoute, EmployeeDetailParkingHistoryRoute, EmployeeDetailBiometricAccessRoute, EmployeeDetailAddBiometricAccessRoute, GeneralStaffDetailRoute, GeneralStaffDetailAttendanceRoute, GeneralStaffDetailIdRoute, GeneralStaffDetailSalaryRoute, GeneralStaffDetailBiometricAccessRoute, GeneralStaffDetailAddBiometricAccessRoute, TrainerDetailRoute, TrainerDetailAttendanceRoute, TrainerDetailCoachIdRoute, TrainerDetailClassesRoute, TrainerDetailTransactionsRoute, TrainerDetailParkingHistoryRoute, TrainerDetailBiometricAccessRoute, UserDetailAttendanceRoute, UserDetailMemberIdRoute, UserDetailMembershipRoute, UserDetailAssessmentRoute, UserDetailRefundHistoryRoute, UserDetailParkingHistoryRoute, UserDetailDietsPlanRoute, UserDetailBiometricAccessRoute, UserDetailRoute, AllBranchesRoute, AddBranchRoute, EditBranchRoute, UserDetailMembershipFreezabilityRoute, UserDetailMembershipDaysRoute, DirectorDetailPageRoute, DirectorAttendancePageRoute, DirectorBiometricAccessPageRoute, AddAddOnPackageRoute, EditAddOnPackageRoute, AddBiometricRoute, AllBiometricsRoute, AllInventoryRoute, AddInventoryRoute, AllInvoiceRoute, AddInvoiceRoute, EditInvoiceRoute, PartialInvoiceRoute, InvoiceDetailRoute, AddOnSessionDetailRoute, AddOnLiveDashboardRoute, WalkInIncomingRoute, AddWalkInRoute, ClientsRoute, ClientDetailRoute, ConvertLeadRoute, ContentRoute, CreatePageRoute, AllMembershipUsersRoute, AllSessionsRoute, UserAssessmentRoute, AssessmentBatteryRoute, LeadActivityRoute } from "./routepath";
import AddBranch from "../pages/addBranch";
import AllBranches from "../pages/allBranches";
import AddBiometric from "../pages/addBiometric";
import AllBiometrics from "../pages/allBiometrics";
import MainLayout from "../common/mainLayout";
import Dashboard from "../pages/dashboard";
import AddUser from "../pages/addUser";
import EditUser from "../pages/editUser";
import ConvertLead from "../pages/convertLead";
import AddEmployee from "../pages/addEmployee";
import EditEmployee from "../pages/editEmployee";
import AllEmployees from "../pages/allEmployees";
import AllGeneralStaff from "../pages/allGeneralStaff";
import AddGeneralStaff from "../pages/addGeneralStaff";
import EditGeneralStaff from "../pages/editGeneralStaff";
import AllTrainers from "../pages/allTrainers";
import AddTrainer from "../pages/addTrainer";
import EditTrainer from "../pages/editTrainer";
import AllRoles from "../pages/allRoles";
import AddRole from "../pages/addRole";
import AddDirector from "../pages/addDirector";
import EditDirector from "../pages/editDirector";
import AllDirectors from "../pages/allDirectors";
import AllPackages from "../pages/allPackages";
import AddPackage from "../pages/addPackage";
import EditPackage from "../pages/editPackage";
import AllAddOnSlots from "../pages/allAddOnSlots";
import AddAddOnSlot from "../pages/addAddOnSlot";
import Login from "../pages/auth/login";
import ForgotPassword from "../pages/auth/forgotPassword";
import AllUsers from "../pages/allUsers";
import AllAddOnsUsers from "../pages/allAddOnsUsers";
import AllMembershipUsers from "../pages/allMembershipUsers";
import AllSessions from "../pages/allSessions";
import UserAssessment from "../pages/userAssessment";
import AssessmentBattery from "../pages/assessmentBattery";
import DirectorAttendance from "../pages/directorAttendance";
import UserAttendancePage from "../pages/userAttendance";
import EmployeeAttendancePage from "../pages/employeeAttendance";
import TrainerAttendancePage from "../pages/trainerAttendance";
import GeneralStaffAttendancePage from "../pages/generalStaffAttendance";
import ViewForm from "../pages/viewForm";

import EmployeeDetailPage from "../pages/employeeDetail";
import EmployeeDetailAttendance from "../components/employeeDetail/attendance";
import EditRole from "../pages/editRole";
import EmployeeIdSection from "../components/employeeDetail/employeeId";
import SalarySection from "../components/employeeDetail/salary";
import SalesHistorySection from "../components/employeeDetail/salesHistory";
import ParkingHistorySection from "../components/employeeDetail/parkingHistory";
import BiometricAccessSection from "../components/employeeDetail/biometricAccess";
import AddBiometricAccess from "../components/employeeDetail/biometricAccess/AddBiometricAccess";

import GeneralStaffDetailPage from "../pages/generalStaffDetail";
import GeneralStaffDetailAttendance from "../components/generalStaffDetail/attendance";
import GeneralStaffIdSection from "../components/generalStaffDetail/generalStaffId";
import GeneralStaffSalarySection from "../components/generalStaffDetail/salary";
import GeneralStaffBiometricAccessSection from "../components/generalStaffDetail/biometricAccess";
import AddGeneralStaffBiometricAccess from "../components/generalStaffDetail/biometricAccess/AddBiometricAccess";

import TrainerDetailPage from "../pages/trainerDetail";
import TrainerDetailAttendance from "../components/trainerDetail/attendance";
import CoachIdSection from "../components/trainerDetail/coachId";
import TrainerClasses from "../components/trainerDetail/classes";
import TrainerTransactions from "../components/trainerDetail/transactions";
import TrainerParkingHistory from "../components/trainerDetail/parkingHistory";
import TrainerBiometricAccessSection from "../components/trainerDetail/biometricAccess";
import AllAddOnPackages from "../pages/allAddOnPackages";
import SuperAdminDashboard from "../pages/superAdminDashboard";
import FranchiseDashboard from "../pages/franchiseDashboard";
import ClubManagerDashboard from "../pages/clubManagerDashboard";
import CustomerServiceDashboard from "../pages/customerServiceDashboard";
import SalesDashboard from "../pages/salesDashboard";
import AddAddOnPackage from "../pages/addAddOnPackage";
import EditAddOnPackage from "../pages/editAddOnPackage";
import UserDetailPage from "../pages/userDetail";
import UserAttendance from "../components/userDetail/attendance";
import UserMembership from "../components/userDetail/membership";
import Assessment from "../components/userDetail/assessment";
import RefundHistory from "../components/userDetail/refundHistory";
import DietsPlan from "../components/userDetail/dietsPlan";
import UserParkingHistory from "../components/userDetail/parkingHistory";
import UserBiometricAccess from "../components/userDetail/biometricAccess";
import MemberIdSection from "../components/userDetail/memberId";
import UserInvoice from "../components/userDetail/invoice";
import GymKit from "../components/userDetail/gymKit";
import AddUserBiometricAccess from "../components/userDetail/biometricAccess/AddUserBiometricAccess";
import BuyPlan from "../components/userDetail/buyPlan";
import BuyMembership from "../components/userDetail/buyMembership";
import UpgradePlan from "../components/userDetail/upgradePlan";
import AdvanceRenew from "../components/userDetail/advanceRenew";
import BuyAddOnService from "../components/userDetail/buyAddOnService";
import AddOnService from "../components/userDetail/addOnService";
import SelectAddOnService from "../components/userDetail/selectAddOnService";
import PayDueAmount from "../components/userDetail/payDueAmount";
import AddonClearBalance from "../components/userDetail/addonClearBalance";
import AddonUpgrade from "../components/userDetail/addonUpgrade";
import AddonRenew from "../components/userDetail/addonRenew";
import {ErrorBoundary} from "../components/errorBoundery";
import EditBranch from "../pages/editBranch";
import FreezabilityForm from "../components/userDetail/membership/FreezabilityForm";
import DaysForm from "../components/userDetail/membership/DaysForm";
import DirectorDetailPage from "../pages/directorDetail";

import DirectorDetailAttendance from "../components/directorDetail/attendance";
import DirectorDetailBiometricAccess from "../components/directorDetail/biometricAccess";
import UserFeedback from "../components/userDetail/userFeedback";
import AllInventory from "../pages/allInventory";
import AddInventory from "../pages/addInventory";
import AllInvoice from "../pages/allInvoice";
import AddInvoice from "../pages/addInvoice";
import EditInvoice from "../pages/editInvoice";
import PartialInvoice from "../pages/partialInvoice";
import InvoiceDetailPage from "../pages/invoiceDetail";
import AddOnSessionDetail from "../pages/addOnSessionDetail";
import AddOnLiveDashboard from "../pages/addOnLiveDashboard";
import WalkInIncoming from "../pages/walkInIncoming";
import AddWalkIn from "../pages/addWalkIn";
import Clients from "../pages/clients";
import Content from "../pages/content";
import ClientDetail from "../pages/clientDetail";
import CreateNewPage from "../pages/content/CreateNewPage";
import LeadActivity from "../pages/leadActivity";
import BlacklistRequests from "../pages/blacklistRequests";
import NotFound from "../pages/notFound";

export const router = createBrowserRouter([
  {
    path: Home,
    element:<MainLayout/>,
    children:[
      { path: Home, element:<Dashboard/> },
      { path: AddUserRoute, element:<AddUser/> },
      { path: `${EditUserRoute}/:id`, element:<EditUser/> },
      { path: AddEmployeeRoute, element:<AddEmployee/> },
      { path: `${EditEmployeeRoute}/:id`, element:<EditEmployee/> },
      { path: AllEmployeesRoute, element:<AllEmployees/> },
      { path: AllGeneralStaffRoute, element:<AllGeneralStaff/> },
      { path: AddGeneralStaffRoute, element:<AddGeneralStaff/> },
      { path: `${EditGeneralStaffRoute}/:id`, element:<EditGeneralStaff/> },
      { path: AllTrainersRoute, element:<AllTrainers/> },
      { path: AddTrainerRoute, element:<AddTrainer/> },
      { path: `${EditTrainerRoute}/:id`, element:<EditTrainer/> },
      { path: AllRolesRoute, element:<AllRoles/> },
      { path: AddRoleRoute, element:<AddRole/> },
      { path: AllDirectorsRoute, element:<AllDirectors/> },
      { path: AddDirectorRoute, element:<AddDirector/> },
      { path: `${EditDirectorRoute}/:id`, element:<EditDirector/> },
      { path: AllPackagesRoute, element:<AllPackages/> },
      { path: AddPackageRoute, element:<AddPackage/> },
      { path: `${EditPackageRoute}/:id`, element:<EditPackage/> },
      { path: AllUsersRoute, element:<AllUsers/> },
      { path: AllAddOnsUsersRoute, element:<AllAddOnsUsers/> },
      { path: AllMembershipUsersRoute, element:<AllMembershipUsers/> },
      { path: AllSessionsRoute, element:<AllSessions/> },
      { path: UserAssessmentRoute, element:<UserAssessment/> },
      { path: AssessmentBatteryRoute, element:<AssessmentBattery/> },
      { path: AddOnLiveDashboardRoute, element:<AddOnLiveDashboard/> },
      { path: WalkInIncomingRoute, element:<WalkInIncoming/> },
      { path: AddWalkInRoute, element:<AddWalkIn/> },
      { path: ClientsRoute, element:<Clients/> },
      { path: `${ClientDetailRoute}/:id`, element:<ClientDetail/> },
      { path: `${ConvertLeadRoute}/:id`, element:<ConvertLead/> },
      { path: ContentRoute, element:<Content/> },
      { path: `${CreatePageRoute}/:type`, element:<CreateNewPage/> },
      { path: LeadActivityRoute, element:<LeadActivity/> },
      { path: `${ViewFormRoute}/:id`, element:<ViewForm/> },
      { path: AllAddOnPackagesRoute, element: <AllAddOnPackages/> },
      { path: AddAddOnPackageRoute, element: <AddAddOnPackage/> },
      { path: `${EditAddOnPackageRoute}/:id`, element: <EditAddOnPackage/> },
      { path: DirectorAttendanceRoute, element:<DirectorAttendance/> },
      { path: UserAttendanceRoute, element:<UserAttendancePage/> },
      { path: EmployeeAttendanceRoute, element:<EmployeeAttendancePage/> },
      { path: TrainerAttendanceRoute, element:<TrainerAttendancePage/> },
      { path: GeneralStaffAttendanceRoute, element:<GeneralStaffAttendancePage/> },
      { path: AddPackageRoute, element:<AddPackage/> },
      { path: AllAddOnSlotsRoute, element:<AllAddOnSlots/> },
      { path: AddAddOnSlotRoute, element:<AddAddOnSlot/> },
      { path: AddBranchRoute, element: <AddBranch/> },
      { path: AllBranchesRoute, element: <AllBranches /> },
      { path: AddBiometricRoute, element: <AddBiometric/> },
      { path: AllBiometricsRoute, element: <AllBiometrics/> },
      { path: `${EditBranchRoute}/:id`, element: <EditBranch />, errorElement: <ErrorBoundary /> },
      {
        path: `${EmployeeDetailRoute}/:id`,
        element: <EmployeeDetailPage />,
        children: [
          {
            path: EmployeeDetailAttendanceRoute.slice(1),
            element: <EmployeeDetailAttendance />
          },
          {
            path: EmployeeDetailEmployeeIdRoute.slice(1),
            element: <EmployeeIdSection />
          },
          {
            path: EmployeeDetailSalaryRoute.slice(1),
            element: <SalarySection />
          },
          {
            path: EmployeeDetailSalesHistoryRoute.slice(1),
            element: <SalesHistorySection />
          },
          {
            path: EmployeeDetailParkingHistoryRoute.slice(1),
            element: <ParkingHistorySection />
          },
          {
            path: EmployeeDetailBiometricAccessRoute.slice(1),
            element: <BiometricAccessSection />
          },
          {
            path: EmployeeDetailAddBiometricAccessRoute.slice(1),
            element: <AddBiometricAccess />
          },
          {
            index: true,
            element: <EmployeeDetailAttendance />
          }
        ],
      },

      // User Detail Route
      {
        path: `${UserDetailRoute}/:id`,
        element: <UserDetailPage />, 
          errorElement: <ErrorBoundary />,  // Add error boundary
        children: [
          { path: UserDetailAttendanceRoute.slice(1), element: <UserAttendance /> },
          { path: UserDetailMemberIdRoute.slice(1), element: <MemberIdSection /> },
          { path: "buy-plan", element: <BuyPlan /> },
          { path: "buy-membership", element: <BuyMembership /> },
          { path: "upgrade-plan", element: <UpgradePlan /> },
          { path: "advance-renew", element: <AdvanceRenew /> },
          { path: "pay-due-amount", element: <PayDueAmount /> },
          { path: "addon-service", element: <AddOnService /> },
          { path: "select-addon-service", element: <SelectAddOnService /> },
          { path: "buy-addon-service", element: <BuyAddOnService /> },
          { path: "addon-clear-balance/:membershipId", element: <AddonClearBalance /> },
          { path: "addon-upgrade/:membershipId", element: <AddonUpgrade /> },
          { path: "addon-renew/:membershipId", element: <AddonRenew /> },
          { path: `addon-service${AddOnSessionDetailRoute}/:membershipId`, element: <AddOnSessionDetail /> },
          { path: "invoice", element: <UserInvoice /> },
        
          { path: UserDetailMembershipRoute.slice(1), element: <UserMembership /> },
          { path: `membership${AddOnSessionDetailRoute}/:membershipId`, element: <AddOnSessionDetail /> },
          { path: UserDetailMembershipFreezabilityRoute.slice(1), element: <FreezabilityForm /> },
          { path: UserDetailMembershipDaysRoute.slice(1), element: <DaysForm /> },
          { path: UserDetailAssessmentRoute.slice(1), element: <Assessment /> },
          { path: "gym-kit", element: <GymKit /> },
          { path: UserDetailRefundHistoryRoute.slice(1), element: <RefundHistory /> },
          { path: UserDetailParkingHistoryRoute.slice(1), element: <UserParkingHistory /> },
          { path: UserDetailDietsPlanRoute.slice(1), element: <DietsPlan /> },
          { path: UserDetailBiometricAccessRoute.slice(1), element: <UserBiometricAccess /> },
          { path: userFeedbackRoute.slice(1), element: <UserFeedback /> },
          { path: "add-biometric-access", element: <AddUserBiometricAccess /> },
          { index: true, element: <UserAttendance /> },
        ],
      },
      // director Detail Route
      {
        path: `${DirectorDetailPageRoute}/:id`,
        element: <DirectorDetailPage />, 
          errorElement: <ErrorBoundary />,  // Add error boundary
        children: [
          { path: DirectorAttendancePageRoute.slice(1), element: <DirectorDetailAttendance /> },
          { path: DirectorBiometricAccessPageRoute.slice(1), element: <DirectorDetailBiometricAccess /> },
       
          { index: true, element: <DirectorDetailAttendance /> },
        ],
      },

      {
        path: `${GeneralStaffDetailRoute}/:id`,
        element: <GeneralStaffDetailPage />,
        children: [
          {
            path: GeneralStaffDetailAttendanceRoute.slice(1),
            element: <GeneralStaffDetailAttendance />
          },
          {
            path: GeneralStaffDetailIdRoute.slice(1),
            element: <GeneralStaffIdSection />
          },
          {
            path: GeneralStaffDetailSalaryRoute.slice(1),
            element: <GeneralStaffSalarySection />
          },
          {
            path: GeneralStaffDetailBiometricAccessRoute.slice(1),
            element: <GeneralStaffBiometricAccessSection />
          },
          {
            path: GeneralStaffDetailAddBiometricAccessRoute.slice(1),
            element: <AddGeneralStaffBiometricAccess />
          },
          {
            index: true,
            element: <GeneralStaffDetailAttendance />
          }
        ],
      },

      {
        path: `${TrainerDetailRoute}/:id`,
        element: <TrainerDetailPage />,
        children: [
          {
            path: TrainerDetailAttendanceRoute.slice(1),
            element: <TrainerDetailAttendance />
          },
          {
            path: TrainerDetailCoachIdRoute.slice(1),
            element: <CoachIdSection />
          },
          {
            path: TrainerDetailClassesRoute.slice(1),
            element: <TrainerClasses />
          },
          {
            path: TrainerDetailTransactionsRoute.slice(1),
            element: <TrainerTransactions />
          },
          {
            path: TrainerDetailParkingHistoryRoute.slice(1),
            element: <TrainerParkingHistory />
          },
          {
            path: TrainerDetailBiometricAccessRoute.slice(1),
            element: <TrainerBiometricAccessSection />
          },
          {
            index: true,
            element: <TrainerDetailAttendance />
          }
        ],
      },
      { path: AllCouponsRoute, element: <AllCoupons /> },
      { path: AddCouponRoute, element: <AddCoupon /> },
      { path: AllFeedbacksRoute, element: <AllFeedbacks /> },
      { path: AllDepartmentsRoute, element: <AllDepartments /> },
      { path: AddDepartmentRoute, element: <AddDepartment /> },
      { path: AllInventoryRoute, element: <AllInventory /> },
      { path: AddInventoryRoute, element: <AddInventory /> },
      { path: AllInvoiceRoute, element: <AllInvoice /> },
      { path: AddInvoiceRoute, element: <AddInvoice /> },
      { path: `${EditInvoiceRoute}/:id`, element: <EditInvoice /> },
      { path: PartialInvoiceRoute, element: <PartialInvoice /> },
      { path: `${InvoiceDetailRoute}/:id`, element: <InvoiceDetailPage /> },
      { path: `${AddOnSessionDetailRoute}/:id`, element: <AddOnSessionDetail /> },
      { path: `${EditRoleRoute}/:id`, element: <EditRole /> },
      { path: BlacklistRequestsRoute,          element: <BlacklistRequests /> },
      { path: SuperAdminDashboardRoute,        element: <SuperAdminDashboard /> },
      { path: FranchiseDashboardRoute,         element: <FranchiseDashboard /> },
      { path: ClubManagerDashboardRoute,       element: <ClubManagerDashboard /> },
      { path: CustomerServiceDashboardRoute,   element: <CustomerServiceDashboard /> },
      { path: SalesDashboardRoute,             element: <SalesDashboard /> },
      { path: AllAcademicSetupRoute,           element: <AcademicSetup /> },
      { path: AllParentsRoute,                 element: <Parents /> },
      { path: AllTenantsRoute,                 element: <SchoolOnboarding /> },
      { path: StudentAttendanceRoute,          element: <StudentAttendance /> },
      { path: ExamsPageRoute,                  element: <ExamsPage /> },
      { path: PayrollPageRoute,                element: <PayrollPage /> },
      { path: SchoolProfileRoute,              element: <SchoolProfile /> },
      { path: SaaSPlansRoute,                  element: <SaaSPlans /> },
    ]
    
  },
 
  {
    path: loginRoute,
    element: localStorage.getItem('token') ? <Navigate to={Home} replace /> : <Login />
  },
  {
    path: forgotPasswordRoute,
    element: localStorage.getItem('token') ? <Navigate to={Home} replace /> : <ForgotPassword />
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

