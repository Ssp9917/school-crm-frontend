import { useEffect, useState } from "react";
import { Modal, Select, Button, Spin } from "antd";
import { useGetBranchesQuery } from "../../../services/branches";
import {
  useGenerateRegistrationQrMutation,
  useGetBranchRegistrationQrQuery,
} from "../../../services/qrCodes";
import "../QRModal/qrModal.scss";

interface AddUserQRModalProps {
  open:    boolean;
  onClose: () => void;
}

/* pull a QR image URL out of whatever shape the API returns */
const extractQrUrl = (res: any): string =>
  res?.qrCodeUrl ||
  res?.qrCode ||
  res?.url ||
  res?.data?.qrCodeUrl ||
  res?.data?.qrCode ||
  res?.data?.url ||
  "";

const AddUserQRModal = ({ open, onClose }: AddUserQRModalProps) => {
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { data: branchesData, isLoading: branchesLoading } = useGetBranchesQuery(undefined);
  const branches: any[] = (branchesData as any)?.data || (branchesData as any)?.branches || [];

  const [generateQr, { isLoading: generating }] = useGenerateRegistrationQrMutation();

  // fetch an already-generated registration QR for the chosen branch
  const { data: existingQr, isFetching: fetchingExisting } = useGetBranchRegistrationQrQuery(
    selectedBranch,
    { skip: !selectedBranch },
  );

  useEffect(() => {
    const url = extractQrUrl(existingQr);
    if (url) { setQrUrl(url); setError(""); }
  }, [existingQr]);

  const handleBranchChange = (val: string) => {
    setSelectedBranch(val);
    setQrUrl("");
    setError("");
  };

  const handleGenerate = async () => {
    if (!selectedBranch) return;
    setError("");
    try {
      const res = await (generateQr as any)(selectedBranch).unwrap();
      const url = extractQrUrl(res);
      if (url) setQrUrl(url);
      else setError("QR generated but no image URL returned");
    } catch {
      setError("Failed to generate QR code");
    }
  };

  const handleDownload = async () => {
    if (!qrUrl) return;
    const filename = `registration-qr-${selectedBranch || "branch"}.png`;
    try {
      const res = await fetch(qrUrl, { mode: "cors" });
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(qrUrl, "_blank");
    }
  };

  const handleClose = () => {
    setSelectedBranch(undefined);
    setQrUrl("");
    setError("");
    onClose();
  };

  const previewLoading = generating || fetchingExisting;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={480}
      destroyOnHidden
      className="qr-modal"
      closeIcon={<span style={{ fontSize: 28 }}>&times;</span>}
    >
      <div className="qr-modal-title">Add User via QR</div>
      <div className="qr-modal-field">
        <label className="qr-modal-label">Select Branch</label>
        <Select
          showSearch
          placeholder="Choose a branch"
          value={selectedBranch}
          onChange={handleBranchChange}
          style={{ width: "100%", fontSize: 15 }}
          size="large"
          optionFilterProp="children"
          loading={branchesLoading}
        >
          {branches.map((b: any) => (
            <Select.Option key={b._id} value={b.branchId ?? b._id}>{b.name}</Select.Option>
          ))}
        </Select>
      </div>
      <Button
        type="primary"
        className="qr-modal-generate-btn"
        disabled={!selectedBranch || generating}
        onClick={handleGenerate}
      >
        {generating ? <Spin size="small" /> : qrUrl ? "Regenerate QR" : "Generate QR"}
      </Button>
      <div className="qr-modal-preview-block">
        <div className="qr-modal-preview-title">Live QR Preview</div>
        <div className="qr-modal-preview-box">
          {previewLoading ? (
            <Spin />
          ) : qrUrl ? (
            <img src={qrUrl} alt="Registration QR" style={{ maxWidth: 160, maxHeight: 160 }} />
          ) : (
            <span className="qr-modal-preview-placeholder">QR code will appear here</span>
          )}
        </div>
        {error && <div style={{ color: "red", textAlign: "center", marginTop: 8 }}>{error}</div>}
        {qrUrl && !previewLoading && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Button onClick={handleDownload}>Download QR</Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddUserQRModal;
