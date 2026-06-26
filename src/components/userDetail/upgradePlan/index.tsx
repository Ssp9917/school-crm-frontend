import { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Card, InputNumber, Input, message, notification } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useGetUpgradablePlansQuery } from '../../../services/package';
import { useUserDetailDataQuery, useGetUsersByRoleQuery } from '../../../services/user';
import { useAddInvoiceMutation } from '../../../services/invoice';
import { useGetAllCouponQuery } from '../../../services/coupons';
import ImagePicker from '../../../components/form/ImagePicker';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface UserData {
  _id?: string;
  name?: string;
  phoneNumber?: string;
  member?: { age?: number; gender?: string; stateName?: string; address?: string };
  currentMembership?: { totalInvoicedAmount?: number };
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
  items?: { name?: string; quantity?: number }[];
}

interface CurrentPlan {
  name?: string;
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
}

interface PaymentMode {
  id: number;
  mode: string;
  amount: number | string;
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
  { value: 'Yes', label: 'Yes' },
  { value: 'No',  label: 'No'  },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const UpgradePlan = () => {
  const { userData }   = useOutletContext<UserOutletContext>();
  const navigate       = useNavigate();
  const { id }         = useParams<{ id: string }>();
  const branchId       = useSelector((state: any) => state.branch.selectedBranch);
  const selectedBranchId: string | undefined =
    typeof branchId === 'object' ? (branchId?._id || branchId?.id) : branchId;

  const { refetch: refetchUserData } = useUserDetailDataQuery(id);
  const [form] = Form.useForm();

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [gstClaim, setGstClaim]               = useState('No');
  const [gstPercentage, setGstPercentage]     = useState<number | null>(null);
  const [paymentType, setPaymentType]         = useState('fullPayment');
  const [paymentModes, setPaymentModes]       = useState<PaymentMode[]>([{ id: 1, mode: '', amount: '' }]);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [loading, setLoading]                 = useState(false);
  const [selectedCoupon, setSelectedCoupon]   = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount]   = useState(0);

  const { data: packagesData, isLoading: packagesLoading } = useGetUpgradablePlansQuery(
    { userId: id, branchId: selectedBranchId },
    { skip: !id },
  );
  const packages:     Package[]     = (packagesData as any)?.plans ?? [];
  const currentPlan:  CurrentPlan | null = (packagesData as any)?.currentPlan ?? null;

  const { data: salesPersonsData } = useGetUsersByRoleQuery({ role: 'sales_representative', userId: id });
  const salesPersons: SalesPerson[] = (salesPersonsData as any)?.data ?? [];

  const { data: couponsData, isLoading: couponsLoading } = useGetAllCouponQuery({});
  const coupons: Coupon[] = (couponsData as any)?.data ?? [];

  const [addInvoice, { isLoading: addingInvoice }] = useAddInvoiceMutation();

  /* ─── Calculations ─────────────────────────────────────────────────── */

  const calculateAmounts = (customDiscount: number | null = null) => {
    const newPlanPrice           = form.getFieldValue('newPlanPrice') || 0;
    const previousInvoiceAmount  = form.getFieldValue('previousInvoiceAmount') || 0;
    const differenceAmount       = newPlanPrice - previousInvoiceAmount;
    const currentDiscount        = customDiscount !== null ? customDiscount : discountAmount;
    const afterDiscount          = Math.max(0, differenceAmount - currentDiscount);
    let totalPayable             = afterDiscount;
    let gstAmount                = 0;
    if (gstClaim === 'Yes' && gstPercentage) {
      gstAmount    = (afterDiscount * gstPercentage) / 100;
      totalPayable = afterDiscount + gstAmount;
    }
    form.setFieldsValue({
      differenceAmount,
      afterDiscount,
      gstAmount,
      totalPayableAmount: totalPayable,
      dueAmount: paymentType === 'fullPayment' ? 0 : totalPayable,
    });
  };

  useEffect(() => {
    if (!userData) return;
    const member                = userData.member || {};
    const totalInvoicedAmount   = userData.currentMembership?.totalInvoicedAmount || 0;
    form.setFieldsValue({
      invoiceDate:           dayjs(),
      customerName:          userData.name,
      mobileNo:              userData.phoneNumber,
      age:                   member.age,
      gender:                member.gender,
      state:                 member.stateName,
      billingAddress:        member.address,
      gstClaim:              'No',
      paymentType:           'fullPayment',
      previousInvoiceAmount: totalInvoicedAmount,
    });
    setTimeout(() => calculateAmounts(), 0);
  }, [userData]);

  useEffect(() => { calculateAmounts(); }, [gstClaim, gstPercentage, paymentType]);

  /* ─── Handlers ─────────────────────────────────────────────────────── */

  const handleCouponChange = (couponId: string | undefined) => {
    if (!couponId) { setSelectedCoupon(null); setDiscountAmount(0); calculateAmounts(0); return; }
    const coupon = coupons.find(c => c._id === couponId) ?? null;
    setSelectedCoupon(coupon);
    if (coupon) {
      const newPlanPrice          = form.getFieldValue('newPlanPrice') || 0;
      const previousInvoiceAmount = form.getFieldValue('previousInvoiceAmount') || 0;
      const differenceAmount      = newPlanPrice - previousInvoiceAmount;
      const discount              = coupon.discountType === 'percentage'
        ? (differenceAmount * (coupon.value ?? 0)) / 100
        : (coupon.value ?? 0);
      setDiscountAmount(discount);
      calculateAmounts(discount);
    }
  };

  const handlePackageChange = (packageId: string) => {
    const pkg = packages.find(p => p._id === packageId) ?? null;
    setSelectedPackage(pkg);
    if (pkg) {
      form.setFieldsValue({ newPlanPrice: pkg.pricing });
      calculateAmounts();
      const startDate = form.getFieldValue('startDate');
      if (startDate) {
        const end = dayjs(startDate).add((pkg.numberOfDays ?? 365) - 1, 'days').endOf('day');
        form.setFieldsValue({ endDate: end });
      }
    }
  };

  const handleGstClaimChange = (value: string) => {
    setGstClaim(value);
    if (value === 'No') { setGstPercentage(null); form.setFieldsValue({ gstPercentage: undefined }); }
    calculateAmounts();
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

  const addPaymentMode = () => {
    const newId = Math.max(...paymentModes.map(p => p.id), 0) + 1;
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
      [`transferScreenshot_${paymentId}`]: undefined,
      [`creditNoteUpload_${paymentId}`]:   undefined,
    });
    setPaymentModes(prev => prev.filter(p => p.id !== paymentId));
    setTimeout(() => {
      const fv = form.getFieldsValue();
      let total = 0;
      paymentModes.filter(pm => pm.id !== paymentId).forEach(pm => {
        total += Number(fv[`paymentAmount_${pm.id}`] || 0);
      });
      setTotalPaidAmount(total);
      setRemainingAmount(Math.max(0, (form.getFieldValue('totalPayableAmount') || 0) - total));
    }, 100);
  };

  const handlePaymentAmountChange = (amount: number | string | null, paymentId: number) => {
    setPaymentModes(prev => prev.map(p => p.id === paymentId ? { ...p, amount: amount ?? '' } : p));
    setTimeout(() => {
      const fv = form.getFieldsValue();
      let total = 0;
      paymentModes.forEach(pm => { total += Number(fv[`paymentAmount_${pm.id}`] || 0); });
      setTotalPaidAmount(total);
      setRemainingAmount(Math.max(0, (form.getFieldValue('totalPayableAmount') || 0) - total));
      paymentModes.forEach(pm => { form.validateFields([`paymentAmount_${pm.id}`]).catch(() => {}); });
    }, 100);
  };

  /* ─── Submit ────────────────────────────────────────────────────────── */

  const onFinishFailed = ({ errorFields }: { errorFields: { name: (string | number)[]; errors: string[] }[] }) => {
    if (!errorFields?.length) return;
    const labels = errorFields.map(f => {
      const name = Array.isArray(f.name) ? f.name[0] : f.name;
      return String(name).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    });
    notification.error({ message: 'Required Fields Missing', description: [...new Set(labels)].join(', '), placement: 'topRight', duration: 4 });
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!selectedPackage) { message.error('Please select a package first'); return; }
    const totalPayable = form.getFieldValue('totalPayableAmount') || 0;
    if (!totalPayable || totalPayable <= 0) { message.error('Invalid total payable amount'); return; }

    const paymentTerms: object[] = [];
    for (const payment of paymentModes) {
      const mode   = values[`paymentMode_${payment.id}`] as string;
      const amount = values[`paymentAmount_${payment.id}`];
      if (!mode || !amount) continue;
      switch (mode) {
        case 'cash':
          paymentTerms.push({ modeOfPayment: 'cash', amount, receivedBy: values[`cashEmployee_${payment.id}`], receipt: [] });
          break;
        case 'upi':
          paymentTerms.push({ modeOfPayment: 'upi', amount, receipt: [values[`upiScreenshot_${payment.id}`]], referenceId: values[`upiReferenceId_${payment.id}`] || '' });
          break;
        case 'card':
          paymentTerms.push({ modeOfPayment: 'card', amount, receipt: [values[`cardScreenshot_${payment.id}`]] });
          break;
        case 'cheque':
          paymentTerms.push({ modeOfPayment: 'cheque', amount, chequeNumber: values[`chequeNumber_${payment.id}`], receipt: values[`chequeScreenshot_${payment.id}`] ? [values[`chequeScreenshot_${payment.id}`]] : [] });
          break;
        case 'banktransfer':
          paymentTerms.push({ modeOfPayment: 'banktransfer', amount, receipt: values[`transferScreenshot_${payment.id}`] ? [values[`transferScreenshot_${payment.id}`]] : [] });
          break;
        case 'creditnote':
          paymentTerms.push({ modeOfPayment: 'creditnote', amount, receipt: values[`creditNoteUpload_${payment.id}`] ? [values[`creditNoteUpload_${payment.id}`]] : [] });
          break;
        default: break;
      }
    }

    setLoading(true);
    try {
      const startDate  = values.paymentDate ? dayjs(values.paymentDate as dayjs.Dayjs).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
      const expiryDate = selectedPackage.numberOfDays
        ? dayjs(startDate).add(selectedPackage.numberOfDays - 1, 'days').endOf('day').format('YYYY-MM-DD HH:mm:ss')
        : dayjs(startDate).add(365, 'days').format('YYYY-MM-DD');
      const newPlanPrice          = selectedPackage.pricing ?? 0;
      const previousInvoiceAmount = (values.previousInvoiceAmount as number) || 0;
      const differenceAmount      = newPlanPrice - previousInvoiceAmount;
      let gstAmount               = 0;
      let totalAmount             = differenceAmount;
      if (gstClaim === 'Yes' && gstPercentage) {
        gstAmount   = (differenceAmount * gstPercentage) / 100;
        totalAmount = differenceAmount + gstAmount;
      }

      await (addInvoice as any)({
        userId:                userData?._id,
        planId:                selectedPackage._id,
        startDate,
        expiryDate,
        planPrice:             newPlanPrice,
        couponId:              selectedCoupon?._id || null,
        discountAmount,
        afterDiscount:         (values.afterDiscount as number) || newPlanPrice,
        gstClaim:              gstClaim === 'Yes',
        gstPercentage:         gstClaim === 'Yes' ? gstPercentage : 0,
        gstAmount,
        gstNumber:             values.gstNumber ?? null,
        registeredCompanyName: values.registeredCompanyName ?? null,
        totalInvoiceAmount:    totalAmount,
        dueAmount:             paymentType === 'fullPayment' ? 0 : (values.dueAmount as number) || 0,
        paymentType,
        paymentDate:           startDate,
        paymentTerm:           paymentTerms,
        invoiceType:           'upgrade',
        coachId:               null,
        lockerNumber:          null,
        salesPersonId:         values.salesPersonId || null,
        details:               selectedPackage.items?.map(item => ({
          itemName: item.name,
          quantity: item.quantity || 1,
          planId:   selectedPackage._id,
        })) ?? [],
      }).unwrap();

      await refetchUserData();
      form.resetFields();
      setSelectedPackage(null);
      navigate(`/user-detail/${id}/membership`);
    } catch (error) {
      console.error('Error upgrading plan:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Render ────────────────────────────────────────────────────────── */

  const planOptions = packages
    .filter(pkg => pkg.type === 'membership' || pkg.type === 'trial')
    .map(pkg => ({ label: `${pkg.name} - ₹${pkg.pricing} - ${pkg.numberOfDays} days`, value: pkg._id }));

  const salesPersonOptions = salesPersons.map(p => ({ label: p.name || p._id, value: p._id }));

  const couponOptions = coupons.map(c => ({
    label: `${c.code} - ${c.discountType === 'percentage' ? `${c.value}%` : `₹${c.value}`} off`,
    value: c._id,
  }));

  return (
    <div className="upgrade-plan-container">
      <Card className="upgrade-plan-card">
        <h2>Upgrade Membership Plan</h2>

        <Form form={form} layout="vertical" onFinish={handleSubmit} onFinishFailed={onFinishFailed} className="upgrade-form">
          <div className="form-row">
            <Form.Item name="invoiceDate" label="Invoice Date" rules={[{ required: true, message: 'Invoice date is required' }]}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled />
            </Form.Item>
            <Form.Item name="paymentDate" label="Payment Date" rules={[{ required: true, message: 'Payment date is required' }]}>
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                disabledDate={current => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item name="plan" label="Plan" rules={[{ required: true, message: 'Please select a plan' }]}>
              <Select
                placeholder="Select Package"
                loading={packagesLoading}
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={planOptions}
                onChange={(v: string) => handlePackageChange(v)}
              />
            </Form.Item>

            <Form.Item name="paymentType" label="Payment Type" rules={[{ required: true, message: 'Payment type is required' }]}>
              <Select options={[{ value: 'fullPayment', label: 'Full Payment' }]} onChange={(v: string) => setPaymentType(v)} />
            </Form.Item>

            <Form.Item name="salesPersonId" label="Sales Person" rules={[{ required: true, message: 'Please select sales person' }]}>
              <Select
                placeholder="Select Sales Person"
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={salesPersonOptions}
              />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item name="previousInvoiceAmount" label="Previous Invoice Amount">
              <InputNumber style={{ width: '100%' }} placeholder="10000" prefix="₹" disabled onChange={() => calculateAmounts()} />
            </Form.Item>
            <Form.Item name="newPlanPrice" label="New Plan Price">
              <InputNumber style={{ width: '100%' }} placeholder="0" disabled prefix="₹" />
            </Form.Item>
            <Form.Item name="differenceAmount" label="Difference Amount">
              <InputNumber style={{ width: '100%' }} placeholder="0" disabled prefix="₹" />
            </Form.Item>

            <Form.Item name="couponSelect" label="Coupon (Optional)">
              <Select
                placeholder="Select coupon"
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
              <InputNumber style={{ width: '100%' }} placeholder="0" disabled prefix="₹" />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item name="totalPayableAmount" label="Total Payable Amount">
              <InputNumber style={{ width: '100%' }} placeholder="0" disabled prefix="₹" />
            </Form.Item>

            <Form.Item name="gstClaim" label="GST Claim" rules={[{ required: true, message: 'GST claim is required' }]}>
              <Select options={gstClaimOptions} onChange={(v: string) => handleGstClaimChange(v)} />
            </Form.Item>

            {gstClaim === 'Yes' && (
              <>
                <Form.Item name="gstNumber" label="GST Number" rules={[{ required: true, message: 'GST number is required' }]}>
                  <Input placeholder="GST Number" />
                </Form.Item>
                <Form.Item name="registeredCompanyName" label="Registered Company Name" rules={[{ required: true, message: 'Company name is required' }]}>
                  <Input placeholder="Registered Company Name" />
                </Form.Item>
              </>
            )}
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
                          if (value) {
                            const totalPayable = form.getFieldValue('totalPayableAmount') || 0;
                            const fv = form.getFieldsValue();
                            let calculatedTotal = 0;
                            paymentModes.forEach(pm => { calculatedTotal += Number(fv[`paymentAmount_${pm.id}`] || 0); });
                            if (calculatedTotal > totalPayable)
                              return Promise.reject(new Error(`Amount exceeds by ₹${(calculatedTotal - totalPayable).toFixed(2)}. Maximum allowed: ₹${totalPayable.toFixed(2)}`));
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
                    <Form.Item name={`chequeScreenshot_${payment.id}`} label="Upload Cheque Image" rules={[{ required: true, message: 'Please upload cheque image' }]}>
                      <ImagePicker form={form} name={`chequeScreenshot_${payment.id}`} />
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

            {selectedPackage && paymentType === 'fullPayment' && remainingAmount > 0 && (
              <div className="remaining-balance">
                <div style={{ color: '#fa1414ff', fontSize: '14px', fontWeight: '500' }}>
                  <strong>Remaining Balance:</strong> ₹{remainingAmount.toFixed(2)}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {selectedPackage && (
            <Card className="package-summary" size="small" title="Order Summary">
              <div className="summary-row">
                <span><strong>New Plan:</strong> {selectedPackage.name}</span>
                <span><strong>New Plan Price:</strong> ₹{selectedPackage.pricing}</span>
              </div>
              <div className="summary-row">
                <span><strong>Current Plan:</strong> {currentPlan?.name || 'N/A'}</span>
                <span style={{ color: '#ff4d4f', fontWeight: 600 }}>
                  <strong style={{ color: 'white' }}>Previous Invoice Amount:</strong> ₹-{form.getFieldValue('previousInvoiceAmount') || 0}
                </span>
              </div>
              <div className="summary-row">
                <span><strong>Discount{selectedCoupon ? ` (${selectedCoupon.code})` : ''}:</strong></span>
                <span style={{ color: '#ff4d4f', fontWeight: 600 }}>-₹{discountAmount.toFixed(2)}</span>
              </div>
              {gstClaim === 'Yes' && gstPercentage && (
                <div className="summary-row">
                  <span><strong>GST ({gstPercentage}%):</strong></span>
                  <span>₹{((form.getFieldValue('differenceAmount') || 0) * gstPercentage / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span><strong>Total Payable:</strong></span>
                <span>₹{form.getFieldValue('totalPayableAmount') || 0}</span>
              </div>
              {totalPaidAmount > 0 && (
                <>
                  <div className="summary-row"><span><strong>Base Amount (without GST):</strong></span><span>₹{(totalPaidAmount / 1.05).toFixed(2)}</span></div>
                  <div className="summary-row"><span><strong>SGST (2.5%):</strong></span><span>₹{((totalPaidAmount / 1.05) * 0.025).toFixed(2)}</span></div>
                  <div className="summary-row"><span><strong>CGST (2.5%):</strong></span><span>₹{((totalPaidAmount / 1.05) * 0.025).toFixed(2)}</span></div>
                  <div className="summary-row"><span><strong>Total Paid (with GST):</strong></span><span>₹{totalPaidAmount.toFixed(2)}</span></div>
                </>
              )}
            </Card>
          )}

          <div className="form-actions">
            <Button onClick={() => navigate(`/user-detail/${id}/membership`)} className="cancel-btn" size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="submit-btn"
              size="large"
              loading={loading || addingInvoice}
              disabled={(() => {
                if (!selectedPackage) return true;
                const totalPayable = form.getFieldValue('totalPayableAmount') || 0;
                if (totalPaidAmount > totalPayable) return true;
                if (paymentType === 'fullPayment') return totalPaidAmount < totalPayable;
                return false;
              })()}
            >
              Upgrade Plan
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default UpgradePlan;
