import { useParams } from "react-router-dom";
import { RightOutlined, PrinterOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import FitclubRegistration from "../../components/fitclubRegistration";
import { useUserDetailDataQuery } from "../../services/user";
import "./styles.scss";

interface Member {
  photo?:                  string;
  countryCode?:            string;
  age?:                    string | number;
  dob?:                    string;
  gender?:                 string;
  idType?:                 string;
  idNumber?:               string;
  alternativePhoneNumber?: string;
  address?:                string;
  height?:                 string | number;
  weight?:                 string | number;
}

interface UserData {
  name?:        string;
  email?:       string;
  phoneNumber?: string;
  status?:      string;
  member?:      Member;
}

const ViewForm = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useUserDetailDataQuery(id as string);
  const userData: UserData = (data as any)?.user || {};
  const member: Member = userData?.member || {};

  // Print the actual rendered form. A global @media print rule (in styles.scss)
  // hides the whole app and shows only .fitclub-registration-form, so we print
  // the real DOM with its real styles — no style-copying/cloning issues.
  // "Save as PDF" in the dialog acts as Download; document.title names the file.
  const handlePrint = () => {
    const prevTitle = document.title;
    document.title = `Membership Form - ${userData?.name || 'User'}`;
    window.print();
    setTimeout(() => { document.title = prevTitle; }, 500);
  };

  return (
      <div className="view-form-page">
     
<div className="page-header">
  <h1>{userData?.name || 'User'}</h1>
  <div className="header-actions">
    <Button type="text" icon={<PrinterOutlined />} className="action-btn" onClick={handlePrint}>
      Print
    </Button>
    <Button type="text" icon={<DownloadOutlined />} className="action-btn" onClick={handlePrint}>
      Download
    </Button>
  </div>
</div>
<ul className="breadcrumb-list">
   <li style={{color:"gray"}}>
     Dashboard
    </li>
    <li style={{color:"gray"}}>
<RightOutlined style={{fontSize:"8px"}}/> All User
    </li>
    <li>
<RightOutlined style={{fontSize:"8px"}} /> {userData?.name || 'User'}
    </li>
</ul>
      <div className="form-container">
        <FitclubRegistration userData={userData} member={member} />
      </div>
    </div>
  );
};

export default ViewForm;