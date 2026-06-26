import { useMemo, useState } from "react";
import { Modal, Carousel, Button } from "antd";
import CommonTable from "../../../components/commonTable";
import { useGetFeedbacksByPhoneQuery } from "../../../services/feedbacks";
import CustomPagination from "../../../components/pagination";
import getColumns from "./columns";
import { useOutletContext } from "react-router-dom";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface UserOutletContext {
  userData?: { phoneNumber?: string };
}

interface FeedbackRow {
  key: string | number;
  ticketId: string;
  department: string;
  branch: string;
  customerName: string;
  mobileNumber: string;
  email: string;
  feedback: string;
  images: string[];
  staffBehavior: string;
  gymHygiene: string;
  dateTime: string;
  status: string;
  assignToId?: string;
  assignToName?: string;
}

interface RawFeedback {
  _id?: string;
  ticketId?: string;
  departmentId?: { name?: string };
  department?: string;
  branchId?: { name?: string };
  branch?: string;
  customerName?: string;
  name?: string;
  mobileNumber?: string;
  phoneNumber?: string;
  phone?: string;
  email?: string;
  messageText?: string;
  feedback?: string;
  message?: string;
  images?: string[];
  staffBehavior?: string;
  gymHygiene?: string;
  dateTime?: string;
  createdAt?: string;
  status?: string;
  assignTo?: { _id?: string; user?: { name?: string } };
}

/* ─── Helper ─────────────────────────────────────────────────────────── */

const mapFeedbackToRow = (fb: RawFeedback, idx: number): FeedbackRow => ({
  key:           fb._id || idx,
  ticketId:      fb.ticketId      || '-',
  department:    fb.departmentId?.name || fb.department || '-',
  branch:        fb.branchId?.name    || fb.branch     || '-',
  customerName:  fb.customerName  || fb.name || '-',
  mobileNumber:  fb.mobileNumber  || fb.phoneNumber || fb.phone || '-',
  email:         fb.email         || '-',
  feedback:      fb.messageText   || fb.feedback || fb.message || '-',
  images:        fb.images        || [],
  staffBehavior: fb.staffBehavior || '-',
  gymHygiene:    fb.gymHygiene    || '-',
  dateTime:      fb.dateTime
    ? new Date(fb.dateTime).toLocaleString()
    : fb.createdAt
      ? new Date(fb.createdAt).toLocaleString()
      : '-',
  status:       fb.status        || '-',
  assignToId:   fb.assignTo?._id,
  assignToName: fb.assignTo?.user?.name,
});

/* ─── Component ──────────────────────────────────────────────────────── */

const UserFeedback = () => {
  const { userData }  = (useOutletContext<UserOutletContext>() || {}) as UserOutletContext;
  const mobileNumber  = typeof userData?.phoneNumber === 'string' ? userData.phoneNumber : '';

  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useGetFeedbacksByPhoneQuery(mobileNumber, { skip: !mobileNumber });

  const [feedbackModal, setFeedbackModal] = useState({ open: false, msg: '' });
  const [imageModal, setImageModal]       = useState<{ open: boolean; images: string[]; index: number }>({ open: false, images: [], index: 0 });

  const feedbacks = useMemo<FeedbackRow[]>(() => {
    if (!Array.isArray((data as any)?.data)) return [];
    return (data as any).data.map(mapFeedbackToRow);
  }, [data]);

  const handleViewFeedback = (row: FeedbackRow) => setFeedbackModal({ open: true, msg: row.feedback });
  const handleViewImages   = (imgs: string[], idx: number) => setImageModal({ open: true, images: imgs, index: idx });

  return (
    <div>
      <CommonTable
        columns={getColumns(handleViewFeedback, handleViewImages)}
        dataSource={feedbacks}
        loading={isLoading}
        rowKey="key"
        scroll={{ x: 1200 }}
      />
      <CustomPagination
        current={(data as any)?.pagination?.page || page}
        pageSize={(data as any)?.pagination?.limit || pageSize}
        total={(data as any)?.pagination?.total || 0}
        onPageChange={(p: number) => setPage(p)}
        onPageSizeChange={(size: number) => { setPageSize(size); setPage(1); }}
      />

      {/* Feedback text modal */}
      <Modal
        open={feedbackModal.open}
        onCancel={() => setFeedbackModal({ open: false, msg: '' })}
        footer={null}
        centered
        title={null}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8, textAlign: 'center' }}>Feedback Message</div>
          <div style={{ fontSize: 17, color: '#444', textAlign: 'center', wordBreak: 'break-word', padding: '8px 0 24px' }}>
            {feedbackModal.msg}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button type="primary" onClick={() => setFeedbackModal({ open: false, msg: '' })}>OK</Button>
        </div>
      </Modal>

      {/* Image carousel modal */}
      <Modal
        open={imageModal.open}
        onCancel={() => setImageModal({ open: false, images: [], index: 0 })}
        footer={null}
        centered
        width={600}
        title={null}
        styles={{ body: { padding: 0 } }}
      >
        <Carousel
          initialSlide={imageModal.index}
          dots
          style={{ width: '100%', textAlign: 'center', background: '#000', borderRadius: 12 }}
        >
          {imageModal.images.map((img, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <img src={img} alt={`slide-${i}`} style={{ maxHeight: 380, maxWidth: '100%', objectFit: 'contain', margin: '0 auto' }} />
            </div>
          ))}
        </Carousel>
      </Modal>
    </div>
  );
};

export default UserFeedback;
