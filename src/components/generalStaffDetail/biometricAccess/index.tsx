import { useOutletContext, useParams } from 'react-router-dom';
import BiometricAccessSection from '../../biometricAccessSection';
import { GeneralStaffDetailAddBiometricAccessRoute } from '../../../routes/routepath';

const GeneralStaffBiometricAccess = () => {
  const { id } = useParams<{ id: string }>();
  const { staff } = useOutletContext<{ staff: any }>() || {};
  const userId = staff?.user?._id || id;

  return (
    <BiometricAccessSection
      userId={userId}
      addPath={`/general-staff-detail/${id}${GeneralStaffDetailAddBiometricAccessRoute}`}
    />
  );
};

export default GeneralStaffBiometricAccess;
