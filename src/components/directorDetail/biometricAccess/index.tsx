import { useOutletContext, useParams } from 'react-router-dom';
import BiometricAccessSection from '../../biometricAccessSection';

const DirectorDetailBiometricAccess = () => {
  const { id } = useParams<{ id: string }>();
  const { userInfo } = useOutletContext<{ userInfo: any }>() || {};
  const userId = userInfo?._id || id;

  return <BiometricAccessSection userId={userId} />;
};

export default DirectorDetailBiometricAccess;
