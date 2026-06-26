import React, { useState } from "react";
import { Modal, Select, Button, Spin } from "antd";
import { useGetBranchesQuery } from "../../../services/branches";
import { useGenerateQrCodeMutation } from "../../../services/qrCodes";
import "./qrModal.scss";

const QRModal = ({ open, onClose }) => {
  const [selectedBranch, setSelectedBranch] = useState();
  // Call branch API and get branches
  const { data, isLoading } = useGetBranchesQuery();
  const [generateQrCode, { data: qrData, isLoading: qrLoading }] = useGenerateQrCodeMutation();
  const [qrError, setQrError] = useState("");

  const handleGenerate = async () => {
    setQrError("");
    try {
      await generateQrCode(selectedBranch).unwrap();
    //   onClose();
    } catch (err) {
      setQrError("Failed to generate QR code");
    }
  };

  const qrImageUrl = qrData?.qrCodeUrl || qrData?.data?.qrCodeUrl || "";

  const handleDownload = async () => {
    if (!qrImageUrl) return;
    const filename = `feedback-qr-${selectedBranch || "branch"}.png`;
    try {
      const res = await fetch(qrImageUrl, { mode: "cors" });
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
      window.open(qrImageUrl, "_blank");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      destroyOnHidden
      className="qr-modal"
      closeIcon={<span style={{ fontSize: 28 }}>&times;</span>}
    >
      <div className="qr-modal-title">Generate QR Code</div>
      <div className="qr-modal-field">
        <label className="qr-modal-label">Select Branch</label>
        <Select
          showSearch
          placeholder="Choose a branch"
          value={selectedBranch}
          onChange={setSelectedBranch}
          style={{ width: "100%", fontSize: 15, }}
          size="large"
          optionFilterProp="children"
          loading={isLoading}
        >
          {(data?.branches || data?.data)?.map((b) => (
            <Select.Option key={b._id} value={b._id}>{b.name}</Select.Option>
          ))}
        </Select>
      </div>
      <Button
        type="primary"
        className="qr-modal-generate-btn"
        disabled={!selectedBranch || qrLoading}
        onClick={handleGenerate}
      >
        {qrLoading ? <Spin size="small" /> : "Generate QR"}
      </Button>
      <div className="qr-modal-preview-block">
        <div className="qr-modal-preview-title">Live QR Preview</div>
        <div className="qr-modal-preview-box">
          {qrLoading ? (
            <Spin />
          ) : qrImageUrl ? (
            <img src={qrImageUrl} alt="QR Code" style={{ maxWidth: 120, maxHeight: 120 }} />
          ) : (
            <span className="qr-modal-preview-placeholder">QR code will appear here</span>
          )}
        </div>
        {qrError && <div style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>{qrError}</div>}
        {qrImageUrl && !qrLoading && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button onClick={handleDownload}>Download QR</Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QRModal;
