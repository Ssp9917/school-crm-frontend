import { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Card, InputNumber, Input, notification } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useGetUserAddOnsQuery } from '../../../services/membership';
import { useGetOpenAddonPlansQuery } from '../../../services/package';
import { useGetOpenCouponsQuery } from '../../../services/coupons';
import { useGetOpenTrainersQuery } from '../../../services/trainer';
import { useAddInvoiceMutation } from '../../../services/invoice';
import ImagePicker from '../../form/ImagePicker';
import '../buyAddOnService/styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface PaymentMode {
  id: number;
  mode: string;
  amount: string | number;
}

interface Plan {
  _id: string;
  name?: string;
  pricing?: number;
  numberOfDays?: number;
  addonType?: string;
}

interface Coupon {
  _id: string;
  code?: string;
  discountType?: string;
  value?: number;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

const numFmt   = (v: number | string | undefined) => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const numParse = (v: string | undefined) => v ? v.replace(/₹\s?|(,*)/g, '') : '';

const paymentModeOptions = [
  { value: 'cash',         label: 'Cash'         },
  { value: 'card',         label: 'Card'         },
  { value: 'upi',          label: 'UPI'          },
  { value: 'banktransfer', label: 'Bank Transfer' },
  { value: 'cheque',       label: 'Cheque'       },
  { value: 'creditnote',   label: 'Credit Note'  },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const AddonRenew = () => {
  const { id: userId, membershipId } = useParams<{ id: string; membershipId: string }>();
  const navigate    = useNavigate();
  const branchId    = useSelector((state: any) => state.branch.selectedBranch);
  const selectedBranchId: string | undefined =
    typeof branchId === 'object' ? (branchId?._id || branchId?.id) : branchId;

  const [form] = Form.useForm();

  const [loading,          setLoading]          = useState(false);
  const [gstClaim,         setGstClaim]         = useState(false);
  const [selectedCoupon,   setSelectedCoupon]   = useState<Coupon | null>(null);
  const [discountAmount,   setDiscountAmount]   = useState(0);
  const [paymentModes,     setPaymentModes]     = useState<PaymentMode[]>([{ id: 1, mode: '', amount: '' }]);
  const [paymentType,      setPaymentType]      = useState('');
  const [totalPaidAmount,  setTotalPaidAmount]  = useState(0);
  const [remainingAmount,  setRemainingAmount]  = useState(0);
  const [planPrice,        setPlanPrice]        = useState(0);
  const [selectedPlan,     setSelectedPlan]     = useState<Plan | null>(null);

  const gstPercentage = 5;

  const { data: addonsData }                                        = useGetUserAddOnsQuery(userId);
  const { data: packagesData, isLoading: packagesLoading }          = useGetOpenAddonPlansQuery({ type: 'addon', membershipId });
  const { data: couponsData,  isLoading: couponsLoading }           = useGetOpenCouponsQuery(undefined);
  const { data: trainersData, isLoading: trainersLoading }          = useGetOpenTrainersQuery({ page: 1, limit: 100, branchId: selectedBranchId || undefined });
  const [addInvoice,          { isLoading: addingInvoice }]         = useAddInvoiceMutation();

  const membership = (addonsData as any)?.data?.find((m: any) => m._id === membershipId);
  const allPlans   = (packagesData as any)?.data || [];
  const renewPlans: Plan[] = membership ? allPlans.filter((p: Plan) => p.addonType === membership.addonType) : allPlans;
  const coupons: Coupon[]  = (couponsData as any)?.data || [];

  const calculateTotals = (basePrice: number, coupon: Coupon | null, isGstClaim: boolean) => {
    let discountAmt = 0;
    if (coupon) discountAmt = coupon.discountType === 'percentage' ? (basePrice * (coupon.value ?? 0)) / 100 : (coupon.value ?? 0);
    const priceAfterDiscount = Math.max(0, basePrice - discountAmt);
    const gstAmount = isGstClaim ? (priceAfterDiscount * gstPercentage) / 100 : 0;
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

  useEffect(() => { calculatePaymentAmounts(); }, [planPrice, discountAmount, gstClaim, paymentModes.length]);

  const handlePlanSelect = (planId: string) => {
    const plan: Plan | undefined = allPlans.find((p: Plan) => p._id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setPaymentType('');
      form.setFieldsValue({ planPrice: plan.pricing, paymentType: undefined });
      setPlanPrice(plan.pricing ?? 0);
      calculateTotals(plan.pricing ?? 0, selectedCoupon, gstClaim);
    }
  };

  const handleStartDateChange = (date: dayjs.Dayjs | null) => {
    if (date && selectedPlan) {
      const endDate = dayjs(date).add((selectedPlan.numberOfDays || 30) - 1, 'days').endOf('day');
      form.setFieldsValue({ endDate });
    }
  };

  const handlePaymentModeChange = (mode: string, paymentId: number) => {
    setPaymentModes(prev => prev.map(p => p.id === paymentId ? { ...p, mode } : p));
    if (mode === 'cash') {
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if (u.name) form.setFieldsValue({ [`cashEmployee_${paymentId}`]: u.name });
      } catch { /* silent */ }
    }
  };

  const handlePaymentAmountChange = (amount: number | string | null, paymentId: number) => {
    setPaymentModes(prev => prev.map(p => p.id === paymentId ? { ...p, amount: amount ?? '' } : p));
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
    notification.error({ message: 'Required Fields Missing', description: [...new Set(labels)].join(', '), placement: 'topRight', duration: 4 });
  };

  const onFinish = async (values: Record<string, any>) => {
    setLoading(true);
    try {
      const afterDiscountAmount = planPrice - discountAmount;
      if (paymentType === 'partial'     && totalPaidAmount < afterDiscountAmount * 0.5) { setLoading(false); return; }
      if (paymentType === 'fullPayment' && totalPaidAmount < afterDiscountAmount)        { setLoading(false); return; }

      const gstAmount: number = gstClaim ? (afterDiscountAmount * gstPercentage) / 100 : 0;
      const paymentTerms: any[] = [];

      paymentModes.forEach(payment => {
        const mode   = values[`paymentMode_${payment.id}`];
        const amount = values[`paymentAmount_${payment.id}`];
        if (!mode || !amount) return;
        if (mode === 'cash')         paymentTerms.push({ modeOfPayment: 'cash',         amount, receivedBy: values[`cashEmployee_${payment.id}`] || '', receipt: [] });
        else if (mode === 'upi')     paymentTerms.push({ modeOfPayment: 'upi',          amount, receipt: values[`upiScreenshot_${payment.id}`]   ? [values[`upiScreenshot_${payment.id}`]]   : [], referenceId: values[`upiReferenceId_${payment.id}`] || null });
        else if (mode === 'card')    paymentTerms.push({ modeOfPayment: 'card',         amount, receipt: values[`cardScreenshot_${payment.id}`]  ? [values[`cardScreenshot_${payment.id}`]]  : [] });
        else if (mode === 'cheque')  paymentTerms.push({ modeOfPayment: 'cheque',       amount, chequeNumber: values[`chequeNumber_${payment.id}`] || '', receipt: values[`chequeScreenshot_${payment.id}`] ? [values[`chequeScreenshot_${payment.id}`]] : [] });
        else if (mode === 'banktransfer') paymentTerms.push({ modeOfPayment: 'banktransfer', amount, receipt: values[`transferScreenshot_${payment.id}`] ? [values[`transferScreenshot_${payment.id}`]] : [] });
        else if (mode === 'creditnote')   paymentTerms.push({ modeOfPayment: 'creditnote',   amount, receipt: values[`creditNoteUpload_${payment.id}`]   ? [values[`creditNoteUpload_${payment.id}`]]   : [] });
      });

      const payload = {
        userId,
        membershipId,
        planId:             selectedPlan?._id,
        type:               'addon',
        addonType:          membership?.addonType,
        startDate:          values.startDate  ? dayjs(values.startDate).format('YYYY-MM-DD')  : dayjs().format('YYYY-MM-DD'),
        endDate:            values.endDate    ? dayjs(values.endDate).format('YYYY-MM-DD')    : null,
        pricing:            planPrice,
        couponId:           selectedCoupon?._id || null,
        discountAmount,
        afterDiscount:      afterDiscountAmount,
        gstClaim,
        gstPercentage,
        gstAmount,
        totalInvoiceAmount: afterDiscountAmount + gstAmount,
        dueAmount:          paymentType === 'partial' ? remainingAmount : 0,
        paymentType:        values.paymentType || 'fullPayment',
        paymentDate:        values.paymentDate ? dayjs(values.paymentDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        paymentTerm:        paymentTerms,
        invoiceType:        'renew',
        coachId:            values.assignedTrainer || membership?.coachId?._id || null,
      };

      await (addInvoice as any)(payload).unwrap();
      navigate(`/user-detail/${userId}/addon-service`);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="buy-addon-service-container">
      <div className="form-header">
        <h2>Renew Add-On — {membership?.addonType?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</h2>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed} className="custom-form">
        <div className="row">
          <Form.Item name="invoiceDate" label="Invoice Date" initialValue={dayjs()}>
            <DatePicker style={{ width: '100%', height: '46px' }} disabled format="DD-MM-YYYY" />
          </Form.Item>
          <Form.Item name="paymentDate" label="Payment Date" rules={[{ required: true, message: 'Please select payment date' }]}>
            <DatePicker style={{ width: '100%', height: '46px' }} format="DD-MM-YYYY" disabledDate={current => current && current > dayjs().endOf('day')} />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="addOnPlan" label="Add-On Plan" rules={[{ required: true, message: 'Please select a plan' }]}>
            <Select
              placeholder="Choose add-on plan"
              loading={packagesLoading}
              showSearch
              onChange={handlePlanSelect}
              options={
                (renewPlans.length > 0
                  ? renewPlans.map(p => ({ value: p._id, label: `${p.name} — ₹${p.pricing}` }))
                  : [{ value: '', label: 'No plans available', disabled: true }]) as any
              }
            />
          </Form.Item>
          {selectedPlan && (
            <Form.Item name="assignedTrainer" label="Trainer" rules={[{ required: true, message: 'Please select a trainer' }]}>
              <Select
                placeholder="Choose trainer"
                loading={trainersLoading}
                showSearch
                options={(trainersData as any)?.data?.map((t: any) => ({
                  value: t._id,
                  label: `${t?.user?.name || 'Unknown'} - ${t.specialization?.join(', ') || 'N/A'}`,
                }))}
              />
            </Form.Item>
          )}
        </div>

        <div className="row">
          <Form.Item name="paymentType" label="Payment Type" rules={[{ required: true, message: 'Please select payment type' }]}>
            <Select
              placeholder="Select payment type"
              onChange={(v: string) => setPaymentType(v)}
              options={[
                { value: 'fullPayment', label: 'Full Payment' },
                ...(selectedPlan && (selectedPlan.numberOfDays ?? 0) > 75 ? [{ value: 'partial', label: 'Partial Payment' }] : []),
              ]}
            />
          </Form.Item>
          <Form.Item name="planPrice" label="Plan Price" rules={[{ required: true, message: 'Required' }]}>
            <InputNumber disabled style={{ width: '100%' }} formatter={numFmt} parser={numParse} />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="gstClaim" label="GST Claim" rules={[{ required: true, message: 'Required' }]}>
            <Select
              placeholder="Select GST claim"
              options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
              onChange={(v: string) => { const isGst = v === 'yes'; setGstClaim(isGst); if (planPrice) calculateTotals(planPrice, selectedCoupon, isGst); }}
            />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="couponSelect" label="Coupon (Optional)">
            <Select
              placeholder="Choose coupon"
              loading={couponsLoading}
              allowClear
              showSearch
              onChange={(id: string) => { const c = coupons.find(x => x._id === id) || null; setSelectedCoupon(c); if (planPrice) calculateTotals(planPrice, c, gstClaim); }}
              options={coupons.map(c => ({
                value: c._id,
                label: `${c.code} - ${c.discountType === 'percentage' ? `${c.value}%` : `₹${c.value}`} off`,
              }))}
            />
          </Form.Item>
          <Form.Item name="afterDiscount" label="After Discount">
            <InputNumber disabled style={{ width: '100%' }} formatter={numFmt} parser={numParse} />
          </Form.Item>
        </div>

        <div className="payment-modes-section">
          <h3 style={{ marginBottom: '16px', color: 'var(--sider-text)' }}>Payment Details</h3>
          {paymentModes.map((payment, index) => (
            <div key={payment.id} className="payment-group">
              <div className="row payment-row">
                <Form.Item name={`paymentMode_${payment.id}`} label={index === 0 ? 'Mode of Payment' : 'Additional Payment Mode'} rules={[{ required: true, message: 'Required' }]}>
                  <Select placeholder="Select payment mode" options={paymentModeOptions} onChange={(v: string) => handlePaymentModeChange(v, payment.id)} />
                </Form.Item>
                <Form.Item
                  name={`paymentAmount_${payment.id}`}
                  label="Amount"
                  rules={[
                    { required: true, message: 'Required' },
                    {
                      validator: (_, value) => {
                        if (value) {
                          const fv  = form.getFieldsValue();
                          let total = 0;
                          paymentModes.forEach(pm => { total += Number(fv[`paymentAmount_${pm.id}`] || 0); });
                          const max = planPrice - discountAmount + (gstClaim ? (planPrice - discountAmount) * gstPercentage / 100 : 0);
                          if (total > max) return Promise.reject(new Error(`Total (₹${total}) exceeds ₹${max.toFixed(2)}`));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber style={{ width: '100%' }} formatter={numFmt} parser={numParse} placeholder="Enter amount" min={0} onChange={v => handlePaymentAmountChange(v, payment.id)} />
                </Form.Item>
                <div className="payment-actions">
                  {index === paymentModes.length - 1 && <Button type="primary" icon={<PlusOutlined />} onClick={addPaymentMode} style={{ marginRight: '8px' }}>Add</Button>}
                  {paymentModes.length > 1 && <Button danger icon={<DeleteOutlined />} onClick={() => removePaymentMode(payment.id)}>Remove</Button>}
                </div>
              </div>
              <Form.Item noStyle shouldUpdate={(p, c) => p[`paymentMode_${payment.id}`] !== c[`paymentMode_${payment.id}`]}>
                {() => {
                  const mode = form.getFieldValue(`paymentMode_${payment.id}`);
                  if (mode === 'cash')         return <div className="row payment-details"><Form.Item name={`cashEmployee_${payment.id}`} label="Employee (Cash Handler)" rules={[{ required: true, message: 'Required' }]}><Input placeholder="Employee handling cash" /></Form.Item></div>;
                  if (mode === 'upi')          return <div className="row payment-details"><Form.Item name={`upiScreenshot_${payment.id}`} label="UPI Screenshot" rules={[{ required: true, message: 'Required' }]}><ImagePicker form={form} name={`upiScreenshot_${payment.id}`} /></Form.Item><Form.Item name={`upiReferenceId_${payment.id}`} label="UPI Reference ID"><Input placeholder="Optional" /></Form.Item></div>;
                  if (mode === 'card')         return <div className="row payment-details"><Form.Item name={`cardScreenshot_${payment.id}`} label="Card Screenshot" rules={[{ required: true, message: 'Required' }]}><ImagePicker form={form} name={`cardScreenshot_${payment.id}`} /></Form.Item></div>;
                  if (mode === 'cheque')       return <div className="row payment-details"><Form.Item name={`chequeNumber_${payment.id}`} label="Cheque Number" rules={[{ required: true, message: 'Required' }]}><Input placeholder="Cheque number" /></Form.Item><Form.Item name={`chequeScreenshot_${payment.id}`} label="Cheque Image" rules={[{ required: true, message: 'Required' }]}><ImagePicker form={form} name={`chequeScreenshot_${payment.id}`} /></Form.Item></div>;
                  if (mode === 'banktransfer') return <div className="row payment-details"><Form.Item name={`transferScreenshot_${payment.id}`} label="Transfer Screenshot" rules={[{ required: true, message: 'Required' }]}><ImagePicker form={form} name={`transferScreenshot_${payment.id}`} /></Form.Item></div>;
                  if (mode === 'creditnote')   return <div className="row payment-details"><Form.Item name={`creditNoteUpload_${payment.id}`} label="Credit Note" rules={[{ required: true, message: 'Required' }]}><ImagePicker form={form} name={`creditNoteUpload_${payment.id}`} /></Form.Item></div>;
                  return null;
                }}
              </Form.Item>
            </div>
          ))}
        </div>

        {selectedPlan && (
          <div className="row" style={{ marginTop: 16 }}>
            <Form.Item name="startDate" label="Start Date" rules={[{ required: true, message: 'Please select start date' }]}>
              <DatePicker style={{ width: '100%', height: '46px' }} format="DD-MM-YYYY" onChange={handleStartDateChange} />
            </Form.Item>
            <Form.Item name="endDate" label="End Date">
              <DatePicker style={{ width: '100%', height: '46px' }} format="DD-MM-YYYY" disabled />
            </Form.Item>
          </div>
        )}

        {planPrice > 0 && (
          <Card className="package-summary" size="small" title="Order Summary">
            <div className="summary-row"><span><strong>Plan:</strong> {selectedPlan?.name}</span><span><strong>Price:</strong> ₹{planPrice}</span></div>
            {selectedCoupon && <div className="summary-row"><span><strong>Coupon:</strong> {selectedCoupon.code}</span><span><strong>Discount:</strong> -₹{discountAmount.toFixed(2)}</span></div>}
            <div className="summary-row"><span><strong>After Discount:</strong></span><span>₹{(planPrice - discountAmount).toFixed(2)}</span></div>
            {paymentType === 'partial' && remainingAmount > 0 && <div className="summary-row"><span><strong>Due Balance:</strong></span><span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>₹{remainingAmount.toFixed(2)}</span></div>}
          </Card>
        )}

        <div className="footer-buttons">
          {selectedPlan && paymentType && (() => {
            const afterAmt = planPrice - discountAmount;
            const minPay   = afterAmt * 0.5;
            let disabled   = totalPaidAmount > afterAmt;
            if (!disabled && paymentType === 'partial')     disabled = totalPaidAmount < minPay;
            else if (!disabled && paymentType === 'fullPayment') disabled = totalPaidAmount < afterAmt;
            return (
              <Button type="primary" htmlType="submit" loading={loading || addingInvoice} className="save-btn" disabled={disabled}>
                Renew Add-On
              </Button>
            );
          })()}
        </div>
      </Form>
    </div>
  );
};

export default AddonRenew;
