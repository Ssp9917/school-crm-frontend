import { useOutletContext } from 'react-router-dom';
import AttendancePage from '../../attendancePage';

const TrainerAttendance = () => {
  const { trainer } = useOutletContext<{ trainer: any }>() || {};
  const userId = trainer?.user?._id;

  if (!userId) return null;

  return <AttendancePage userType="coach" title="Attendance" userId={userId} />;
};

export default TrainerAttendance;
