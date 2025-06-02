import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaFileCsv, FaFileExcel } from 'react-icons/fa';

const DownloadModal = ({ show, onHide, onDownloadCsv, onDownloadExcel }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Last ned data</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-grid gap-2">
                    <Button 
                        variant="outline-primary" 
                        onClick={onDownloadCsv}
                        className="d-flex align-items-center justify-content-center gap-2"
                        disabled
                    >
                        <FaFileCsv /> Last ned som CSV
                    </Button>
                    <Button 
                        variant="outline-primary" 
                        onClick={onDownloadExcel}
                        className="d-flex align-items-center justify-content-center gap-2"
                    >
                        <FaFileExcel /> Last ned som Excel
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default DownloadModal; 