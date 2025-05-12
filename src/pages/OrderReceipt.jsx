import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaCar, FaCalendarAlt, FaMoneyBillWave, FaUser, 
  FaPhone, FaEnvelope, FaIdCard, 
  FaFileInvoice, FaDownload, FaPrint, FaWhatsapp, 
  FaArrowLeft, FaCheckCircle
} from 'react-icons/fa';
import { format, parseISO, isValid } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';

const OrderReceipt = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [receiptData, setReceiptData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const receiptRef = useRef(null);
  
    const formatDate = useCallback((dateString, formatStr = 'dd MMMM yyyy') => {
      if (!dateString) return 'N/A';
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      return isValid(date) ? format(date, formatStr) : 'N/A';
    }, []);
  
    const formatPaymentMethod = useCallback((method) => {
      switch (method) {
        case 'bank_transfer': return 'Bank Transfer';
        case 'credit_card': return 'Credit Card';
        case 'e_wallet': return 'E-Wallet';
        default: return method || 'N/A';
      }
    }, []);
  
    const getPaymentStatusBadge = useCallback((status) => {
      switch (status) {
        case 'paid': return <span className="badge bg-success">Paid</span>;
        case 'pending': return <span className="badge bg-warning text-dark">Pending</span>;
        default: return <span className="badge bg-secondary">{status || 'N/A'}</span>;
      }
    }, []);
  
    const getAuthToken = useCallback(() => localStorage.getItem('token'), []);
    const getAuthHeader = useCallback(() => ({
      headers: {
        Authorization: `Bearer ${getAuthToken()}`
      }
    }), [getAuthToken]);
  
    useEffect(() => {
      const fetchReceiptData = async () => {
        try {
          const token = getAuthToken();
          if (!token) {
            setError('Authentication token not found. Please login again.');
            setLoading(false);
            return;
          }
  
          const response = await axios.get(
            `http://localhost:3000/api/orders/${id}/receipt`,
            getAuthHeader()
          );
          
          if (response.data.success) {
            setReceiptData(response.data.data);
          } else {
            setError('Pesanan tidak ditemukan');
          }
        } catch (err) {
          if (err.response?.status === 401) {
            setError('Session expired. Please login again.');
          } else {
            setError(err.response?.data?.message || 'Failed to load receipt data');
          }
        } finally {
          setLoading(false);
        }
      };
  
      fetchReceiptData();
    }, [id, getAuthToken, getAuthHeader]);
  
    const handleDownloadPDF = async () => {
      const element = receiptRef.current;
      if (!element) return;
  
      try {
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
        const pdf = new jsPDF('portrait', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`receipt-${id}.pdf`);
      } catch (err) {
        console.error('PDF generation error:', err);
        alert('Failed to generate PDF. Please try again.');
      }
    };
  
    const handlePrint = () => window.print();
  
    const handleShareWhatsApp = () => {
      if (!receiptData) return;
      const message = `
  *Rental Receipt*
  
  Order ID: #${receiptData.order.id}
  Vehicle: ${receiptData.car.name}
  Pickup: ${formatDate(receiptData.order.pickup_date)}
  Return: ${formatDate(receiptData.order.return_date)}
  Total: Rp ${receiptData.order.total_price.toLocaleString('id-ID')}
  Status: ${receiptData.order.payment_status === 'paid' ? 'Paid' : 'Pending'}
      `.trim();
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };
  
    if (loading) {
      return (
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Loading receipt data...</p>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="container py-5 text-center">
          <div className="alert alert-danger">
            <p>{error}</p>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(-1)}>
              <FaArrowLeft className="me-1" /> Back
            </button>
          </div>
        </div>
      );
    }
  
    return (
      <div className="container py-4">
        <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-1" /> Back
        </button>
  
        <div ref={receiptRef} className="card shadow-sm border-0 p-4 mb-4" id="receipt-container">
          <div className="text-center mb-4">
            <h4 className="fw-bold mb-1">Rental Receipt</h4>
            <small className="text-muted">Order ID: #{receiptData.order.id}</small>
          </div>
  
          <div className="row mb-3">
            <div className="col-md-6">
              <h6><FaUser className="me-2" />Customer</h6>
              <p className="mb-1"><strong>{receiptData.user.name}</strong></p>
              <p className="mb-1"><FaPhone className="me-1" /> {receiptData.user.phone}</p>
              <p><FaEnvelope className="me-1" /> {receiptData.user.email}</p>
            </div>
            <div className="col-md-6">
              <h6><FaCar className="me-2" />Car</h6>
              <p className="mb-1"><strong>{receiptData.car.name}</strong></p>
              <p className="mb-1"><FaCalendarAlt className="me-1" /> Pickup: {formatDate(receiptData.order.pickup_date)}</p>
              <p><FaCalendarAlt className="me-1" /> Return: {formatDate(receiptData.order.return_date)}</p>
            </div>
          </div>
  
          <hr />
  
          <div className="row mb-3">
            <div className="col-md-6">
              <h6><FaMoneyBillWave className="me-2" />Payment</h6>
              <p className="mb-1">Method: {formatPaymentMethod(receiptData.order.payment_method)}</p>
              <p>Status: {getPaymentStatusBadge(receiptData.order.payment_status)}</p>
            </div>
            <div className="col-md-6 text-end">
              <h6 className="text-muted">Total</h6>
              <h4 className="text-success">Rp {receiptData.order.total_price.toLocaleString('id-ID')}</h4>
            </div>
          </div>
  
          <div className="text-center mt-4">
            <FaCheckCircle className="text-success" size={48} />
            <p className="mt-2 text-muted">Thank you for your order!</p>
          </div>
        </div>
  
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
          <button className="btn btn-primary" onClick={handleDownloadPDF}>
            <FaDownload className="me-2" /> Download PDF
          </button>
          <button className="btn btn-outline-dark" onClick={handlePrint}>
            <FaPrint className="me-2" /> Print
          </button>
          <button className="btn btn-success" onClick={handleShareWhatsApp}>
            <FaWhatsapp className="me-2" /> Share via WhatsApp
          </button>
        </div>
      </div>
    );
  };
  
  export default OrderReceipt;