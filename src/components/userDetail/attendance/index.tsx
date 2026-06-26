import { useParams } from 'react-router-dom';
import AttendancePage from '../../attendancePage';

const UserAttendance = () => {
  const { id } = useParams<{ id: string }>();

  return <AttendancePage userType="user" title="Attendance" userId={id} />;
};

export default UserAttendance;
