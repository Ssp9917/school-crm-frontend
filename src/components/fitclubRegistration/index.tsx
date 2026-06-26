import { logo } from "../../assets";
import "./styles.scss";

interface Branch {
  address?: string;
}

interface EmergencyContact {
  name?: string;
  phoneNumber?: string;
}

interface HealthInfo {
  emergencyContact?: EmergencyContact;
}

interface Member {
  memberId?: string;
  photo?: string;
  address?: string;
  age?: string | number;
  dob?: string;
  gender?: string;
  medicalHistory?: string;
  height?: string | number;
  weight?: string | number;
  maritalStatus?: string;
  anniversaryDate?: string;
  alternativePhoneNumber?: string;
  companyName?: string;
  work?: string;
  stateName?: string;
  idType?: string;
  idNumber?: string;
  healthInfo?: HealthInfo;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  hearAbout?: string;
}

interface CurrentMembership {
  planName?: string;
  pricing?: string | number;
  startDate?: string;
  expiryDate?: string;
}

interface UserData {
  name?: string;
  phoneNumber?: string;
  email?: string;
  currentMembership?: CurrentMembership;
  branchIds?: Branch[];
}

interface FitclubRegistrationProps {
  userData?: UserData;
  member?: Member;
}

const Line = ({ width }: { width: string | number }) => (
  <span className="line" style={{ width }} />
);

const FitclubRegistration = ({ userData = {}, member = {} }: FitclubRegistrationProps) => {
  const currentMembership = userData?.currentMembership || {};
  const branchAddress =
    userData?.branchIds?.[0]?.address ||
    'B-711, Sushant Lok Phase I, Sector 43, Gurugram, Haryana 122002';

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className="fitclub-registration-form">
      <div className="header">
        <div>
          <h1 className="logo">
            <img src={logo} alt="FitClub Logo" />
          </h1>
        </div>
        <div className="header-content">
          <p>
            Address - {branchAddress}<br />
            Mobile No. 887101 7101 | 887103 7103<br />
            Email - info@fitclub.co.in<br />
            Website - www.fitclub.in
          </p>
          <div className="header-right">
            <div className="box">{member?.memberId}</div>
            <div className="photo-box">
              {member?.photo ? (
                <img src={member.photo} alt="Member Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                'Photo'
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="form-field">
        <div className="name-label">
          <div className="label">Member's Name</div>
          <div className="value">{userData?.name || '-'}</div>
        </div>
        <div className="name-label">
          <div className="label">Member's Address</div>
          <div className="value">{member?.address || '-'}</div>
        </div>
        <div className="age-gender-row">
          <div className="age">
            <div className="label">Age</div>
            <div className="value">{member?.age || '-'}</div>
          </div>
          <div className="birth">
            <div className="label">Date of Birth</div>
            <div className="value">{formatDate(member?.dob)}</div>
          </div>
          <div className="gender">
            <div className="label">Gender</div>
            <div className="value">{member?.gender || '-'}</div>
          </div>
        </div>
        <div className="name-label">
          <div className="label">Medical History</div>
          <div className="value">{member?.medicalHistory || '-'}</div>
        </div>
        <div className="marital-status-row">
          <div className="marital-status">
            <div className="label">Height (cm)</div>
            <div className="value">{member?.height || '-'}</div>
          </div>
          <div className="marriage-anniversary">
            <div className="label">Weight (kg)</div>
            <div className="value">{member?.weight || '-'}</div>
          </div>
        </div>
        <div className="marital-status-row">
          <div className="marital-status">
            <div className="label">Marital Status</div>
            <div className="value">{member?.maritalStatus || '-'}</div>
          </div>
          <div className="marriage-anniversary">
            <div className="label">Marriage Anniversary</div>
            <div className="value">{formatDate(member?.anniversaryDate)}</div>
          </div>
        </div>
        <div className="marital-status-row">
          <div className="marital-status">
            <div className="label">Mobile No.</div>
            <div className="value">{userData?.phoneNumber || '-'}</div>
          </div>
          <div className="marriage-anniversary">
            <div className="label alter-no">Alternate No.</div>
            <div className="value alter-no-value">{member?.alternativePhoneNumber || '-'}</div>
          </div>
        </div>
        <div className="name-label">
          <div className="label compnay-name-label">Place of Work/Company Name</div>
          <div className="value">{member?.companyName || '-'}</div>
        </div>
        <div className="name-label">
          <div className="label">Designation</div>
          <div className="value">{member?.work || '-'}</div>
        </div>
        <div className="name-label">
          <div className="label">Email ID</div>
          <div className="value">{userData?.email || '-'}</div>
        </div>
        <div className="name-label">
          <div className="label">State</div>
          <div className="value">{member?.stateName || '-'}</div>
        </div>
        <div className="marital-status-row">
          <div className="marital-status">
            <div className="label">ID Type</div>
            <div className="value">{member?.idType || '-'}</div>
          </div>
          <div className="marriage-anniversary">
            <div className="label alter-no">ID Number</div>
            <div className="value alter-no-value">{member?.idNumber || '-'}</div>
          </div>
        </div>
        <div className="name-label">
          <div className="label compnay-name-label">In Case of Emergency Call: Name</div>
          <div className="value">
            {member?.healthInfo?.emergencyContact?.name || member?.emergencyContactName || '-'}
          </div>
        </div>
        <div className="name-label">
          <div className="label">Mobile No.</div>
          <div className="value">
            {member?.healthInfo?.emergencyContact?.phoneNumber || member?.emergencyContactNumber || '-'}
          </div>
        </div>
        <div className="name-label">
          <div className="label compnay-name-label">How did you hear about Fitclub</div>
          <div className="value">{member?.hearAbout || '-'}</div>
        </div>
        <div className="marital-status-row">
          <div className="marital-status">
            <div className="label package-label">Membership Package</div>
            <div className="value">{currentMembership?.planName || '-'}</div>
          </div>
          <div className="marriage-anniversary">
            <div className="label package-amount-label">Amount</div>
            <div className="value package-amount-value">₹ {currentMembership?.pricing || '-'}</div>
          </div>
        </div>
        <div className="marital-status-row">
          <div className="marital-status">
            <div className="label">Start Date</div>
            <div className="value">{formatDate(currentMembership?.startDate)}</div>
          </div>
          <div className="marriage-anniversary">
            <div className="label alter-no">Expiry Date</div>
            <div className="value alter-no-value">{formatDate(currentMembership?.expiryDate)}</div>
          </div>
        </div>
      </div>

      <div className="footer">
        <h3>Waiver</h3>
        <p>
          I Accept responsibility for my use of any and all apparatus, appliances, facility, Privilege or service
          whatsoever, owned and operated at this club at my own rise, and shall hold this club, its shareholders,
          directors, officers employers representatives and agent harmless from any and all loss, claim, Injury,
          damage, or liability sustained or incurred by me resulting therefrom.
        </p>
        <div className="marital-status-row" style={{ marginTop: '14px' }}>
          <div className="marital-status">
            <div className="label authorize-label">Authorized By</div>
            <div className="value authorize-value" />
          </div>
          <div className="marriage-anniversary">
            <div className="label member-s-label">Member Signature</div>
            <div className="value member-s-value" />
          </div>
        </div>
        <div className="marital-status-row" style={{ marginTop: '14px' }}>
          <div className="marital-status">
            <div className="label fitness-label">Fitness Consultant</div>
            <div className="value fitness-value" />
          </div>
          <div className="marriage-anniversary">
            <div className="label fitness-s-label">Date of Contact</div>
            <div className="value fitness-s-value" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitclubRegistration;
