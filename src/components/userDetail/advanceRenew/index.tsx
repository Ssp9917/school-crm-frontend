import { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Card, InputNumber, Input, notification } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useGetPlansQuery } from '../../../services/package';
import { useUserDetailDataQuery } from '../../../services/user';
import { useGetBranchesQuery } from '../../../services/branches';
import { useGetAllCouponQuery } from '../../../services/coupons';
import { useGetEmployeeByCustomerQuery } from '../../../services/employee';
import { useAddInvoiceMutation } from '../../../services/invoice';
import ImagePicker from '../../../components/form/ImagePicker';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface UserData {
  _id?: string;
}

interface UserOutletContext {
  userData?: UserData;
}

interface Package {
  _id: string;
  name?: string;
  pricing?: number;
  numberOfDays?: number;
  type?: string;
  description?: string;
  items?: { name?: string; quantity?: number }[];
}

interface Coupon {
  _id?: string;
  code?: string;
  discountType?: string;
  value?: number;
}

interface Employee {
  _id?: string;
  name?: string;
  employeeId?: string;
}

interface PaymentMode {
  id: number;
  mode: string;
  amount: number | string | null;
}

/* ─── Module-level helpers ───────────────────────────────────────────── */

const numFmt = (v: number | string | undefined) =>
  `₹ ${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const numParse = (v: string | undefined) =>
  v ? v.replace(/₹\s?|(,*)/g, '') : '';

const paymentModeOptions = [
  { value: 'cash',         label: 'Cash'          },
  { value: 'card',         label: 'Card'          },
  { value: 'upi',          label: 'UPI'           },
  { value: 'banktransfer', label: 'Bank Transfer' },
  { value: 'cheque',       label: 'Cheque'        },
  { value: 'creditnote',   label: 'Credit Note'   },
];

const gstClaimOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no',  label: 'No'  },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const AdvanceRenew = () => {
  const { userData } = useOutletContext<UserOutletContext>();
  const navigate    = useNavigate();
  const { id }      = useParams<{ id: string }>();

  const { refetch: refetchUserData } = useUserDetailDataQuery(id);
  const [form] = Form.useForm();

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [loading, setLoading]                 = useState(false);
  const [gstClaim, setGstClaim]               = useState(false);
  const gstPercentage                         = 5;
  const [selectedCoupon, setSelectedCoupon]   = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount]   = useState(0);
  const [paymentModes, setPaymentModes]       = useState<PaymentMode[]>([{ id: 1, mode: '', amount: '' }]);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [paymentType, setPaymentType]         = useState('');

  const { data: packagesData,  isLoading: plansLoading }     = useGetPlansQuery(undefined);
  const { data: branchesData }                               = useGetBranchesQuery(undefined);
  const { data: couponsData,   isLoading: couponsLoading }   = useGetAllCouponQuery({});
  const { data: employeesData, isLoading: employeesLoading } = useGetEmployeeByCustomerQuery(
    userData?._id,
    { skip: !userData?._id }
  );
  const [addInvoice, { isLoading: addingInvoice }] = useAddInvoiceMutation();

  const packages: Package[] = (packagesData as any)?.data ?? [];
  const coupons:  Coupon[]  = (couponsData  as any)?.data ?? [];

  /* ─── Calculations ─────────────────────────────────────────────────── */

  const calculateTotals = (basePrice: number, coupon: Coupon | null) => {
    let discountAmt = 0;
    if (coupon) {
      discountAmt = coupon.discountType === 'percentage'
        ? (basePrice * (coupon.value ?? 0)) / 100
        : (coupon.value ?? 0);
    }
    const priceAfterDiscount = Math.max(0, basePrice - discountAmt);
    setDiscountAmount(discountAmt);
    form.setFieldsValue({ afterDiscount: priceAfterDiscount, totalOrderValue: priceAfterDiscount });
  };

  const calculatePaymentAmounts = () => {
    const fv = form.getFieldsValue();
    let total = 0;
    paymentModes.forEach(p => { total += Number(fv[`paymentAmount_${p.id}`] || 0); });
    setTotalPaidAmount(total);
    if (selectedPackage) {
      const afterDiscountAmount = (selectedPackage.pricing ?? 0) - discountAmount;
      setRemainingAmount(Math.max(0, afterDiscountAmount - total));
    }
  };

  /* ─── Handlers ─────────────────────────────────────────────────────── */

  const handlePackageChange = (packageId: string) => {
    const pkg = packages.find(p => p._id === packageId) ?? null;
    setSelectedPackage(pkg);
    if (pkg) {
      calculateTotals(pkg.pricing ?? 0, selectedCoupon);
      form.setFieldsValue({ planPrice: pkg.pricing });
      const startDate = form.getFieldValue('startDate');
      if (startDate) {
        const end = dayjs(startDate).add((pkg.numberOfDays ?? 365) - 1, 'days').endOf('day');
        form.setFieldsValue({ endDate: end });
      }
    }
  };

  const handlePaymentModeChange = (mode: string, paymentId: number) => {
    setPaymentModes(prev => prev.map(p => p.id === paymentId ? { ...p, mode } : p));
    if (mode === 'cash') {
      try {
        const u = JSON.parse(localStorage.getItem('user') ?? '{}') || {};
        if (u.name) form.setFieldsValue({ [`cashEmployee_${paymentId}`]: u.name });
      } catch {}
    }
  };

  const handlePaymentAmountChange = (amount: number | string | null, paymentId: number) => {
    setPaymentModes(prev => prev.map(p => p.id === paymentId ? { ...p, amount } : p));
    setTimeout(() => {
      calculatePaymentAmounts();
      paymentModes.forEach(pm => {
        form.validateFields([`paymentAmount_${pm.id}`]).catch(() => {});
      });
    }, 100);
  };

  const addPaymentMode = () => {
    const newId = Math.max(...paymentModes.map(p => p.id)) + 1;
    setPaymentModes(prev => [...prev, { id: newId, mode: '', amount: '' }]);
  };

  const removePaymentMode = (paymentId: number) => {
    if (paymentModes.length <= 1) return;
    form.setFieldsValue({
      [`paymentMode_${paymentId}`]:       undefined,
      [`paymentAmount_${paymentId}`]:     undefined,
      [`cashEmployee_${paymentId}`]:      undefined,
      [`upiScreenshot_${paymentId}`]:     undefined,
      [`upiReferenceId_${paymentId}`]:    undefined,
      [`cardScreenshot_${paymentId}`]:    undefined,
      [`chequeNumber_${paymentId}`]:      undefined,
      [`receipt_${paymentId}`]:           undefined,
      [`transferScreenshot_${paymentId}`]:undefined,
      [`creditNoteUpload_${paymentId}`]:  undefined,
    });
    setPaymentModes(prev => prev.filter(p => p.id !== paymentId));
    setTimeout(() => {
      calculatePaymentAmounts();
      paymentModes.filter(pm => pm.id !== paymentId).forEach(pm => {
        form.validateFields([`paymentAmount_${pm.id}`]).catch(() => {});
      });
    }, 100);
  };

  const handleStartDateChange = (date: dayjs.Dayjs | null) => {
    if (date && selectedPackage) {
      const end = dayjs(date).add((selectedPackage.numberOfDays ?? 365) - 1, 'days').endOf('day');
      form.setFieldsValue({ endDate: end });
    }
  };

  const handleCouponChange = (couponId: string) => {
    const coupon = coupons.find(c => c._id === couponId) ?? null;
    setSelectedCoupon(coupon);
    if (selectedPackage) calculateTotals(selectedPackage.pricing ?? 0, coupon);
  };

  const handleGstClaimChange = (value: string) => {
    const isGst = value === 'yes';
    setGstClaim(isGst);
    if (selectedPackage) calculateTotals(selectedPackage.pricing ?? 0, selectedCoupon);
  };

  useEffect(() => { calculatePaymentAmounts(); }, [selectedPackage, discountAmount, gstClaim, paymentModes.length]);

  /* ─── Form submit ──────────────────────────────────────────────────── */

  const onFinishFailed = ({ errorFields }: { errorFields: { name: (string | number)[]; errors: string[] }[] }) => {
    if (!errorFields?.length) return;
    const labels = errorFields.map(f => {
      const name = Array.isArray(f.name) ? f.name[0] : f.name;
      return String(name).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    });
    notification.error({
      message:     'Required Fields Missing',
      description: [...new Set(labels)].join(', '),
      placement:   'topRight',
      duration:    4,
    });
  };

  const onFinish = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      const startDate   = values.startDate ? dayjs(values.startDate as dayjs.Dayjs).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
      const expiryDate  = values.endDate
        ? dayjs(values.endDate as dayjs.Dayjs).format('YYYY-MM-DD')
        : selectedPackage?.numberOfDays
          ? dayjs(startDate).add(selectedPackage.numberOfDays - 1, 'days').format('YYYY-MM-DD')
          : dayjs(startDate).add(365, 'days').format('YYYY-MM-DD');
      const paymentDate = values.paymentDate ? dayjs(values.paymentDate as dayjs.Dayjs).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');

      const planPrice          = selectedPackage?.pricing ?? 0;
      const afterDiscountAmount = planPrice - discountAmount;
      const baseAmount         = totalPaidAmount / 1.05;
      const gstOnPaidAmount    = totalPaidAmount - baseAmount;

      const paymentTerms: object[] = [];
      paymentModes.forEach(payment => {
        const mode   = form.getFieldValue(`paymentMode_${payment.id}`) as string;
        const amount = form.getFieldValue(`paymentAmount_${payment.id}`) || 0;
        if (!mode || amount === 0) return;

        if (mode === 'cash') {
          const cashEmployee = form.getFieldValue(`cashEmployee_${payment.id}`);
          if (cashEmployee) paymentTerms.push({ modeOfPayment: 'cash', amount, receivedBy: cashEmployee, receipt: [] });
        } else if (mode === 'upi') {
          const upiScreenshot  = form.getFieldValue(`upiScreenshot_${payment.id}`);
          const upiReferenceId = form.getFieldValue(`upiReferenceId_${payment.id}`);
          if (upiScreenshot) paymentTerms.push({ modeOfPayment: 'upi', amount, receipt: [upiScreenshot], referenceId: upiReferenceId || '' });
        } else if (mode === 'card') {
          const cardScreenshot = form.getFieldValue(`cardScreenshot_${payment.id}`);
          if (cardScreenshot) paymentTerms.push({ modeOfPayment: 'card', amount, receipt: [cardScreenshot] });
        } else if (mode === 'cheque') {
          const chequeNumber = form.getFieldValue(`chequeNumber_${payment.id}`);
          const receipt      = form.getFieldValue(`receipt_${payment.id}`);
          paymentTerms.push({ modeOfPayment: 'cheque', amount, chequeNumber, receipt: receipt ? [receipt] : [] });
        } else if (mode === 'banktransfer') {
          const transferScreenshot = form.getFieldValue(`transferScreenshot_${payment.id}`);
          paymentTerms.push({ modeOfPayment: 'banktransfer', amount, receipt: transferScreenshot ? [transferScreenshot] : [] });
        } else if (mode === 'creditnote') {
          const creditNoteUpload = form.getFieldValue(`creditNoteUpload_${payment.id}`);
          paymentTerms.push({ modeOfPayment: 'creditnote', amount, receipt: creditNoteUpload ? [creditNoteUpload] : [] });
        }
      });

      await (addInvoice as any)({
        userId:                  userData?._id,
        planId:                  selectedPackage?._id,
        startDate,
        expiryDate,
        planPrice,
        couponId:                selectedCoupon?._id ?? null,
        discountAmount,
        afterDiscount:           afterDiscountAmount,
        gstClaim,
        gstPercentage,
        gstAmount:               gstOnPaidAmount,
        gstNumber:               values.gstNumber ?? null,
        registeredCompanyName:   values.registeredCompanyName ?? null,
        totalInvoiceAmount:      totalPaidAmount,
        dueAmount:               paymentType === 'partial' ? remainingAmount : 0,
        paymentType:             values.paymentType || 'full',
        paymentDate,
        paymentTerm:             paymentTerms,
        invoiceType:             'renew',
        coachId:                 null,
        lockerNumber:            values.lockerNumber ?? null,
        salesPersonId:           values.salesPerson,
        details:                 selectedPackage?.items?.map(item => ({
          itemName: item.name,
          quantity: item.quantity ?? 1,
          planId:   selectedPackage._id,
        })) ?? [],
      }).unwrap();

      form.resetFields();
      setSelectedPackage(null);
      setSelectedCoupon(null);
      setGstClaim(false);
      setDiscountAmount(0);
      await refetchUserData();
      navigate(`/user-detail/${id}/membership`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Derived option arrays ──────────────────────────────────────────── */

  const employees: Employee[] = (employeesData as any)?.data ?? [];

  const salesPersonOptions = employees.length > 0
    ? employees.map(emp => ({
        label: `${emp.name || 'Unknown'} - ${emp.employeeId || 'No ID'}`,
        value: emp._id,
      }))
    : [{ label: 'No sales persons available', value: '', disabled: true }];

  const planOptions = packages
    .filter(pkg => pkg.type === 'membership' || pkg.type === 'trial')
    .map(pkg => ({
      label: `${pkg.name} - ₹${pkg.pricing} - ${pkg.numberOfDays} days`,
      value: pkg._id,
    }));

  const paymentTypeOptions = [
    { value: 'fullPayment', label: 'Full Payment' },
    ...(selectedPackage && (selectedPackage.numberOfDays ?? 0) > 90
      ? [{ value: 'partial', label: 'Partial Payment' }]
      : []),
  ];

  const couponOptions = coupons.map(c => ({
    label: `${c.code} - ${c.discountType === 'percentage' ? `${c.value}%` : `₹${c.value}`} off`,
    value: c._id,
  }));

  /* ─── Render ────────────────────────────────────────────────────────── */

  return (
    <div className="buy-plan-container">
      <div className="form-header">
        <h2>Advance Renew Membership</h2>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed} className="custom-form">
        <div className="row">
          <Form.Item name="invoiceDate" label="Invoice Date" initialValue={dayjs()}>
            <DatePicker style={{ width: '100%', height: '46px' }} disabled placeholder="Invoice date" format="DD-MM-YYYY" />
          </Form.Item>

          <Form.Item name="paymentDate" label="Payment Date" rules={[{ required: true, message: 'Please select payment date' }]}>
            <DatePicker style={{ width: '100%', height: '46px' }} placeholder="Select payment date" format="DD-MM-YYYY" />
          </Form.Item>

          <Form.Item name="salesPerson" label="Sales Person" rules={[{ required: true, message: 'Please select a sales person' }]}>
            <Select
              placeholder="Choose sales person"
              loading={employeesLoading}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={salesPersonOptions as any}
            />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="planSelect" label="Plan Select" rules={[{ required: true, message: 'Please select a plan' }]}>
            <Select
              placeholder="Choose plan"
              loading={plansLoading}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={planOptions}
              onChange={(v: string) => handlePackageChange(v)}
            />
          </Form.Item>

          <Form.Item name="paymentType" label="Payment Type" rules={[{ required: true, message: 'Please select payment type' }]}>
            <Select
              placeholder="Select payment type"
              options={paymentTypeOptions}
              onChange={(v: string) => setPaymentType(v)}
            />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="planPrice" label="Plan Price">
            <InputNumber
              style={{ width: '100%' }}
              formatter={numFmt as any}
              parser={numParse as any}
              disabled
              placeholder="Auto-filled from plan"
            />
          </Form.Item>

          <Form.Item name="couponSelect" label="Coupon Select">
            <Select
              placeholder="Choose coupon (optional)"
              loading={couponsLoading}
              allowClear
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={couponOptions}
              onChange={(v: string | undefined) => {
                if (v) handleCouponChange(v);
                else { setSelectedCoupon(null); if (selectedPackage) calculateTotals(selectedPackage.pricing ?? 0, null); }
              }}
            />
          </Form.Item>
        </div>

        {selectedPackage && (
          <div className="row">
            <Form.Item name="afterDiscount" label="After Discount">
              <InputNumber
                style={{ width: '100%' }}
                formatter={numFmt as any}
                parser={numParse as any}
                disabled
                placeholder="Price after coupon discount"
              />
            </Form.Item>

            <Form.Item name="gstClaim" label="GST Claim" rules={[{ required: true, message: 'Please select GST claim option' }]}>
              <Select
                placeholder="Select GST claim"
                options={gstClaimOptions}
                onChange={(v: string) => handleGstClaimChange(v)}
              />
            </Form.Item>
          </div>
        )}

        {gstClaim && (
          <div className="row">
            <Form.Item
              name="gstNumber"
              label="GST Number"
              rules={[
                { required: true, message: 'Please enter GST number' },
                { pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Please enter valid GST number' },
              ]}
            >
              <Input placeholder="Enter GST number" />
            </Form.Item>

            <Form.Item
              name="registeredCompanyName"
              label="Registered Company Name"
              rules={[
                { required: true, message: 'Please enter registered company name' },
                { min: 2, message: 'Company name must be at least 2 characters' },
              ]}
            >
              <Input placeholder="Enter registered company name" />
            </Form.Item>
          </div>
        )}

        {/* Payment Modes */}
        <div className="payment-modes-section">
          <h3 style={{ marginBottom: '16px', color: 'var(--sider-text)' }}>Payment Details</h3>
          {paymentModes.map((payment, index) => (
            <div key={payment.id} className="payment-group">
              <div className="row payment-row">
                <Form.Item
                  name={`paymentMode_${payment.id}`}
                  label={index === 0 ? 'Mode of Payment' : 'Additional Payment Mode'}
                  rules={[{ required: true, message: 'Please select payment mode' }]}
                >
                  <Select
                    placeholder="Select payment mode"
                    options={paymentModeOptions}
                    onChange={(v: string) => handlePaymentModeChange(v, payment.id)}
                  />
                </Form.Item>

                <Form.Item
                  name={`paymentAmount_${payment.id}`}
                  label="Amount"
                  rules={[
                    { required: true, message: 'Please enter amount' },
                    {
                      validator: (_, value) => {
                        if (selectedPackage && value) {
                          const afterDiscountAmount = (selectedPackage.pricing ?? 0) - discountAmount;
                          const fv = form.getFieldsValue();
                          let calculatedTotal = 0;
                          paymentModes.forEach(pm => { calculatedTotal += Number(fv[`paymentAmount_${pm.id}`] || 0); });
                          if (calculatedTotal > afterDiscountAmount) {
                            return Promise.reject(new Error(`Amount exceeds by ₹${(calculatedTotal - afterDiscountAmount).toFixed(2)}. Maximum: ₹${afterDiscountAmount.toFixed(2)}`));
                          }
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={numFmt as any}
                    parser={numParse as any}
                    placeholder="Enter amount"
                    min={0}
                    onChange={v => handlePaymentAmountChange(v, payment.id)}
                  />
                </Form.Item>

                <div className="payment-actions">
                  {index === paymentModes.length - 1 && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={addPaymentMode} style={{ marginRight: '8px' }}>Add</Button>
                  )}
                  {paymentModes.length > 1 && (
                    <Button danger icon={<DeleteOutlined />} onClick={() => removePaymentMode(payment.id)}>Remove</Button>
                  )}
                </div>
              </div>

              {payment.mode === 'cash' && (
                <div className="row payment-details">
                  <Form.Item
                    name={`cashEmployee_${payment.id}`}
                    label="Employee (Cash Handler)"
                    rules={[{ required: true, message: 'Please enter employee name for cash payment' }]}
                    initialValue={(() => {
                      try { const u = JSON.parse(localStorage.getItem('user') ?? '{}') || {}; return u.name || ''; }
                      catch { return ''; }
                    })()}
                  >
                    <Input placeholder="Employee handling cash payment" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
              )}

              {payment.mode === 'upi' && (
                <div className="row payment-details">
                  <Form.Item name={`upiScreenshot_${payment.id}`} label="UPI Payment Screenshot" rules={[{ required: true, message: 'Please upload UPI payment screenshot' }]}>
                    <ImagePicker form={form} name={`upiScreenshot_${payment.id}`} />
                  </Form.Item>
                  <Form.Item name={`upiReferenceId_${payment.id}`} label="UPI Reference ID">
                    <Input placeholder="Enter UPI transaction reference ID (optional)" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
              )}

              {payment.mode === 'cheque' && (
                <div className="row payment-details">
                  <Form.Item name={`chequeNumber_${payment.id}`} label="Cheque Number" rules={[{ required: true, message: 'Please enter cheque number' }]}>
                    <Input placeholder="Enter cheque number" style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item name={`receipt_${payment.id}`} label="Upload Cheque Image" rules={[{ required: true, message: 'Please upload cheque image' }]}>
                    <ImagePicker form={form} name={`receipt_${payment.id}`} />
                  </Form.Item>
                </div>
              )}

              {payment.mode === 'card' && (
                <div className="row payment-details">
                  <Form.Item name={`cardScreenshot_${payment.id}`} label="Card Payment Screenshot" rules={[{ required: true, message: 'Please upload card payment screenshot' }]}>
                    <ImagePicker form={form} name={`cardScreenshot_${payment.id}`} />
                  </Form.Item>
                </div>
              )}

              {payment.mode === 'banktransfer' && (
                <div className="row payment-details">
                  <Form.Item name={`transferScreenshot_${payment.id}`} label="Upload Transfer Screenshot" rules={[{ required: true, message: 'Please upload transfer screenshot' }]}>
                    <ImagePicker form={form} name={`transferScreenshot_${payment.id}`} />
                  </Form.Item>
                </div>
              )}

              {payment.mode === 'creditnote' && (
                <div className="row payment-details">
                  <Form.Item name={`creditNoteUpload_${payment.id}`} label="Credit Note" rules={[{ required: true, message: 'Please upload credit note' }]}>
                    <ImagePicker form={form} name={`creditNoteUpload_${payment.id}`} />
                  </Form.Item>
                </div>
              )}
            </div>
          ))}

          {selectedPackage && paymentType === 'fullPayment' && (
            <div className="remaining-balance">
              <span className={`balance-text ${remainingAmount > 0 ? 'remaining' : 'complete'}`}>
                <strong>Remaining Balance: ₹{remainingAmount.toFixed(2)}</strong>
              </span>
            </div>
          )}
        </div>

        {selectedPackage && (
          <Card className="package-summary" size="small" title="Order Summary">
            <div className="summary-row">
              <span><strong>Package:</strong> {selectedPackage.name}</span>
              <span><strong>Plan Price:</strong> ₹{selectedPackage.pricing}</span>
            </div>
            {selectedCoupon && (
              <div className="summary-row">
                <span><strong>Coupon:</strong> {selectedCoupon.code}</span>
                <span><strong>Discount:</strong> -₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row">
              <span><strong>Price After Discount:</strong></span>
              <span>₹{selectedCoupon ? ((selectedPackage.pricing ?? 0) - discountAmount).toFixed(2) : selectedPackage.pricing}</span>
            </div>
            {totalPaidAmount > 0 && (
              <>
                <div className="summary-row">
                  <span><strong>Base Amount (without GST):</strong></span>
                  <span>₹{(totalPaidAmount / 1.05).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span><strong>SGST (2.5%):</strong></span>
                  <span>₹{((totalPaidAmount / 1.05) * 0.025).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span><strong>CGST (2.5%):</strong></span>
                  <span>₹{((totalPaidAmount / 1.05) * 0.025).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span><strong>Total Paid (with GST):</strong></span>
                  <span>₹{totalPaidAmount.toFixed(2)}</span>
                </div>
              </>
            )}
            {paymentType === 'fullPayment' && (
              <div className={`summary-row ${remainingAmount > 0 ? 'remaining-amount' : 'complete-amount'}`}>
                <span><strong>Remaining Balance:</strong></span>
                <span>₹{remainingAmount.toFixed(2)}</span>
              </div>
            )}
            {selectedPackage.description && (
              <div className="summary-row full-width">
                <span><strong>Description:</strong> {selectedPackage.description}</span>
              </div>
            )}
          </Card>
        )}

        {selectedPackage && (
          <div className="date-selection-section">
            <div className="row">
              <Form.Item name="startDate" label="Start Date" rules={[{ required: true, message: 'Please select start date' }]}>
                <DatePicker
                  style={{ width: '100%', height: '46px' }}
                  placeholder="Select start date"
                  format="DD-MM-YYYY"
                  onChange={handleStartDateChange}
                />
              </Form.Item>
              <Form.Item name="endDate" label="End Date">
                <DatePicker style={{ width: '100%', height: '46px' }} placeholder="Auto-calculated end date" format="DD-MM-YYYY" disabled />
              </Form.Item>
            </div>
          </div>
        )}

        <div className="footer-buttons">
          {selectedPackage && paymentType && (() => {
            const afterDiscountAmount = (selectedPackage.pricing ?? 0) - discountAmount;
            const minimumPayment     = afterDiscountAmount * 0.5;
            let isDisabled = false;
            if (totalPaidAmount > afterDiscountAmount)       isDisabled = true;
            else if (paymentType === 'partial')              isDisabled = totalPaidAmount < minimumPayment;
            else if (paymentType === 'fullPayment')          isDisabled = totalPaidAmount < afterDiscountAmount;
            return (
              <Button type="primary" htmlType="submit" loading={loading || addingInvoice} className="save-btn" disabled={isDisabled}>
                Renew Membership
              </Button>
            );
          })()}
        </div>
      </Form>
    </div>
  );
};

export default AdvanceRenew;
