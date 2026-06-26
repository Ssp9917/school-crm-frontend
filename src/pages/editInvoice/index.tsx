import { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Card, InputNumber, Input, message, Spin, notification } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { useGetPlansQuery } from '../../services/package';
import { useGetBranchesQuery } from '../../services/branches';
import { useGetAllCouponQuery } from '../../services/coupons';
import { useGetEmployeeByCustomerQuery } from '../../services/employee';
import { useGetInvoiceByIdQuery, useUpdateInvoiceMutation } from '../../services/invoice';
import { AllInvoiceRoute } from '../../routes/routepath';
import ImagePicker from '../../components/form/ImagePicker';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface PaymentMode {
  id:     number;
  mode:   string;
  amount: string | number;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const GST_PERCENTAGE = 5;

const PAYMENT_MODE_OPTIONS = [
  { value: 'cash',         label: 'Cash'          },
  { value: 'card',         label: 'Card'          },
  { value: 'upi',          label: 'UPI'           },
  { value: 'banktransfer', label: 'Bank Transfer' },
  { value: 'cheque',       label: 'Cheque'        },
  { value: 'creditnote',   label: 'Credit Note'   },
];

const PAYMENT_TYPE_OPTIONS = [
  { value: 'fullPayment', label: 'Full Payment'    },
  { value: 'partial',     label: 'Partial Payment' },
];

const GST_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no',  label: 'No'  },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const EditInvoice = () => {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();
  const [form]   = Form.useForm();

  const [userData,        setUserData]        = useState<any | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [loading,         setLoading]         = useState(false);
  const [gstClaim,        setGstClaim]        = useState(false);
  const [selectedCoupon,  setSelectedCoupon]  = useState<any | null>(null);
  const [discountAmount,  setDiscountAmount]  = useState(0);
  const [paymentModes,    setPaymentModes]    = useState<PaymentMode[]>([{ id: 1, mode: '', amount: '' }]);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  const { data: invoiceData,  isLoading: invoiceLoading,   error: invoiceError   } =
    useGetInvoiceByIdQuery(id as any, { refetchOnMountOrArgChange: true });
  const { data: packagesData, isLoading: plansLoading     } = useGetPlansQuery({ limit: 1000 } as any);
  const { data: branchesData, isLoading: _branchesLoading } = useGetBranchesQuery(undefined);
  const { data: couponsData,  isLoading: couponsLoading   } = useGetAllCouponQuery({} as any);
  const { data: employeesData, isLoading: employeesLoading } = useGetEmployeeByCustomerQuery(
    (userData as any)?._id as any,
    { skip: !(userData as any)?._id }
  );
  const [updateInvoice, { isLoading: updatingInvoice }] = useUpdateInvoiceMutation();

  const packages: any[] = (packagesData as any)?.data || [];
  const coupons:  any[] = (couponsData  as any)?.data || [];

  /* invoice ka plan agar plans list me na ho (inactive/deleted/paginated out)
     to bhi Select me uska naam dikhe, ObjectId nahi */
  const currentInvoicePlan: any = (invoiceData as any)?.data?.planId;
  const planOptions = [
    ...(currentInvoicePlan?._id && !packages.some((p: any) => p._id === currentInvoicePlan._id)
      ? [{ value: currentInvoicePlan._id, label: `${currentInvoicePlan.name} - ₹${currentInvoicePlan.pricing}` }]
      : []),
    ...packages.map((pkg: any) => ({ value: pkg._id, label: `${pkg.name} - ₹${pkg.pricing}` })),
  ];

  /* ── Helpers ── */

  const calculateTotals = (basePrice: number, coupon: any, _isGstClaim: boolean, _gstPercent: number) => {
    let discountAmt = 0;
    if (coupon) {
      discountAmt = coupon.discountType === 'percentage'
        ? (basePrice * coupon.value) / 100
        : coupon.value;
    }
    const priceAfterDiscount = Math.max(0, basePrice - discountAmt);
    setDiscountAmount(discountAmt);
    form.setFieldsValue({ afterDiscount: priceAfterDiscount, totalOrderValue: priceAfterDiscount });
  };

  const calculatePaymentAmounts = () => {
    const formValues = form.getFieldsValue();
    let total = 0;
    paymentModes.forEach(payment => {
      total += Number(formValues[`paymentAmount_${payment.id}`] || 0);
    });
    setTotalPaidAmount(total);
    if (selectedPackage) {
      setRemainingAmount((selectedPackage.pricing - discountAmount) - total);
    }
  };

  /* ── Handlers ── */

  const handlePackageChange = (packageId: string) => {
    const pkg = packages.find((p: any) => p._id === packageId);
    setSelectedPackage(pkg);
    if (pkg) {
      calculateTotals(pkg.pricing, selectedCoupon, gstClaim, GST_PERCENTAGE);
      form.setFieldsValue({ planPrice: pkg.pricing });
    }
  };

  const handlePaymentModeChange = (mode: string, paymentId: number) => {
    setPaymentModes(prev => prev.map(p => p.id === paymentId ? { ...p, mode } : p));
    if (mode === 'cash') {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (loggedInUser.name) form.setFieldsValue({ [`cashEmployee_${paymentId}`]: loggedInUser.name });
      } catch (e) {
        console.error('Error reading from localStorage:', e);
      }
    }
  };

  const handlePaymentAmountChange = (amount: number | null, paymentId: number) => {
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

  const handleStartDateChange = (date: any) => {
    if (date && selectedPackage) {
      const endDate = dayjs(date).add((selectedPackage.numberOfDays || 30) - 1, 'days');
      form.setFieldsValue({ endDate });
    }
  };

  const handleCouponChange = (couponId: string) => {
    const coupon = coupons.find((c: any) => c._id === couponId);
    setSelectedCoupon(coupon);
    if (selectedPackage) calculateTotals(selectedPackage.pricing, coupon, gstClaim, GST_PERCENTAGE);
  };

  const handleGstClaimChange = (value: string) => {
    const isGstClaim = value === 'yes';
    setGstClaim(isGstClaim);
    if (selectedPackage) calculateTotals(selectedPackage.pricing, selectedCoupon, isGstClaim, GST_PERCENTAGE);
  };

  /* ── Effects ── */

  useEffect(() => {
    calculatePaymentAmounts();
  }, [selectedPackage, discountAmount, gstClaim, paymentModes.length]);

  useEffect(() => {
    const invoice: any = (invoiceData as any)?.data;
    if (!invoice) return;

    if (invoice.userId)   setUserData(invoice.userId);
    if (invoice.planId)   setSelectedPackage(invoice.planId);
    if (invoice.gstClaim !== undefined) setGstClaim(invoice.gstClaim);
    if (invoice.couponId) {
      setSelectedCoupon(invoice.couponId);
      setDiscountAmount(invoice.discountAmount || 0);
    }

    if (invoice.paymentDetails?.length > 0) {
      const loadedPayments: PaymentMode[] = invoice.paymentDetails.map((p: any, i: number) => ({
        id:     i + 1,
        mode:   p.modeOfPayment,
        amount: p.amount,
      }));
      setPaymentModes(loadedPayments);

      const paymentFieldValues: Record<string, any> = {};
      invoice.paymentDetails.forEach((p: any, i: number) => {
        const pid = i + 1;
        paymentFieldValues[`paymentMode_${pid}`]   = p.modeOfPayment;
        paymentFieldValues[`paymentAmount_${pid}`] = p.amount;
        paymentFieldValues[`paymentDate_${pid}`]   = p.paymentDate ? dayjs(p.paymentDate) : null;
        if (p.modeOfPayment === 'cash'   && p.receivedBy)               paymentFieldValues[`cashEmployee_${pid}`]    = p.receivedBy;
        if (p.modeOfPayment === 'upi'    && p.receipt?.length)          paymentFieldValues[`upiScreenshot_${pid}`]   = p.receipt[0];
        if (p.modeOfPayment === 'card'   && p.receipt?.length)          paymentFieldValues[`cardScreenshot_${pid}`]  = p.receipt[0];
        if (p.modeOfPayment === 'cheque') {
          paymentFieldValues[`chequeNumber_${pid}`] = p.chequeNumber || '';
          paymentFieldValues[`chequeDate_${pid}`]   = p.chequeDate ? dayjs(p.chequeDate) : null;
        }
      });
      form.setFieldsValue(paymentFieldValues);
    }

    const salesPersonId = invoice.employeeId?.user?._id || invoice.salesPersonId?._id;
    form.setFieldsValue({
      userId:                 invoice.userId?._id,
      branchId:               invoice.branchId?._id,
      planId:                 invoice.planId?._id,
      planPrice:              invoice.planPrice,
      startDate:              invoice.startDate    ? dayjs(invoice.startDate.split('T')[0])    : null,
      endDate:                invoice.expiryDate   ? dayjs(invoice.expiryDate.split('T')[0])   : null,
      invoiceDate:            invoice.invoiceDate  ? dayjs(invoice.invoiceDate.split('T')[0])  : null,
      paymentDate:            invoice.startDate    ? dayjs(invoice.startDate.split('T')[0])    : null,
      couponSelect:           invoice.couponId?._id,
      discountAmount:         invoice.discountAmount,
      afterDiscount:          invoice.afterDiscount,
      gstClaim:               invoice.gstClaim ? 'yes' : 'no',
      gstNumber:              invoice.gstNumber,
      registeredCompanyName:  invoice.registeredCompanyName,
      totalOrderValue:        invoice.totalAmount,
      paymentType:            invoice.paymentType === 'fullPayment' ? 'fullPayment' : 'partial',
      salesPerson:            salesPersonId,
      lockerNumber:           invoice.userMemberships?.[0]?.lockerNumber,
      coachId:                invoice.userMemberships?.[0]?.coachId,
    });
  }, [invoiceData, form]);

  /* ── onFinish ── */

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

  const onFinish = async (values: Record<string, any>) => {
    setLoading(true);
    try {
      const startDate = values.startDate
        ? dayjs(values.startDate).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD');
      const endDate = values.endDate
        ? dayjs(values.endDate).format('YYYY-MM-DD')
        : dayjs(startDate).add(selectedPackage?.numberOfDays || 30, 'days').format('YYYY-MM-DD');

      const payload = { id, startDate, expiryDate: endDate, paymentType: values.paymentType };

      await (updateInvoice as any)(payload).unwrap();
      message.success('Invoice updated successfully!');
      navigate(AllInvoiceRoute);
    } catch (error) {
      message.error('Failed to update invoice. Please try again.');
      console.error('Update invoice error:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ── Early returns ── */

  if (invoiceLoading) {
    return (
      <div className="buy-plan-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Loading invoice..." />
      </div>
    );
  }

  if (invoiceError) {
    return (
      <div className="buy-plan-container" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'red', fontSize: '16px' }}>Failed to load invoice. Please try again.</p>
      </div>
    );
  }

  /* ── Render ── */

  return (
    <div className="buy-plan-container">
      <div className="form-header">
        <h2>Edit Invoice</h2>
      </div>

      {userData && (
        <Card style={{ marginBottom: '24px', background: 'var(--hover-bg)', border: '1px solid var(--muted)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div><strong>Customer Name:</strong><div>{(userData as any).name}</div></div>
            <div><strong>Email:</strong><div>{(userData as any).email}</div></div>
            <div><strong>Phone Number:</strong><div>{(userData as any).phoneNumber}</div></div>
            <div><strong>Status:</strong><div style={{ textTransform: 'capitalize' }}>{(userData as any).status}</div></div>
          </div>
        </Card>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed as any}
        className="custom-form"
      >
        <div className="row">
          <Form.Item name="invoiceDate" label="Invoice Date" initialValue={dayjs()}>
            <DatePicker style={{ width: '100%', height: '46px' }} disabled placeholder="Invoice date" format="DD-MM-YYYY" />
          </Form.Item>
          <Form.Item name="paymentDate" label="Payment Date">
            <DatePicker
              style={{ width: '100%', height: '46px' }}
              placeholder="Select payment date"
              format="DD-MM-YYYY"
              disabled
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>
          <Form.Item name="salesPerson" label="Sales Person">
            <Select
              placeholder="Choose sales person"
              loading={employeesLoading}
              showSearch
              disabled
              options={(employeesData as any)?.data?.map((emp: any) => ({
                value: emp._id,
                label: `${emp?.name || 'Unknown'} - ${emp?.employeeId || emp?.roleId?.name || 'No ID'}`,
              })) || []}
            />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="planId" label="Plan Select">
            <Select
              placeholder="Choose plan"
              loading={plansLoading}
              onChange={handlePackageChange}
              showSearch
              disabled
              options={planOptions}
            />
          </Form.Item>
          <Form.Item name="paymentType" label="Payment Type">
            <Select placeholder="Select payment type" options={PAYMENT_TYPE_OPTIONS} />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="planPrice" label="Plan Price">
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => (value ?? '').replace(/₹\s?|(,*)/g, '') as any}
              disabled
              placeholder="Auto-filled from plan"
            />
          </Form.Item>
          <Form.Item name="couponSelect" label="Coupon Select">
            <Select
              placeholder="Choose coupon (optional)"
              loading={couponsLoading}
              onChange={handleCouponChange}
              disabled
              allowClear
              showSearch
              options={coupons.map((c: any) => ({
                value: c._id,
                label: `${c.code} - ${c.discountType === 'percentage' ? `${c.value}%` : `₹${c.value}`} off`,
              }))}
            />
          </Form.Item>
        </div>

        {selectedPackage && (
          <div className="row">
            <Form.Item name="afterDiscount" label="After Discount">
              <InputNumber
                style={{ width: '100%' }}
                formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => (value ?? '').replace(/₹\s?|(,*)/g, '') as any}
                disabled
                placeholder="Price after coupon discount"
              />
            </Form.Item>
            <Form.Item name="gstClaim" label="GST Claim">
              <Select placeholder="Select GST claim" onChange={handleGstClaimChange} disabled options={GST_OPTIONS} />
            </Form.Item>
          </div>
        )}

        {gstClaim && (
          <div className="row">
            <Form.Item name="gstNumber" label="GST Number">
              <Input placeholder="Enter GST number" disabled />
            </Form.Item>
            <Form.Item name="registeredCompanyName" label="Registered Company Name">
              <Input placeholder="Enter registered company name" disabled />
            </Form.Item>
          </div>
        )}

        {/* Payment Modes */}
        <div className="payment-modes-section">
          <h3 style={{ marginBottom: '16px', color: 'var(--sider-text)' }}>Payment Details</h3>
          {paymentModes.map((payment, index) => {
            const currentMode: string = form.getFieldValue(`paymentMode_${payment.id}`);
            return (
              <div key={payment.id} className="payment-group">
                <div className="row payment-row">
                  <Form.Item
                    name={`paymentMode_${payment.id}`}
                    label={index === 0 ? 'Mode of Payment' : 'Additional Payment Mode'}
                  >
                    <Select
                      placeholder="Select payment mode"
                      onChange={(value: string) => handlePaymentModeChange(value, payment.id)}
                      disabled
                      options={PAYMENT_MODE_OPTIONS}
                    />
                  </Form.Item>
                  <Form.Item name={`paymentAmount_${payment.id}`} label="Amount">
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => (value ?? '').replace(/₹\s?|(,*)/g, '') as any}
                      placeholder="Enter amount"
                      min={0}
                      disabled
                      onChange={(value) => handlePaymentAmountChange(value, payment.id)}
                    />
                  </Form.Item>
                  <div className="payment-actions" style={{ display: 'none' }}>
                    {index === paymentModes.length - 1 && (
                      <Button type="primary" icon={<PlusOutlined />} onClick={addPaymentMode} style={{ marginRight: '8px' }}>Add</Button>
                    )}
                    {paymentModes.length > 1 && (
                      <Button danger icon={<DeleteOutlined />} onClick={() => removePaymentMode(payment.id)}>Remove</Button>
                    )}
                  </div>
                </div>

                {currentMode === 'cash' && (
                  <div className="row payment-details">
                    <Form.Item name={`cashEmployee_${payment.id}`} label="Employee (Cash Handler)">
                      <Input placeholder="Employee handling cash payment" style={{ width: '100%' }} disabled />
                    </Form.Item>
                  </div>
                )}
                {currentMode === 'upi' && (
                  <div className="row payment-details">
                    <Form.Item name={`upiScreenshot_${payment.id}`} label="UPI Payment Screenshot">
                      <ImagePicker form={form} name={`upiScreenshot_${payment.id}`} />
                    </Form.Item>
                    <Form.Item name={`upiReferenceId_${payment.id}`} label="UPI Reference ID">
                      <Input placeholder="Enter UPI transaction reference ID (optional)" style={{ width: '100%' }} disabled />
                    </Form.Item>
                  </div>
                )}
                {currentMode === 'cheque' && (
                  <div className="row payment-details">
                    <Form.Item name={`chequeNumber_${payment.id}`} label="Cheque Number">
                      <Input placeholder="Enter cheque number" style={{ width: '100%' }} disabled />
                    </Form.Item>
                    <Form.Item name={`chequeScreenshot_${payment.id}`} label="Upload Cheque Image">
                      <ImagePicker form={form} name={`chequeScreenshot_${payment.id}`} />
                    </Form.Item>
                  </div>
                )}
                {currentMode === 'card' && (
                  <div className="row payment-details">
                    <Form.Item name={`cardScreenshot_${payment.id}`} label="Card Payment Screenshot">
                      <ImagePicker form={form} name={`cardScreenshot_${payment.id}`} />
                    </Form.Item>
                  </div>
                )}
                {currentMode === 'banktransfer' && (
                  <div className="row payment-details">
                    <Form.Item name={`transferScreenshot_${payment.id}`} label="Upload Transfer Screenshot">
                      <ImagePicker form={form} name={`transferScreenshot_${payment.id}`} />
                    </Form.Item>
                  </div>
                )}
                {currentMode === 'creditnote' && (
                  <div className="row payment-details">
                    <Form.Item name={`creditNoteUpload_${payment.id}`} label="Credit Note">
                      <ImagePicker form={form} name={`creditNoteUpload_${payment.id}`} />
                    </Form.Item>
                  </div>
                )}
              </div>
            );
          })}

          {selectedPackage && (
            <div className="remaining-balance">
              {remainingAmount > 0 ? (
                <span className="balance-text remaining">
                  <strong>Remaining Balance: ₹{remainingAmount.toFixed(2)}</strong>
                </span>
              ) : remainingAmount < 0 ? (
                <span className="balance-text" style={{ color: '#ff4d4f' }}>
                  <strong>Exceeded Amount: ₹{Math.abs(remainingAmount).toFixed(2)}</strong>
                </span>
              ) : (
                <span className="balance-text complete">
                  <strong>Remaining Balance: ₹{remainingAmount.toFixed(2)}</strong>
                </span>
              )}
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
              <span>₹{selectedCoupon ? (selectedPackage.pricing - discountAmount).toFixed(2) : selectedPackage.pricing}</span>
            </div>
            {gstClaim && (
              <>
                <div className="summary-row">
                  <span><strong>Base Amount (without GST):</strong></span>
                  <span>₹{((selectedPackage.pricing - discountAmount) / 1.05).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span><strong>SGST (2.5%):</strong></span>
                  <span>₹{(((selectedPackage.pricing - discountAmount) / 1.05) * 0.025).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span><strong>CGST (2.5%):</strong></span>
                  <span>₹{(((selectedPackage.pricing - discountAmount) / 1.05) * 0.025).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span><strong>Total Paid (with GST):</strong></span>
                  <span>₹{totalPaidAmount.toFixed(2)}</span>
                </div>
              </>
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
              <Form.Item name="startDate" label="Start Date">
                <DatePicker style={{ width: '100%', height: '46px' }} placeholder="Select start date" format="DD-MM-YYYY" onChange={handleStartDateChange} />
              </Form.Item>
              <Form.Item name="endDate" label="End Date">
                <DatePicker style={{ width: '100%', height: '46px' }} placeholder="Auto-calculated end date" format="DD-MM-YYYY" disabled />
              </Form.Item>
            </div>
          </div>
        )}

        <div className="footer-buttons">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading || updatingInvoice}
            className="save-btn"
            disabled={!selectedPackage}
          >
            Update Invoice
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditInvoice;
