import { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Card, InputNumber, Input, message, notification } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useGetPlansQuery } from '../../../services/package';
import { useGetBranchesQuery } from '../../../services/branches';
import { useGetAllCouponQuery } from '../../../services/coupons';
import { useAddInvoiceMutation } from '../../../services/invoice';
import { useUserDetailDataQuery, useGetUsersByRoleQuery } from '../../../services/user';
import { useGetUserMembershipQuery } from '../../../services/membership';
import ImagePicker from '../../../components/form/ImagePicker';
import usePermissions from '../../../hooks/usePermissions';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface UserData {
  _id?: string;
  hasMembership?: boolean;
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

interface SalesPerson {
  _id?: string;
  name?: string;
  phoneNumber?: string;
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

const FIELD_LABELS: Record<string, string> = {
  paymentDate:            'Payment Date',
  salesPerson:            'Sales Person',
  planSelect:             'Plan',
  paymentType:            'Payment Type',
  gstClaim:               'GST Claim',
  gstNumber:              'GST Number',
  registeredCompanyName:  'Company Name',
  startDate:              'Start Date',
};

/* ─── Component ──────────────────────────────────────────────────────── */

const BuyPlan = () => {
  const { userData }  = useOutletContext<UserOutletContext>();
  const navigate      = useNavigate();
  const { id }        = useParams<{ id: string }>();
  const branchId      = useSelector((state: any) => state.branch.selectedBranch);
  const { hasPermission } = usePermissions();
  const canBackdateInvoice = hasPermission('INVOICE_DATE_ACCESS');

  const { refetch: refetchUserData }   = useUserDetailDataQuery(id);
  const { refetch: refetchMembership } = useGetUserMembershipQuery(id);
  const [form] = Form.useForm();

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [loading, setLoading]                 = useState(false);
  const [gstClaim, setGstClaim]               = useState(false);
  const gstPercentage                          = 5;
  const [selectedCoupon, setSelectedCoupon]   = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount]   = useState(0);
  const [paymentModes, setPaymentModes]       = useState<PaymentMode[]>([{ id: 1, mode: '', amount: '' }]);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [paymentType, setPaymentType]         = useState('');

  const { data: packagesData,     isLoading: plansLoading }        = useGetPlansQuery({ limit: 100, userId: userData?._id });
  const { data: branchesData }                                      = useGetBranchesQuery(undefined);
  const { data: couponsData,      isLoading: couponsLoading }      = useGetAllCouponQuery({});
  const { data: salesPersonsData, isLoading: salesPersonsLoading } = useGetUsersByRoleQuery({
    role:     'sales_representative',
    branchId: branchId || undefined,
    userId:   userData?._id,
  });
  const [addInvoice, { isLoading: addingInvoice }] = useAddInvoiceMutation();

  const packages:     Package[]     = (packagesData     as any)?.data ?? [];
  const coupons:      Coupon[]      = (couponsData      as any)?.data ?? [];
  const salesPersons: SalesPerson[] = (salesPersonsData as any)?.data ?? [];

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
      setRemainingAmount(Math.max(0, (selectedPackage.pricing ?? 0) - discountAmount - total));
    }
  };

  useEffect(() => { calculatePaymentAmounts(); }, [selectedPackage, discountAmount, gstClaim, paymentModes.length]);

  /* ─── Handlers ─────────────────────────────────────────────────────── */

  const handlePackageChange = (packageId: string) => {
    const pkg = packages.find(p => p._id === packageId) ?? null;
    setSelectedPackage(pkg);
    setPaymentType('');
    form.setFieldsValue({ paymentType: undefined });
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
      paymentModes.forEach(pm => { form.validateFields([`paymentAmount_${pm.id}`]).catch(() => {}); });
    }, 100);
  };

  const addPaymentMode = () => {
    const newId = Math.max(...paymentModes.map(p => p.id)) + 1;
    setPaymentModes(prev => [...prev, { id: newId, mode: '', amount: '' }]);
  };

  const removePaymentMode = (paymentId: number) => {
    if (paymentModes.length <= 1) return;
    form.setFieldsValue({
      [`paymentMode_${paymentId}`]:        undefined,
      [`paymentAmount_${paymentId}`]:      undefined,
      [`cashEmployee_${paymentId}`]:       undefined,
      [`upiScreenshot_${paymentId}`]:      undefined,
      [`upiReferenceId_${paymentId}`]:     undefined,
      [`cardScreenshot_${paymentId}`]:     undefined,
      [`chequeNumber_${paymentId}`]:       undefined,
      [`bankName_${paymentId}`]:           undefined,
      [`holderName_${paymentId}`]:         undefined,
      [`accountNumber_${paymentId}`]:      undefined,
      [`ifscCode_${paymentId}`]:           undefined,
      [`transferScreenshot_${paymentId}`]: undefined,
      [`creditNoteUpload_${paymentId}`]:   undefined,
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

  const handleCouponChange = (couponId: string | undefined) => {
    const coupon = couponId ? (coupons.find(c => c._id === couponId) ?? null) : null;
    setSelectedCoupon(coupon);
    if (selectedPackage) calculateTotals(selectedPackage.pricing ?? 0, coupon);
  };

  const handleGstClaimChange = (value: string) => {
    setGstClaim(value === 'yes');
    if (selectedPackage) calculateTotals(selectedPackage.pricing ?? 0, selectedCoupon);
  };

  /* ─── Form submit ──────────────────────────────────────────────────── */

  const onFinishFailed = ({ errorFields }: { errorFields: { name: (string | number)[]; errors: string[] }[] }) => {
    if (!errorFields?.length) return;
    const labels = errorFields.map(f => {
      const name = Array.isArray(f.name) ? f.name[0] : f.name;
      const str  = String(name);
      if (str.startsWith('paymentMode_'))      return 'Payment Mode';
      if (str.startsWith('paymentAmount_'))    return 'Payment Amount';
      if (str.startsWith('cashEmployee_'))     return 'Cash Employee';
      if (str.startsWith('upiScreenshot_'))    return 'UPI Screenshot';
      if (str.startsWith('cardScreenshot_'))   return 'Card Screenshot';
      if (str.startsWith('chequeNumber_'))     return 'Cheque Number';
      if (str.startsWith('chequeScreenshot_')) return 'Cheque Image';
      if (str.startsWith('transferScreenshot_')) return 'Transfer Screenshot';
      if (str.startsWith('creditNoteUpload_')) return 'Credit Note';
      return FIELD_LABELS[str] || str;
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
      const afterDiscountAmount = (selectedPackage?.pricing ?? 0) - discountAmount;

      if (paymentType === 'partial' && totalPaidAmount < afterDiscountAmount * 0.5) {
        message.error(`For partial payment, you must pay at least 50% (₹${(afterDiscountAmount * 0.5).toFixed(2)})`);
        setLoading(false);
        return;
      }
      if (paymentType === 'fullPayment' && totalPaidAmount < afterDiscountAmount) {
        message.error(`Please pay the full amount. Remaining: ₹${(afterDiscountAmount - totalPaidAmount).toFixed(2)}`);
        setLoading(false);
        return;
      }

      const startDate   = values.startDate ? dayjs(values.startDate as dayjs.Dayjs).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
      const expiryDate  = values.endDate
        ? dayjs(values.endDate as dayjs.Dayjs).format('YYYY-MM-DD HH:mm:ss')
        : selectedPackage?.numberOfDays
          ? dayjs(startDate).add(selectedPackage.numberOfDays - 1, 'days').endOf('day').format('YYYY-MM-DD HH:mm:ss')
          : dayjs(startDate).add(365, 'days').endOf('day').format('YYYY-MM-DD HH:mm:ss');
      const paymentDate = values.paymentDate ? dayjs(values.paymentDate as dayjs.Dayjs).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
      const invoiceDate = values.invoiceDate ? dayjs(values.invoiceDate as dayjs.Dayjs).format('YYYY-MM-DD HH:mm:ss') : dayjs().format('YYYY-MM-DD HH:mm:ss');

      const planPrice        = selectedPackage?.pricing ?? 0;
      const baseAmount       = totalPaidAmount / 1.05;
      const gstOnPaidAmount  = totalPaidAmount - baseAmount;

      const paymentTerms: object[] = [];
      paymentModes.forEach(payment => {
        const modeOfPayment = form.getFieldValue(`paymentMode_${payment.id}`) as string;
        const amount        = form.getFieldValue(`paymentAmount_${payment.id}`) || 0;
        if (!modeOfPayment || amount === 0) return;

        switch (modeOfPayment) {
          case 'cash':
            paymentTerms.push({ modeOfPayment: 'cash', amount, receivedBy: form.getFieldValue(`cashEmployee_${payment.id}`) || null, receipt: [] });
            break;
          case 'upi': {
            const upiScreenshot  = form.getFieldValue(`upiScreenshot_${payment.id}`);
            const upiReferenceId = form.getFieldValue(`upiReferenceId_${payment.id}`);
            paymentTerms.push({ modeOfPayment: 'upi', amount, receipt: upiScreenshot ? [upiScreenshot] : [], referenceId: upiReferenceId || null });
            break;
          }
          case 'card': {
            const cardScreenshot = form.getFieldValue(`cardScreenshot_${payment.id}`);
            paymentTerms.push({ modeOfPayment: 'card', amount, receipt: cardScreenshot ? [cardScreenshot] : [] });
            break;
          }
          case 'cheque': {
            const chequeNumber     = form.getFieldValue(`chequeNumber_${payment.id}`);
            const chequeScreenshot = form.getFieldValue(`chequeScreenshot_${payment.id}`);
            paymentTerms.push({ modeOfPayment: 'cheque', amount, chequeNumber: chequeNumber || null, receipt: chequeScreenshot ? [chequeScreenshot] : [] });
            break;
          }
          case 'banktransfer': {
            const transferScreenshot = form.getFieldValue(`transferScreenshot_${payment.id}`);
            paymentTerms.push({ modeOfPayment: 'banktransfer', amount, receipt: transferScreenshot ? [transferScreenshot] : [] });
            break;
          }
          case 'creditnote': {
            const creditNoteScreenshot = form.getFieldValue(`creditNoteUpload_${payment.id}`);
            paymentTerms.push({ modeOfPayment: 'creditnote', amount, receipt: creditNoteScreenshot ? [creditNoteScreenshot] : [] });
            break;
          }
          default: break;
        }
      });

      await (addInvoice as any)({
        userId:                userData?._id,
        planId:                selectedPackage?._id,
        startDate,
        expiryDate,
        planPrice,
        couponId:              selectedCoupon?._id ?? null,
        discountAmount,
        afterDiscount:         afterDiscountAmount,
        gstClaim,
        gstPercentage,
        gstAmount:             gstOnPaidAmount,
        gstNumber:             values.gstNumber ?? null,
        registeredCompanyName: values.registeredCompanyName ?? null,
        totalInvoiceAmount:    totalPaidAmount,
        dueAmount:             paymentType === 'partial' ? remainingAmount : 0,
        paymentType:           values.paymentType || 'fullPayment',
        invoiceDate,
        paymentDate,
        paymentTerm:           paymentTerms,
        invoiceType:           userData?.hasMembership ? 'renew' : 'new_client',
        coachId:               null,
        lockerNumber:          values.lockerNumber ?? null,
        salesPersonId:         values.salesPerson,
        details:               selectedPackage?.items?.map(item => ({
          itemName: item.name,
          quantity: item.quantity ?? 1,
          planId:   selectedPackage._id,
        })) ?? [],
      }).unwrap();

      await refetchUserData();
      await refetchMembership();
      form.resetFields();
      setSelectedPackage(null);
      setSelectedCoupon(null);
      setGstClaim(false);
      setDiscountAmount(0);
      navigate(`/user-detail/${id}/membership`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Derived option arrays ──────────────────────────────────────────── */

  const salesPersonOptions = salesPersons.length > 0
    ? salesPersons.map(p => ({ label: `${p.name || 'Unknown'} - ${p.phoneNumber || 'No Phone'}`, value: p._id }))
    : [{ label: 'No sales persons available', value: '', disabled: true }];

  const planOptions = packages
    .filter(pkg => pkg.type === 'membership' || pkg.type === 'trial')
    .map(pkg => ({ label: `${pkg.name} - ₹${pkg.pricing} - ${pkg.numberOfDays} days`, value: pkg._id }));

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
        <h2>Purchase Membership Plan</h2>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed} className="custom-form">
        <div className="row">
          <Form.Item name="invoiceDate" label="Invoice Date" initialValue={dayjs()}>
            <DatePicker
              style={{ width: '100%', height: '46px' }}
              placeholder="Invoice date & time"
              format="DD-MM-YYYY hh:mm A"
              showTime={{ format: 'hh:mm A', use12Hours: true }}
              disabled={!canBackdateInvoice}
              disabledDate={canBackdateInvoice ? undefined : current => current && !current.isSame(dayjs(), 'day')}
            />
          </Form.Item>

          <Form.Item name="paymentDate" label="Payment Date" rules={[{ required: true, message: 'Please select payment date' }]}>
            <DatePicker
              style={{ width: '100%', height: '46px' }}
              placeholder="Select payment date"
              format="DD-MM-YYYY"
              disabledDate={current => current && current > dayjs().endOf('day')}
            />
          </Form.Item>

          <Form.Item name="salesPerson" label="Sales Person" rules={[{ required: true, message: 'Please select a sales person' }]}>
            <Select
              placeholder="Choose sales person"
              loading={salesPersonsLoading}
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
              onChange={(v: string | undefined) => handleCouponChange(v)}
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
                          if (calculatedTotal > afterDiscountAmount)
                            return Promise.reject(new Error(`Amount exceeds by ₹${(calculatedTotal - afterDiscountAmount).toFixed(2)}. Maximum allowed: ₹${afterDiscountAmount.toFixed(2)}`));
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
                    <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => removePaymentMode(payment.id)}>Remove</Button>
                  )}
                </div>
              </div>

              <Form.Item noStyle shouldUpdate={(prev, cur) => prev[`paymentMode_${payment.id}`] !== cur[`paymentMode_${payment.id}`]}>
                {() => {
                  const currentMode = form.getFieldValue(`paymentMode_${payment.id}`);
                  if (currentMode === 'cash')
                    return (
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
                    );
                  if (currentMode === 'upi')
                    return (
                      <div className="row payment-details">
                        <Form.Item name={`upiScreenshot_${payment.id}`} label="UPI Payment Screenshot" rules={[{ required: true, message: 'Please upload UPI payment screenshot' }]}>
                          <ImagePicker form={form} name={`upiScreenshot_${payment.id}`} />
                        </Form.Item>
                        <Form.Item name={`upiReferenceId_${payment.id}`} label="UPI Reference ID">
                          <Input placeholder="Enter UPI transaction reference ID (optional)" style={{ width: '100%' }} />
                        </Form.Item>
                      </div>
                    );
                  if (currentMode === 'cheque')
                    return (
                      <div className="row payment-details">
                        <Form.Item name={`chequeNumber_${payment.id}`} label="Cheque Number" rules={[{ required: true, message: 'Please enter cheque number' }]}>
                          <Input placeholder="Enter cheque number" style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name={`chequeScreenshot_${payment.id}`} label="Upload Cheque Image" rules={[{ required: true, message: 'Please upload cheque image' }]}>
                          <ImagePicker form={form} name={`chequeScreenshot_${payment.id}`} />
                        </Form.Item>
                      </div>
                    );
                  if (currentMode === 'card')
                    return (
                      <div className="row payment-details">
                        <Form.Item name={`cardScreenshot_${payment.id}`} label="Card Payment Screenshot" rules={[{ required: true, message: 'Please upload card payment screenshot' }]}>
                          <ImagePicker form={form} name={`cardScreenshot_${payment.id}`} />
                        </Form.Item>
                      </div>
                    );
                  if (currentMode === 'banktransfer')
                    return (
                      <div className="row payment-details">
                        <Form.Item name={`transferScreenshot_${payment.id}`} label="Upload Transfer Screenshot" rules={[{ required: true, message: 'Please upload transfer screenshot' }]}>
                          <ImagePicker form={form} name={`transferScreenshot_${payment.id}`} />
                        </Form.Item>
                      </div>
                    );
                  if (currentMode === 'creditnote')
                    return (
                      <div className="row payment-details">
                        <Form.Item name={`creditNoteUpload_${payment.id}`} label="Credit Note" rules={[{ required: true, message: 'Please upload credit note' }]}>
                          <ImagePicker form={form} name={`creditNoteUpload_${payment.id}`} />
                        </Form.Item>
                      </div>
                    );
                  return null;
                }}
              </Form.Item>
            </div>
          ))}

          {selectedPackage && paymentType === 'fullPayment' && remainingAmount > 0 && (
            <div className="remaining-balance">
              <div style={{ color: '#fa1414ff', fontSize: '14px', fontWeight: '500' }}>
                <strong>Remaining Balance:</strong> ₹{remainingAmount.toFixed(2)}
              </div>
            </div>
          )}

          {selectedPackage && paymentType === 'partial' && (
            <div className="remaining-balance">
              <div style={{ marginBottom: '8px', color: '#ff4d4f', fontSize: '13px' }}>
                <strong>Note:</strong> For partial payment, minimum 50% payment is required (₹{(((selectedPackage.pricing ?? 0) - discountAmount) * 0.5).toFixed(2)}).
              </div>
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
            {remainingAmount > 0 && (
              <div className="summary-row due-balance">
                <span><strong>Due Balance:</strong></span>
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
            if (totalPaidAmount > afterDiscountAmount)    isDisabled = true;
            else if (paymentType === 'partial')           isDisabled = totalPaidAmount < minimumPayment;
            else if (paymentType === 'fullPayment')       isDisabled = totalPaidAmount < afterDiscountAmount;
            return (
              <Button type="primary" htmlType="submit" loading={loading || addingInvoice} className="save-btn" disabled={isDisabled}>
                Purchase Plan
              </Button>
            );
          })()}
        </div>
      </Form>
    </div>
  );
};

export default BuyPlan;
