import { useOutletContext, useParams } from 'react-router-dom';
import BiometricAccessSection from '../../biometricAccessSection';
import { EmployeeDetailAddBiometricAccessRoute } from '../../../routes/routepath';

const EmployeeBiometricAccess = () => {
  const { id } = useParams<{ id: string }>();
  const { employee } = useOutletContext<{ employee: any }>() || {};
  const userId = employee?.user?._id || id;

  return (
    <BiometricAccessSection
      userId={userId}
      addPath={`/employee-detail/${id}${EmployeeDetailAddBiometricAccessRoute}`}
    />
  );
};

export default EmployeeBiometricAccess;
