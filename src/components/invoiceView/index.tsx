import { Fragment } from "react";
import { logo, whiteLogo } from "../../assets";
import { useTheme } from "../../context/ThemeContext";
import "./styles.scss";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface Payment {
  modeOfPayment?: string;
  amount?: number;
}

interface InvoiceItem {
  sno: number;
  description: string;
  sacCode: string;
  planPrice: number;
  startDate: string;
  expiryDate: string;
  type?: string;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  modeOfPayment?: string;
  amountPaid: number;
  payments?: Payment[];
  previousInvoiceAmount?: number;
  company: {
    name: string;
    address: string;
    city: string;
    phone: string;
    gstNo: string;
    state: string;
    pos: string;
  };
  customer: {
    name: string;
    address: string;
    phone: string;
    gstNumber?: string | null;
    registeredCompanyName?: string | null;
  };
  items: InvoiceItem[];
  totalOrderValue: number;
  discount: number;
  subTotal: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  gst: string;
  totalAmount?: number;
  dueAmount: number;
}

interface ApiInvoiceData {
  invoiceNumber?: string;
  invoiceDate?: string;
  paymentType?: string;
  paymentDetails?: Payment[];
  collectedAmount?: number;
  planPrice?: number;
  discountAmount?: number;
  afterDiscount?: number;
  previouslyPaid?: number;
  dueAmount?: number;
  gstPercentage?: number;
  gstNumber?: string;
  registeredCompanyName?: string;
  customerName?: string;
  customerNumber?: string;
  serviceType?: string;
  branchId?: {
    companyName?: string;
    companyAddress?: string;
    address?: string;
    stateName?: string;
    placeOfSupply?: string;
    phoneNumber?: string;
    gstNumber?: string;
  };
  userId?: { name?: string; phoneNumber?: string };
  memberDetails?: { address?: string; stateName?: string };
  planId?: { name?: string; type?: string; hsn_sac?: string };
  userMemberships?: { hsn_sac?: string }[];
  startDate?: string;
  expiryDate?: string;
  gstBreakdown?: {
    totalAmount?: number;
    taxableAmount?: number;
    cgstAmount?: number;
    sgstAmount?: number;
    cgstPercentage?: number;
    sgstPercentage?: number;
  };
}

interface InvoiceViewProps {
  invoiceData?: ApiInvoiceData;
  showActions?: boolean;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Cash', card: 'Card', upi: 'UPI',
  netbanking: 'Net Banking', banktransfer: 'Bank Transfer',
  cheque: 'Cheque', creditnote: 'Credit Note',
};

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-GB') : 'N/A';

const defaultData: InvoiceData = {
  invoiceNumber: 'SL/25-26/0845',
  invoiceDate:   '24-02-2026',
  modeOfPayment: 'Cash',
  amountPaid:    8500,
  company: {
    name:    'BELLATOR MEDIA PRIVATE LIMITED',
    address: 'B-711, Sushant Lok Phase I, Sector 43,',
    city:    'Gurugram, Haryana 122002,haryana',
    phone:   '8871037103',
    gstNo:   '06AAJCB0612R1ZJ',
    state:   '06',
    pos:     'Haryana',
  },
  customer: { name: 'Bakhtiyor Muminov', address: 'Forties Hospital, Delhi', phone: '9687382129' },
  items: [{ sno: 1, description: 'Monthly', sacCode: '999723', planPrice: 10000, startDate: '24-02-2026', expiryDate: '25-03-2026' }],
  totalOrderValue: 10000,
  discount:        1500,
  subTotal:        8500,
  taxableValue:    8095.24,
  cgst:            202.38,
  sgst:            202.38,
  gst:             '5%',
  totalAmount:     8500,
  dueAmount:       0,
};

const transformApiData = (api: ApiInvoiceData): InvoiceData => ({
  totalAmount:     api.gstBreakdown?.totalAmount || 0,
  invoiceNumber:   api.invoiceNumber || 'N/A',
  invoiceDate:     fmtDate(api.invoiceDate),
  payments:        api.paymentDetails || [],
  modeOfPayment:   api.paymentDetails?.[0]?.modeOfPayment ||
                   (api.paymentType === 'fullPayment' ? 'Full Payment' : 'Partial Payment'),
  amountPaid:      api.collectedAmount || 0,
  company: {
    name:    api.branchId?.companyName  || 'BELLATOR MEDIA PRIVATE LIMITED',
    address: api.branchId?.companyAddress || api.branchId?.address || 'B-711, Sushant Lok Phase I, Sector 43,',
    city:    `${api.branchId?.stateName || 'Haryana'}, ${api.branchId?.placeOfSupply || 'India'}`,
    phone:   api.branchId?.phoneNumber  || '8871037103',
    gstNo:   api.branchId?.gstNumber    || '06AAJCB0612R1ZJ',
    state:   api.branchId?.stateName    || '06',
    pos:     api.branchId?.placeOfSupply || 'Haryana',
  },
  customer: {
    name:                  api.userId?.name || api.customerName || 'N/A',
    address:               api.memberDetails?.address || 'N/A',
    phone:                 api.userId?.phoneNumber || api.customerNumber || 'N/A',
    gstNumber:             api.gstNumber || null,
    registeredCompanyName: api.registeredCompanyName || null,
  },
  items: [{
    type: api.planId?.type === 'addon' && api.serviceType
      ? api.serviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      : api.planId?.type || 'N/A',
    sno:         1,
    description: api.planId?.name || 'N/A',
    sacCode:     api.planId?.hsn_sac || api.userMemberships?.[0]?.hsn_sac || '999723',
    planPrice:   api.planPrice || 0,
    startDate:   fmtDate(api.startDate),
    expiryDate:  fmtDate(api.expiryDate),
  }],
  totalOrderValue:      api.planPrice        || 0,
  discount:             api.discountAmount   || 0,
  subTotal:             api.afterDiscount    || 0,
  previousInvoiceAmount: api.previouslyPaid  || 0,
  taxableValue:         api.gstBreakdown?.taxableAmount ?? api.afterDiscount ?? 0,
  cgst:                 api.gstBreakdown?.cgstAmount    ?? 0,
  sgst:                 api.gstBreakdown?.sgstAmount    ?? 0,
  gst: api.gstBreakdown
    ? `${(api.gstBreakdown.cgstPercentage ?? 0) + (api.gstBreakdown.sgstPercentage ?? 0)}%`
    : `${api.gstPercentage ?? 0}%`,
  dueAmount: api.dueAmount || 0,
});

/* ─── Component ──────────────────────────────────────────────────────── */

const InvoiceView = ({ invoiceData }: InvoiceViewProps) => {
  const { theme } = useTheme();
  const logoToUse = theme === 'dark' ? whiteLogo : logo;
  const data: InvoiceData = invoiceData ? transformApiData(invoiceData) : defaultData;

  return (
    <div className="invoice-view-wrapper">
      <div className="invoice-view-container">

        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-header-left">
            <div className="company-logo">
              <img src={logoToUse} alt="FitClub Logo" style={{ height: '40px' }} />
            </div>
          </div>
          <div className="invoice-header-right">
            <h2 className="invoice-number">{data.invoiceNumber}</h2>
          </div>
        </div>

        {/* Company & Customer */}
        <div className="invoice-info-section">
          <div className="invoice-from">
            <h3>Invoice From</h3>
            <p className="company-name">{data.company.name}</p>
            <p>{data.company.address}</p>
            <p>{data.company.city}</p>
            <p>Phone: {data.company.phone}</p>
            <p>GST No. - {data.company.gstNo}</p>
            <p><strong>State</strong> - {data.company.state}</p>
            <p>POS - {data.company.pos}</p>
          </div>
          <div className="invoice-to">
            <h3>Invoice To</h3>
            {data.customer.registeredCompanyName && (
              <p className="company-name">{data.customer.registeredCompanyName}</p>
            )}
            {data.customer.gstNumber && <p>GST No. - {data.customer.gstNumber}</p>}
            <p className="customer-name">{data.customer.name}</p>
            <p>{data.customer.address}</p>
            <p>Phone: {data.customer.phone}</p>
            {invoiceData?.memberDetails && (
              <p>State: {invoiceData.memberDetails.stateName
                ? invoiceData.memberDetails.stateName.charAt(0).toUpperCase() + invoiceData.memberDetails.stateName.slice(1)
                : 'N/A'}
              </p>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="invoice-payment-info">
          <table className="payment-info-table">
            <thead>
              <tr>
                <th>Invoice Date</th>
                <th>Mode Of Payment</th>
                {data.payments?.map((p, i) => (
                  <th key={i}>{PAYMENT_LABELS[p.modeOfPayment ?? ''] ?? p.modeOfPayment}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{data.invoiceDate}</td>
                <td></td>
                {data.payments?.map((p, i) => (
                  <td key={i}>₹ {p.amount}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Items */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>SAC/HSN Code</th>
              <th>Plan Price</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <Fragment key={index}>
                <tr>
                  <td>{item.sno}</td>
                  <td>{item.description}{item.type ? ` (${item.type})` : ''}</td>
                  <td>{item.sacCode}</td>
                  <td>₹ {item.planPrice}</td>
                </tr>
                <tr className="date-row">
                  <td colSpan={4}>
                    <div className="date-info">
                      <span>Start date : {item.startDate}</span>
                      <span>Expiry date : {item.expiryDate}</span>
                    </div>
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="invoice-totals-section">
          <div className="totals-left" />
          <div className="totals-right">
            <div className="total-row">
              <span className="total-label">Total Order Value</span>
              <span className="total-value">₹ {data.totalOrderValue}</span>
            </div>
            <div className="total-row discount-row">
              <span className="total-label">Discount</span>
              <span className="total-value discount">- ₹ {data.discount}</span>
            </div>
            {(data.previousInvoiceAmount ?? 0) > 0 && (
              <div className="total-row previous-invoice-row">
                <span className="total-label">Previous Invoice Amount</span>
                <span className="total-value previous-amount">- ₹{data.previousInvoiceAmount!.toLocaleString()}</span>
              </div>
            )}
            {data.cgst > 0 && (
              <div className="total-row">
                <span className="total-label">Taxable Value</span>
                <span className="total-value">₹{typeof data.taxableValue === 'number' ? data.taxableValue.toLocaleString() : data.taxableValue}</span>
              </div>
            )}
            {data.cgst > 0 && (
              <div className="total-row">
                <span className="total-label">CGST</span>
                <span className="total-value">₹{typeof data.cgst === 'number' ? data.cgst.toLocaleString() : data.cgst}</span>
              </div>
            )}
            {data.sgst > 0 && (
              <div className="total-row">
                <span className="total-label">SGST</span>
                <span className="total-value">₹{typeof data.sgst === 'number' ? data.sgst.toLocaleString() : data.sgst}</span>
              </div>
            )}
            {data.cgst > 0 && (
              <div className="total-row">
                <span className="total-label">GST</span>
                <span className="total-value">{data.gst}</span>
              </div>
            )}
            <div className="total-row final-total">
              <span className="total-label">Total Amount</span>
              <span className="total-value">₹{data.amountPaid.toFixed(2)}</span>
            </div>
            {data.dueAmount > 0 && (
              <div className="total-row due-amount">
                <span className="total-label">Due Amount</span>
                <span className="total-value">₹{data.dueAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <p className="registered-office">
            <strong>Registered Office:</strong> SECOND FLOOR, THIRD FLOOR AND TERRACE OF THE PLOT NO. B-711, SUSHANT LOK PHASE-1, Gurugram, Haryana, 122002
          </p>
          <p className="jurisdiction">SUBJECT TO HARYANA JURISDICTION</p>
        </div>

      </div>
    </div>
  );
};

export default InvoiceView;
