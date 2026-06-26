import { useOutletContext } from 'react-router-dom';
import AttendancePage from '../../attendancePage';

const DirectorDetailAttendance = () => {
  const { userInfo } = useOutletContext<{ userInfo: any }>() || {};
  const userId = userInfo?._id;

  if (!userId) return null;

  return <AttendancePage userType="director" title="Attendance" userId={userId} />;
};

export default DirectorDetailAttendance;
