import { useOutletContext } from 'react-router-dom';
import AttendancePage from '../../attendancePage';

const GeneralStaffAttendance = () => {
  const { staff } = useOutletContext<{ staff: any }>() || {};
  const userId = staff?.user?._id;

  if (!userId) return null;

  return <AttendancePage userType="generalStaff" title="Attendance" userId={userId} />;
};

export default GeneralStaffAttendance;
