import { useOutletContext } from 'react-router-dom';
import AttendancePage from '../../attendancePage';

const EmployeeDetailAttendance = () => {
  const { employee } = useOutletContext<{ employee: any }>() || {};
  const userId = employee?.user?._id;

  if (!userId) return null;

  return <AttendancePage userType="employee" title="Attendance" userId={userId} />;
};

export default EmployeeDetailAttendance;
