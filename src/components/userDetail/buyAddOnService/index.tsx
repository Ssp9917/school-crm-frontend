import { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Card, InputNumber, Input, notification } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useOutletContext, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useGetOpenCouponsQuery } from '../../../services/coupons';
import { useGetOpenAddonPlansQuery } from '../../../services/package';
import { useAddInvoiceMutation } from '../../../services/invoice';
import { useGetOpenTrainersQuery } from '../../../services/trainer';
import { useGetUserAddOnsQuery } from '../../../services/membership';
import ImagePicker from '../../form/ImagePicker';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface UserData {
  _id?: string;
  member?: { address?: string };
}

interface UserOutletContext {
  userData?: UserData;
}

interface Plan {
  _id: string;
  name?: string;
  pricing?: number;
  numberOfDays?: number;
  addonType?: string;
}

interface Coupon {
  _id?: string;
  code?: string;
  discountType?: string;
  value?: number;
}

interface Trainer {
  _id?: string;
  user?: { name?: string };
  specialization?: string[];
}

interface PaymentMode {
  id: number;
  mode: string;
  amount: number | string | null;
}

/* ─── Module-level constants ─────────────────────────────────────────── */

const typeOptions = [
  { label: 'Personal Training', value: 'Personal Training' },
  { label: 'Pilates',           value: 'Pilates'           },
  { label: 'Therapy',           value: 'Therapy'           },
  { label: 'EMS',               value: 'EMS'               },
  { label: 'Paid Locker',       value: 'Paid Locker'       },
  { label: 'MMA',               value: 'MMA'               },
];

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

const BuyAddOnService = () => {
  const { userData }  = useOutletContext<UserOutletContext>();
  const navigate      = useNavigate();
  const branchId      = useSelector((state: any) => state.branch.selectedBranch);
  const selectedBranchId = typeof branchId === 'object' ? (branchId?._id || branchId?.id) : branchId;
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();

  const [loading, setLoading]               = useState(false);
  const [gstClaim, setGstClaim]             = useState(false);
  const gstPercentage                        = 5;
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentModes, setPaymentModes]     = useState<PaymentMode[]>([{ id: 1, mode: '', amount: '' }]);
  const [paymentType, setPaymentType]       = useState('');
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [planPrice, setPlanPrice]           = useState(0);
  const [selectedPlan, setSelectedPlan]     = useState<Plan | null>(null);
  const [showTrainerSelect, setShowTrainerSelect] = useState(false);

  const { data: couponsData,      isLoading: couponsLoading }   = useGetOpenCouponsQuery(undefined);
  const { data: addOnPackagesData, isLoading: packagesLoading }  = useGetOpenAddonPlansQuery({ type: 'addon' });
  const { data: trainersData,      isLoading: trainersLoading }  = useGetOpenTrainersQuery({ page: 1, limit: 100, branchId: selectedBranchId || undefined });
  const { refetch: refetchAddons }                               = useGetUserAddOnsQuery(userData?._id, { skip: !userData?._id });
  const [addInvoice, { isLoading: isAddingInvoice }]             = useAddInvoiceMutation();

  const coupons:       Coupon[]  = (couponsData      as any)?.data ?? [];
  const addOnPackages: Plan[]    = (addOnPackagesData as any)?.data ?? [];
  const allTrainers:   Trainer[] = (trainersData      as any)?.data ?? [];

  /* ─── Calculations ─────────────────────────────────────────────────── */

  const calculateTotals = (basePrice: number, coupon: Coupon | null) => {
    let discountAmt = 0;
    if (coupon) {
      discountAmt = coupon.discountType === 'percentage'
        ? (basePrice * (coupon.value ?? 0)) / 100
        : (coupon.value ?? 0);
    }
    const priceAfterDiscount = Math.max(0, basePrice - discountAmt);
    const gstAmount          = gstClaim ? (priceAfterDiscount * gstPercentage) / 100 : 0;
    setDiscountAmount(discountAmt);
    form.setFieldsValue({ afterDiscount: priceAfterDiscount, totalOrderValue: priceAfterDiscount + gstAmount });
  };

  const calculatePaymentAmounts = () => {
    const fv = form.getFieldsValue();
    let total = 0;
    paymentModes.forEach(p => { total += Number(fv[`paymentAmount_${p.id}`] || 0); });
    setTotalPaidAmount(total);
    setRemainingAmount(Math.max(0, planPrice - discountAmount - total));
  };

  /* ─── Handlers ─────────────────────────────────────────────────────── */

  const handlePlanPriceChange = (value: number | string | null) => {
    const price = Number(value) || 0;
    setPlanPrice(price);
    calculateTotals(price, selectedCoupon);
  };

  const handlePlanSelect = (planId: string) => {
    const plan = addOnPackages.find(p => p._id === planId) ?? null;
    if (plan) {
      setSelectedPlan(plan);
      setPaymentType('');
      form.setFieldsValue({ planPrice: plan.pricing, paymentType: undefined });
      setPlanPrice(plan.pricing ?? 0);
      calculateTotals(plan.pricing ?? 0, selectedCoupon);
      setShowTrainerSelect(true);
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
      paymentModes.forEach(pm => { form.validateFields([`paymentAmount_${pm.id}`]); });
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
      [`chequeScreenshot_${paymentId}`]:   undefined,
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
    if (date && selectedPlan) {
      const endDate = dayjs(date).add((selectedPlan.numberOfDays ?? 30) - 1, 'days').endOf('day');
      form.setFieldsValue({ endDate });
    }
  };

  const handleCouponChange = (couponId: string | undefined) => {
    const coupon = couponId ? (coupons.find(c => c._id === couponId) ?? null) : null;
    setSelectedCoupon(coupon);
    if (planPrice) calculateTotals(planPrice, coupon);
  };

  const handleGstClaimChange = (value: string) => {
    setGstClaim(value === 'yes');
    if (planPrice) calculateTotals(planPrice, selectedCoupon);
  };

  useEffect(() => { calculatePaymentAmounts(); }, [planPrice, discountAmount, gstClaim, paymentModes.length]);

  useEffect(() => {
    const serviceType = searchParams.get('type');
    if (serviceType) {
      const opt = typeOptions.find(o => o.value === serviceType);
      if (opt) form.setFieldsValue({ addOnServiceType: opt.label });
    }
  }, [searchParams, form]);

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
      const startDate          = values.paymentDate ? dayjs(values.paymentDate as dayjs.Dayjs).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
      const afterDiscountAmount = planPrice - discountAmount;

      if (paymentType === 'partial' && totalPaidAmount < afterDiscountAmount * 0.5) { setLoading(false); return; }
      if (paymentType === 'fullPayment' && totalPaidAmount < afterDiscountAmount)   { setLoading(false); return; }

      const gstAmount  = gstClaim ? (afterDiscountAmount * gstPercentage) / 100 : 0;
      const totalAmount = afterDiscountAmount + gstAmount;

      const urlAddonType   = searchParams.get('type');
      const finalAddonType = urlAddonType
        ? urlAddonType.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
        : selectedPlan?.addonType;

      const paymentTerms: object[] = [];
      paymentModes.forEach(payment => {
        const mode   = values[`paymentMode_${payment.id}`] as string;
        const amount = values[`paymentAmount_${payment.id}`];
        if (!mode || !amount) return;
        switch (mode) {
          case 'cash':
            paymentTerms.push({ modeOfPayment: 'cash', amount, receivedBy: values[`cashEmployee_${payment.id}`] || '', receipt: [] });
            break;
          case 'upi':
            paymentTerms.push({ modeOfPayment: 'upi', amount, receipt: values[`upiScreenshot_${payment.id}`] ? [values[`upiScreenshot_${payment.id}`]] : [], referenceId: values[`upiReferenceId_${payment.id}`] || null });
            break;
          case 'card':
            paymentTerms.push({ modeOfPayment: 'card', amount, receipt: values[`cardScreenshot_${payment.id}`] ? [values[`cardScreenshot_${payment.id}`]] : [] });
            break;
          case 'cheque':
            paymentTerms.push({ modeOfPayment: 'cheque', amount, chequeNumber: values[`chequeNumber_${payment.id}`] || '', receipt: values[`chequeScreenshot_${payment.id}`] ? [values[`chequeScreenshot_${payment.id}`]] : [] });
            break;
          case 'banktransfer':
            paymentTerms.push({ modeOfPayment: 'banktransfer', amount, receipt: values[`transferScreenshot_${payment.id}`] ? [values[`transferScreenshot_${payment.id}`]] : [] });
            break;
          case 'creditnote':
            paymentTerms.push({ modeOfPayment: 'creditnote', amount, receipt: values[`creditNoteUpload_${payment.id}`] ? [values[`creditNoteUpload_${payment.id}`]] : [] });
            break;
        }
      });

      await (addInvoice as any)({
        userId:                userData?._id,
        planId:                selectedPlan?._id,
        type:                  'addon',
        addonType:             finalAddonType,
        pricing:               planPrice,
        couponId:              selectedCoupon?._id ?? null,
        discountAmount,
        afterDiscount:         afterDiscountAmount,
        gstClaim,
        gstPercentage,
        gstAmount,
        gstNumber:             values.gstNumber ?? null,
        registeredCompanyName: values.registeredCompanyName ?? null,
        totalInvoiceAmount:    totalAmount,
        dueAmount:             paymentType === 'partial' ? remainingAmount : 0,
        paymentType:           values.paymentType || 'fullPayment',
        billingAddress:        values.billingAddress || userData?.member?.address,
        paymentDate:           startDate,
        startDate:             values.startDate ? dayjs(values.startDate as dayjs.Dayjs).format('YYYY-MM-DD') : null,
        endDate:               values.endDate   ? dayjs(values.endDate   as dayjs.Dayjs).format('YYYY-MM-DD') : null,
        paymentTerm:           paymentTerms,
        coachId:               values.assignedTrainer ?? null,
        invoiceType:           'new_client',
      }).unwrap();

      refetchAddons();
      form.resetFields();
      setSelectedCoupon(null);
      setSelectedPlan(null);
      setPaymentModes([{ id: 1, mode: '', amount: '' }]);
      setPaymentType('');
      setGstClaim(false);
      setDiscountAmount(0);
      setPlanPrice(0);
      setTotalPaidAmount(0);
      setRemainingAmount(0);
      navigate(`/user-detail/${userData?._id}/addon-service`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Derived option arrays ──────────────────────────────────────────── */

  const urlType = searchParams.get('type')?.replace(/-/g, '_') ?? null;

  const planOptions = (urlType ? addOnPackages.filter(p => p.addonType === urlType) : addOnPackages).length > 0
    ? (urlType ? addOnPackages.filter(p => p.addonType === urlType) : addOnPackages)
        .map(p => ({ label: `${p.name} — ₹${p.pricing}`, value: p._id }))
    : [{ label: 'No plans available for this service', value: '', disabled: true }];

  const urlTypeNormalized = searchParams.get('type')
    ? searchParams.get('type')!.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : null;

  const filteredTrainers = urlTypeNormalized
    ? allTrainers.filter(t => t.specialization?.some(s => s.toLowerCase() === urlTypeNormalized.toLowerCase()))
    : allTrainers;

  const trainerOptions = filteredTrainers.length > 0
    ? filteredTrainers.map(t => ({
        label: `${t.user?.name || 'Unknown'} - ${t.specialization?.join(', ') || 'No Specialization'}`,
        value: t._id,
      }))
    : [{ label: 'No trainers available for this service', value: '', disabled: true }];

  const paymentTypeOptions = [
    { value: 'fullPayment', label: 'Full Payment' },
    ...(selectedPlan && (selectedPlan.numberOfDays ?? 0) > 75
      ? [{ value: 'partial', label: 'Partial Payment' }]
      : []),
  ];

  const couponOptions = coupons.map(c => ({
    label: `${c.code} - ${c.discountType === 'percentage' ? `${c.value}%` : `₹${c.value}`} off`,
    value: c._id,
  }));

  const urlTypeLabel = searchParams.get('type')
    ? ` (${searchParams.get('type')!.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())})`
    : '';

  /* ─── Render ────────────────────────────────────────────────────────── */

  return (
    <div className="buy-addon-service-container">
      <div className="form-header">
        <h2>Purchase Add-On Service{urlTypeLabel}</h2>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed} className="custom-form">
        <div className="row">
          <Form.Item name="invoiceDate" label="Invoice Date" initialValue={dayjs()}>
            <DatePicker style={{ width: '100%', height: '46px' }} disabled placeholder="Invoice date" format="DD-MM-YYYY" />
          </Form.Item>

          <Form.Item name="paymentDate" label="Payment Date" rules={[{ required: true, message: 'Please select payment date' }]}>
            <DatePicker
              style={{ width: '100%', height: '46px' }}
              placeholder="Select payment date"
              format="DD-MM-YYYY"
              disabledDate={current => current && current > dayjs().endOf('day')}
            />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="addOnPlan" label="Add-On Plan" rules={[{ required: true, message: 'Please select an add-on plan' }]}>
            <Select
              placeholder="Choose add-on plan"
              loading={packagesLoading}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={planOptions as any}
              onChange={(v: string) => handlePlanSelect(v)}
            />
          </Form.Item>

          {showTrainerSelect && (
            <div className="row">
              <Form.Item name="assignedTrainer" label="Select Trainer" rules={[{ required: true, message: 'Please select a trainer' }]}>
                <Select
                  placeholder="Choose trainer"
                  loading={trainersLoading}
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={trainerOptions as any}
                />
              </Form.Item>
            </div>
          )}
        </div>

        <div className="row">
          <Form.Item name="paymentType" label="Payment Type" rules={[{ required: true, message: 'Please select payment type' }]}>
            <Select
              placeholder="Select payment type"
              options={paymentTypeOptions}
              onChange={(v: string) => setPaymentType(v)}
            />
          </Form.Item>

          <Form.Item name="planPrice" label="Plan Price" rules={[{ required: true, message: 'Please enter plan price' }]}>
            <InputNumber
              disabled
              style={{ width: '100%' }}
              formatter={numFmt as any}
              parser={numParse as any}
              placeholder="Enter plan price"
              onChange={v => handlePlanPriceChange(v)}
              min={0}
            />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="gstClaim" label="GST Claim" rules={[{ required: true, message: 'Please select GST claim option' }]}>
            <Select
              placeholder="Select GST claim"
              options={gstClaimOptions}
              onChange={(v: string) => handleGstClaimChange(v)}
            />
          </Form.Item>
        </div>

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
              <Input placeholder="Enter GST number" style={{ height: '46px' }} />
            </Form.Item>
            <Form.Item
              name="registeredCompanyName"
              label="Registered Company Name"
              rules={[
                { required: true, message: 'Please enter registered company name' },
                { min: 2, message: 'Company name must be at least 2 characters' },
              ]}
            >
              <Input placeholder="Enter registered company name" style={{ height: '46px' }} />
            </Form.Item>
          </div>
        )}

        <div className="row">
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

          <Form.Item name="afterDiscount" label="After Discount">
            <InputNumber
              style={{ width: '100%' }}
              formatter={numFmt as any}
              parser={numParse as any}
              disabled
              placeholder="Price after coupon discount"
            />
          </Form.Item>
        </div>

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
                        if (planPrice && value) {
                          const finalAmount = planPrice - discountAmount + (gstClaim ? ((planPrice - discountAmount) * gstPercentage) / 100 : 0);
                          const fv = form.getFieldsValue();
                          let calculatedTotal = 0;
                          paymentModes.forEach(pm => { calculatedTotal += Number(fv[`paymentAmount_${pm.id}`] || 0); });
                          if (calculatedTotal > finalAmount)
                            return Promise.reject(new Error(`Total payment (₹${calculatedTotal.toFixed(2)}) exceeds package amount (₹${finalAmount.toFixed(2)})`));
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

              <Form.Item
                noStyle
                shouldUpdate={(prev, cur) => prev[`paymentMode_${payment.id}`] !== cur[`paymentMode_${payment.id}`]}
              >
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

          {selectedPlan && paymentType === 'fullPayment' && remainingAmount > 0 && (
            <div className="remaining-balance">
              <div style={{ color: '#fa1414ff', fontSize: '14px', fontWeight: '500' }}>
                <strong>Remaining Balance:</strong> ₹{remainingAmount.toFixed(2)}
              </div>
            </div>
          )}

          {selectedPlan && paymentType === 'partial' && (
            <div className="remaining-balance">
              <div style={{ marginBottom: '8px', color: '#ff4d4f', fontSize: '13px' }}>
                <strong>Note:</strong> For partial payment, minimum 50% payment is required (₹{((planPrice - discountAmount) * 0.5).toFixed(2)}).
              </div>
            </div>
          )}
        </div>

        {planPrice > 0 && (
          <Card className="package-summary" size="small" title="Order Summary">
            <div className="summary-row">
              <span><strong>Package:</strong> {selectedPlan?.name}</span>
              <span><strong>Plan Price:</strong> ₹{planPrice}</span>
            </div>
            {selectedCoupon && (
              <div className="summary-row">
                <span><strong>Coupon:</strong> {selectedCoupon.code}</span>
                <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                  <strong style={{ color: 'white' }}>Discount:</strong> -₹{discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="summary-row">
              <span><strong>Price After Discount:</strong></span>
              <span>₹{(planPrice - discountAmount).toFixed(2)}</span>
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
            {paymentType === 'partial' && remainingAmount > 0 && (
              <div className="summary-row due-balance">
                <span><strong>Due Balance:</strong></span>
                <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>₹{remainingAmount.toFixed(2)}</span>
              </div>
            )}
          </Card>
        )}

        {selectedPlan && (
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
        )}

        <div className="footer-buttons">
          {selectedPlan && paymentType && (() => {
            const afterDiscountAmount = planPrice - discountAmount;
            const minimumPayment     = afterDiscountAmount * 0.5;
            let isDisabled = false;
            if (totalPaidAmount > afterDiscountAmount)    isDisabled = true;
            else if (paymentType === 'partial')           isDisabled = totalPaidAmount < minimumPayment;
            else if (paymentType === 'fullPayment')       isDisabled = totalPaidAmount < afterDiscountAmount;
            const btnLabel = searchParams.get('type')
              ? ` ${searchParams.get('type')!.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`
              : '';
            return (
              <Button type="primary" htmlType="submit" loading={loading || isAddingInvoice} className="save-btn" disabled={isDisabled}>
                Purchase{btnLabel}
              </Button>
            );
          })()}
        </div>
      </Form>
    </div>
  );
};

export default BuyAddOnService;
