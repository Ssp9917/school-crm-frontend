import { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Card, InputNumber, Input, notification } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import dayjs from 'dayjs';
import { useGetUserAddOnsQuery } from '../../../services/membership';
import { useGetOpenAddonPlansQuery } from '../../../services/package';
import { useGetOpenCouponsQuery } from '../../../services/coupons';
import { useAddInvoiceMutation } from '../../../services/invoice';
import ImagePicker from '../../form/ImagePicker';
import '../buyAddOnService/styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface UserOutletContext {
  userData?: {
    addonPreviousInvoiceAmount?: number;
  };
}

interface Plan {
  _id: string;
  name?: string;
  pricing?: number;
  numberOfDays?: number;
  addonType?: string;
}

interface AddonMembership {
  _id?: string;
  planId?: { _id?: string; name?: string };
  addonType?: string;
  totalPaid?: number;
  totalInvoicedAmount?: number;
  totalInvoiced?: number;
  coachId?: { _id?: string };
}

interface Coupon {
  _id?: string;
  code?: string;
  discountType?: string;
  value?: number;
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

const gstOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no',  label: 'No'  },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const AddonUpgrade = () => {
  const { id: userId, membershipId } = useParams<{ id: string; membershipId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading]             = useState(false);
  const [gstClaim, setGstClaim]           = useState(false);
  const [paymentModes, setPaymentModes]   = useState<PaymentMode[]>([{ id: 1, mode: '', amount: '' }]);
  const [totalPaidAmount, setTotalPaidAmount]   = useState(0);
  const [remainingAmount, setRemainingAmount]   = useState(0);
  const [selectedPlan, setSelectedPlan]         = useState<Plan | null>(null);
  const [selectedCoupon, setSelectedCoupon]     = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount]     = useState(0);

  const { userData } = useOutletContext<UserOutletContext>() ?? {};

  const { data: addonsData }                              = useGetUserAddOnsQuery(userId);
  const { data: packagesData, isLoading: packagesLoading } = useGetOpenAddonPlansQuery({ type: 'addon', membershipId });
  const { data: couponsData,  isLoading: couponsLoading }  = useGetOpenCouponsQuery(undefined);
  const [addInvoice, { isLoading: addingInvoice }]        = useAddInvoiceMutation();

  const membership       = (addonsData as any)?.data?.find((m: AddonMembership) => m._id === membershipId) as AddonMembership | undefined;
  const allPlans         = (packagesData as any)?.data as Plan[] ?? [];
  const upgradablePlans  = membership
    ? allPlans.filter(p => p.addonType === membership.addonType && p._id !== membership.planId?._id)
    : allPlans;
  const coupons: Coupon[] = (couponsData as any)?.data ?? [];

  const previousInvoiced = membership?.totalPaid ?? userData?.addonPreviousInvoiceAmount ?? membership?.totalInvoicedAmount ?? membership?.totalInvoiced ?? 0;
  const newPlanPrice     = selectedPlan?.pricing ?? 0;
  const differenceAmount = Math.max(0, newPlanPrice - previousInvoiced);
  const afterDiscount    = Math.max(0, differenceAmount - discountAmount);
  const totalPayable     = gstClaim ? afterDiscount * 1.05 : afterDiscount;

  useEffect(() => {
    if (membership) {
      form.setFieldsValue({
        invoiceDate:           dayjs(),
        paymentDate:           dayjs(),
        currentPlanName:       membership.planId?.name ?? 'N/A',
        previousInvoiceAmount: previousInvoiced,
      });
    }
  }, [membership, form, previousInvoiced]);

  const handleCouponChange = (couponId: string) => {
    const coupon = coupons.find(c => c._id === couponId) ?? null;
    setSelectedCoupon(coupon);
    let discount = 0;
    if (coupon && differenceAmount > 0) {
      discount = coupon.discountType === 'percentage'
        ? (differenceAmount * (coupon.value ?? 0)) / 100
        : (coupon.value ?? 0);
      discount = Math.min(discount, differenceAmount);
    }
    setDiscountAmount(discount);
  };

  useEffect(() => {
    form.setFieldsValue({ differenceAmount, afterDiscount });
    calculatePaymentAmounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlan, gstClaim, differenceAmount, afterDiscount, totalPayable, discountAmount]);

  const calculatePaymentAmounts = () => {
    const fv = form.getFieldsValue();
    let total = 0;
    paymentModes.forEach(p => { total += Number(fv[`paymentAmount_${p.id}`] || 0); });
    setTotalPaidAmount(total);
    setRemainingAmount(Math.max(0, totalPayable - total));
  };

  useEffect(() => { calculatePaymentAmounts(); }, [paymentModes.length, totalPayable]);

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
    setTimeout(() => calculatePaymentAmounts(), 100);
  };

  const addPaymentMode = () => {
    const newId = Math.max(...paymentModes.map(p => p.id)) + 1;
    setPaymentModes(prev => [...prev, { id: newId, mode: '', amount: '' }]);
  };

  const removePaymentMode = (paymentId: number) => {
    if (paymentModes.length > 1) {
      setPaymentModes(prev => prev.filter(p => p.id !== paymentId));
      setTimeout(() => calculatePaymentAmounts(), 100);
    }
  };

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
    if (!selectedPlan) return;
    setLoading(true);
    try {
      const paymentTerms: object[] = [];
      paymentModes.forEach(payment => {
        const mode   = values[`paymentMode_${payment.id}`] as string;
        const amount = values[`paymentAmount_${payment.id}`];
        if (!mode || !amount) return;
        if (mode === 'cash')
          paymentTerms.push({ modeOfPayment: 'cash', amount, receivedBy: values[`cashEmployee_${payment.id}`] || '', receipt: [] });
        else if (mode === 'upi')
          paymentTerms.push({ modeOfPayment: 'upi', amount, receipt: values[`upiScreenshot_${payment.id}`] ? [values[`upiScreenshot_${payment.id}`]] : [], referenceId: values[`upiReferenceId_${payment.id}`] || null });
        else if (mode === 'card')
          paymentTerms.push({ modeOfPayment: 'card', amount, receipt: values[`cardScreenshot_${payment.id}`] ? [values[`cardScreenshot_${payment.id}`]] : [] });
        else if (mode === 'cheque')
          paymentTerms.push({ modeOfPayment: 'cheque', amount, chequeNumber: values[`chequeNumber_${payment.id}`] || '', receipt: values[`chequeScreenshot_${payment.id}`] ? [values[`chequeScreenshot_${payment.id}`]] : [] });
        else if (mode === 'banktransfer')
          paymentTerms.push({ modeOfPayment: 'banktransfer', amount, receipt: values[`transferScreenshot_${payment.id}`] ? [values[`transferScreenshot_${payment.id}`]] : [] });
        else if (mode === 'creditnote')
          paymentTerms.push({ modeOfPayment: 'creditnote', amount, receipt: values[`creditNoteUpload_${payment.id}`] ? [values[`creditNoteUpload_${payment.id}`]] : [] });
      });

      const startDate = values.paymentDate
        ? dayjs(values.paymentDate as dayjs.Dayjs).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD');
      const endDate   = dayjs(startDate).add((selectedPlan.numberOfDays ?? 90) - 1, 'days').format('YYYY-MM-DD');
      const gstAmount = gstClaim ? afterDiscount * 0.05 : 0;

      await (addInvoice as any)({
        userId,
        membershipId,
        planId:                  selectedPlan._id,
        type:                    'addon',
        addonType:               membership?.addonType,
        startDate,
        expiryDate:              endDate,
        planPrice:               newPlanPrice,
        couponId:                selectedCoupon?._id ?? null,
        discountAmount,
        afterDiscount,
        gstClaim,
        gstPercentage:           gstClaim ? 5 : 0,
        gstAmount,
        gstNumber:               values.gstNumber ?? null,
        registeredCompanyName:   values.registeredCompanyName ?? null,
        totalInvoiceAmount:      totalPayable,
        dueAmount:               0,
        paymentType:             'fullPayment',
        paymentDate:             startDate,
        paymentTerm:             paymentTerms,
        invoiceType:             'upgrade',
        coachId:                 membership?.coachId?._id ?? null,
        previousInvoiceAmount:   previousInvoiced,
      }).unwrap();

      navigate(`/user-detail/${userId}/addon-service`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Derived option arrays ──────────────────────────────────────────── */

  const planOptions = upgradablePlans.length > 0
    ? upgradablePlans.map(p => ({ label: `${p.name} — ₹${p.pricing}`, value: p._id }))
    : [{ label: 'No upgrade plans available', value: '', disabled: true }];

  const couponOptions = coupons.map(c => ({
    label: `${c.code} - ${c.discountType === 'percentage' ? `${c.value}%` : `₹${c.value}`} off`,
    value: c._id,
  }));

  return (
    <div className="buy-addon-service-container">
      <div className="form-header">
        <h2>
          Upgrade Add-On Plan
          {membership?.addonType && (
            <span style={{ fontSize: '16px', fontWeight: 400, color: 'var(--muted)', marginLeft: '10px' }}>
              — {membership.addonType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          )}
        </h2>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed} className="custom-form">
        <div className="row">
          <Form.Item name="invoiceDate" label="Invoice Date">
            <DatePicker style={{ width: '100%', height: '46px' }} disabled format="DD-MM-YYYY" />
          </Form.Item>
          <Form.Item name="paymentDate" label="Payment Date" rules={[{ required: true, message: 'Please select payment date' }]}>
            <DatePicker
              style={{ width: '100%', height: '46px' }}
              format="DD-MM-YYYY"
              disabledDate={current => current && current > dayjs().endOf('day')}
            />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="currentPlanName" label="Current Plan">
            <Input disabled />
          </Form.Item>
          <Form.Item name="previousInvoiceAmount" label="Previous Invoice Amount">
            <InputNumber
              disabled
              style={{ width: '100%' }}
              formatter={numFmt as any}
              parser={numParse as any}
            />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="newPlan" label="Upgrade To Plan" rules={[{ required: true, message: 'Please select a plan' }]}>
            <Select
              placeholder="Select upgrade plan"
              loading={packagesLoading}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={planOptions as any}
              onChange={(planId: string) => setSelectedPlan(allPlans.find(p => p._id === planId) ?? null)}
            />
          </Form.Item>
          {selectedPlan && (
            <div className="row">
              <Form.Item name="differenceAmount" label="Difference Amount">
                <InputNumber
                  disabled
                  style={{ width: '100%' }}
                  formatter={numFmt as any}
                  parser={numParse as any}
                />
              </Form.Item>
            </div>
          )}
        </div>

        <div className="row">
          <Form.Item name="couponSelect" label="Coupon (Optional)">
            <Select
              placeholder="Choose coupon"
              loading={couponsLoading}
              allowClear
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={couponOptions}
              onChange={(id: string | undefined) => {
                if (id) handleCouponChange(id);
                else { setSelectedCoupon(null); setDiscountAmount(0); }
              }}
            />
          </Form.Item>
          <Form.Item name="afterDiscount" label="After Discount">
            <InputNumber
              disabled
              style={{ width: '100%' }}
              formatter={numFmt as any}
              parser={numParse as any}
            />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="gstClaim" label="GST Claim" rules={[{ required: true, message: 'Please select GST claim' }]}>
            <Select
              placeholder="Select GST claim"
              options={gstOptions}
              onChange={(v: string) => setGstClaim(v === 'yes')}
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
                          const fv = form.getFieldsValue();
                          let total = 0;
                          paymentModes.forEach(pm => { total += Number(fv[`paymentAmount_${pm.id}`] || 0); });
                          if (total > totalPayable)
                            return Promise.reject(new Error(`Exceeds total payable ₹${totalPayable.toFixed(2)}`));
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
                    onChange={(v) => handlePaymentAmountChange(v, payment.id)}
                  />
                </Form.Item>
                <div className="payment-actions">
                  {index === paymentModes.length - 1 && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={addPaymentMode} style={{ marginRight: '8px' }}>
                      Add
                    </Button>
                  )}
                  {paymentModes.length > 1 && (
                    <Button danger icon={<DeleteOutlined />} onClick={() => removePaymentMode(payment.id)}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              <Form.Item
                noStyle
                shouldUpdate={(p, c) => p[`paymentMode_${payment.id}`] !== c[`paymentMode_${payment.id}`]}
              >
                {() => {
                  const mode = form.getFieldValue(`paymentMode_${payment.id}`);
                  if (mode === 'cash')
                    return <div className="row payment-details"><Form.Item name={`cashEmployee_${payment.id}`} label="Employee (Cash Handler)" rules={[{ required: true, message: 'Required' }]}><Input placeholder="Employee handling cash" /></Form.Item></div>;
                  if (mode === 'upi')
                    return <div className="row payment-details"><Form.Item name={`upiScreenshot_${payment.id}`} label="UPI Screenshot" rules={[{ required: true, message: 'Required' }]}><ImagePicker form={form} name={`upiScreenshot_${payment.id}`} /></Form.Item><Form.Item name={`upiReferenceId_${payment.id}`} label="UPI Reference ID"><Input placeholder="Optional" /></Form.Item></div>;
                  if (mode === 'card')
                    return <div className="row payment-details"><Form.Item name={`cardScreenshot_${payment.id}`} label="Card Screenshot" rules={[{ required: true, message: 'Required' }]}><ImagePicker form={form} name={`cardScreenshot_${payment.id}`} /></Form.Item></div>;
                  if (mode === 'cheque')
                    return <div className="row payment-details"><Form.Item name={`chequeNumber_${payment.id}`} label="Cheque Number" rules={[{ required: true, message: 'Required' }]}><Input placeholder="Cheque number" /></Form.Item><Form.Item name={`chequeScreenshot_${payment.id}`} label="Cheque Image" rules={[{ required: true, message: 'Required' }]}><ImagePicker form={form} name={`chequeScreenshot_${payment.id}`} /></Form.Item></div>;
                  if (mode === 'banktransfer')
                    return <div className="row payment-details"><Form.Item name={`transferScreenshot_${payment.id}`} label="Transfer Screenshot" rules={[{ required: true, message: 'Required' }]}><ImagePicker form={form} name={`transferScreenshot_${payment.id}`} /></Form.Item></div>;
                  if (mode === 'creditnote')
                    return <div className="row payment-details"><Form.Item name={`creditNoteUpload_${payment.id}`} label="Credit Note" rules={[{ required: true, message: 'Required' }]}><ImagePicker form={form} name={`creditNoteUpload_${payment.id}`} /></Form.Item></div>;
                  return null;
                }}
              </Form.Item>
            </div>
          ))}
        </div>

        {selectedPlan && (
          <Card className="package-summary" size="small" title="Order Summary">
            <div className="summary-row">
              <span><strong>Plan:</strong> {selectedPlan.name}</span>
              <span><strong>Difference Amount:</strong> ₹{differenceAmount.toLocaleString()}</span>
            </div>
            {selectedCoupon && (
              <div className="summary-row">
                <span><strong>Coupon:</strong> {selectedCoupon.code}</span>
                <span><strong>Discount:</strong> -₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row">
              <span><strong>After Discount:</strong></span>
              <span>₹{afterDiscount.toFixed(2)}</span>
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
          </Card>
        )}

        <div className="footer-buttons">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading || addingInvoice}
            className="save-btn"
            disabled={!selectedPlan || totalPaidAmount <= 0 || totalPaidAmount < totalPayable}
          >
            Upgrade Plan
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddonUpgrade;
