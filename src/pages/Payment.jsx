import React, { useState } from "react";
import { FaCreditCard, FaMoneyBillWave, FaQrcode, FaLock, FaCheckCircle, FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaCalendarAlt } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import '../style/Payment.css';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    carName, 
    totalPrice,
    price,
    days,
    discount,
    image,
    customerInfo // This comes from booking form
  } = location.state || {};
  
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return value;
  };

  if (!carName || !customerInfo) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center p-5 bg-white rounded-4 shadow" style={{ maxWidth: '600px' }}>
          <div className="mb-4">
            <FaCreditCard className="text-danger" style={{ fontSize: '4rem' }} />
          </div>
          <h2 className="fw-bold mb-3">Data Booking Tidak Lengkap</h2>
          <p className="lead mb-4">Silakan kembali ke halaman booking untuk memulai kembali</p>
          <button 
            onClick={() => navigate('/booking')}
            className="btn btn-primary px-4 py-2"
          >
            Kembali ke Halaman Booking
          </button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center p-5 bg-white rounded-4 shadow" style={{ maxWidth: '600px' }}>
          <div className="mb-4">
            <FaCheckCircle className="text-success" style={{ fontSize: '5rem' }} />
          </div>
          <h2 className="fw-bold mb-3">Pembayaran Berhasil!</h2>
          <p className="lead mb-4">Terima kasih telah melakukan pembayaran untuk {carName}</p>
          <div className="bg-light p-4 rounded-3 mb-4">
            <h4 className="text-success fw-bold">Rp {totalPrice?.toLocaleString('id-ID')}</h4>
            <p className="text-muted mb-0">Telah berhasil dibayarkan</p>
          </div>
          <p className="text-muted mb-4">
            Kami telah mengirimkan detail booking ke email Anda di <strong>{customerInfo.customerEmail}</strong>.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-primary px-4 py-2"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card border-0 shadow-lg overflow-hidden mb-4">
              <div className="card-header bg-primary text-white py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h2 className="mb-0 fw-bold">
                    <FaCreditCard className="me-2" /> Pembayaran
                  </h2>
                  <div className="badge bg-white text-primary fs-6 py-2 px-3">
                    Total: Rp {totalPrice?.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
              
              <div className="card-body p-4">
                {/* Booking Summary Section */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <h4 className="fw-bold mb-4">Detail Booking</h4>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <FaUser className="text-primary me-2" />
                          <span><strong>Nama:</strong> {customerInfo.customerName}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <FaEnvelope className="text-primary me-2" />
                          <span><strong>Email:</strong> {customerInfo.customerEmail}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <FaPhone className="text-primary me-2" />
                          <span><strong>Telepon:</strong> {customerInfo.customerPhone}</span>
                        </div>
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <FaCalendarAlt className="text-primary me-2" />
                          <span><strong>Tanggal Pengambilan:</strong> {customerInfo.bookingDate}</span>
                        </div>
                        {customerInfo.additionalNotes && (
                          <div>
                            <p className="mb-1"><strong>Catatan:</strong></p>
                            <p className="text-muted small">{customerInfo.additionalNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-top pt-3 mt-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Harga Sewa ({days} hari):</span>
                        <span>Rp {price?.toLocaleString('id-ID')} x {days}</span>
                      </div>
                      {discount > 0 && (
                        <div className="d-flex justify-content-between align-items-center mb-2 text-success">
                          <span>Diskon {discount}%:</span>
                          <span>- Rp {(price * days * discount / 100).toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div className="d-flex justify-content-between align-items-center fw-bold">
                        <span>Total Pembayaran:</span>
                        <span className="text-success">Rp {totalPrice?.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-4">
                  {/* Payment Methods */}
                  <div className="col-lg-5">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <h4 className="fw-bold mb-4">Metode Pembayaran</h4>
                        
                        <div className="payment-methods">
                          <div 
                            className={`payment-method ${paymentMethod === 'credit-card' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('credit-card')}
                          >
                            <div className="method-icon">
                              <FaCreditCard className="text-primary" />
                            </div>
                            <div className="method-info">
                              <h6 className="mb-0">Kartu Kredit/Debit</h6>
                              <small className="text-muted">Visa, Mastercard, JCB</small>
                            </div>
                          </div>
                          
                          <div 
                            className={`payment-method ${paymentMethod === 'bank-transfer' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('bank-transfer')}
                          >
                            <div className="method-icon">
                              <FaMoneyBillWave className="text-primary" />
                            </div>
                            <div className="method-info">
                              <h6 className="mb-0">Transfer Bank</h6>
                              <small className="text-muted">BCA, Mandiri, BRI, BNI</small>
                            </div>
                          </div>
                          
                          <div 
                            className={`payment-method ${paymentMethod === 'e-wallet' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('e-wallet')}
                          >
                            <div className="method-icon">
                              <FaQrcode className="text-primary" />
                            </div>
                            <div className="method-info">
                              <h6 className="mb-0">E-Wallet</h6>
                              <small className="text-muted">Gopay, OVO, DANA, LinkAja</small>
                            </div>
                          </div>
                        </div>
                        
                        <div className="payment-security mt-4 pt-3 border-top">
                          <div className="d-flex align-items-center">
                            <FaLock className="text-success me-2" />
                            <small className="text-muted">Transaksi Anda aman dan terenkripsi</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Form */}
                  <div className="col-lg-7">
                    {paymentMethod === 'credit-card' && (
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h4 className="fw-bold mb-4">
                            <FaCreditCard className="me-2 text-primary" /> Detail Kartu
                          </h4>
                          
                          <form onSubmit={handlePaymentSubmit}>
                            <div className="mb-4">
                              <label htmlFor="cardNumber" className="form-label fw-bold">
                                Nomor Kartu
                              </label>
                              <input 
                                type="text" 
                                className="form-control py-2" 
                                id="cardNumber" 
                                placeholder="1234 5678 9012 3456" 
                                value={formatCardNumber(cardNumber)}
                                onChange={(e) => setCardNumber(e.target.value)}
                                maxLength="19"
                                required 
                              />
                            </div>
                            
                            <div className="mb-4">
                              <label htmlFor="cardName" className="form-label fw-bold">
                                Nama Pemilik Kartu
                              </label>
                              <input 
                                type="text" 
                                className="form-control py-2" 
                                id="cardName" 
                                placeholder="Nama sesuai di kartu" 
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                required 
                              />
                            </div>
                            
                            <div className="row">
                              <div className="col-md-6 mb-4">
                                <label htmlFor="expiryDate" className="form-label fw-bold">
                                  Masa Berlaku
                                </label>
                                <input 
                                  type="text" 
                                  className="form-control py-2" 
                                  id="expiryDate" 
                                  placeholder="MM/YY" 
                                  value={formatExpiryDate(expiryDate)}
                                  onChange={(e) => setExpiryDate(e.target.value)}
                                  maxLength="5"
                                  required 
                                />
                              </div>
                              <div className="col-md-6 mb-4">
                                <label htmlFor="cvv" className="form-label fw-bold">
                                  CVV
                                </label>
                                <input 
                                  type="text" 
                                  className="form-control py-2" 
                                  id="cvv" 
                                  placeholder="123" 
                                  value={cvv}
                                  onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                                  maxLength="3"
                                  required 
                                />
                              </div>
                            </div>
                            
                            <div className="d-grid mt-4">
                              <button 
                                type="submit" 
                                className="btn btn-primary btn-lg py-3 fw-bold"
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Memproses Pembayaran...
                                  </>
                                ) : (
                                  "Konfirmasi Pembayaran"
                                )}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                    
                    {paymentMethod === 'bank-transfer' && (
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h4 className="fw-bold mb-4">
                            <FaMoneyBillWave className="me-2 text-primary" /> Transfer Bank
                          </h4>
                          
                          <div className="bank-transfer-methods">
                            <div className="bank-method">
                              <img src="/images/bca.png" alt="BCA" className="bank-logo" />
                              <div className="bank-info">
                                <h6 className="mb-1">Bank Central Asia (BCA)</h6>
                                <p className="mb-1 fw-bold">123 456 7890</p>
                                <p className="mb-0 text-muted small">a/n Rental Mobil Jaya</p>
                              </div>
                            </div>
                            
                            <div className="bank-method">
                              <img src="/images/mandiri.png" alt="Mandiri" className="bank-logo" />
                              <div className="bank-info">
                                <h6 className="mb-1">Bank Mandiri</h6>
                                <p className="mb-1 fw-bold">987 654 3210</p>
                                <p className="mb-0 text-muted small">a/n Rental Mobil Jaya</p>
                              </div>
                            </div>
                            
                            <div className="bank-method">
                              <img src="/images/bri.png" alt="BRI" className="bank-logo" />
                              <div className="bank-info">
                                <h6 className="mb-1">Bank Rakyat Indonesia (BRI)</h6>
                                <p className="mb-1 fw-bold">567 890 1234</p>
                                <p className="mb-0 text-muted small">a/n Rental Mobil Jaya</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-light p-3 rounded-3 mt-4">
                            <h6 className="fw-bold">Instruksi Pembayaran:</h6>
                            <ol className="small">
                              <li>Transfer tepat sebesar <strong>Rp {totalPrice?.toLocaleString('id-ID')}</strong></li>
                              <li>Gunakan nomor rekening di atas</li>
                              <li>Simpan bukti transfer</li>
                              <li>Konfirmasi pembayaran melalui WhatsApp kami</li>
                            </ol>
                          </div>
                          
                          <div className="d-grid mt-4">
                            <button 
                              className="btn btn-outline-primary"
                              onClick={() => setIsSuccess(true)}
                            >
                              Saya Sudah Transfer
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {paymentMethod === 'e-wallet' && (
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h4 className="fw-bold mb-4">
                            <FaQrcode className="me-2 text-primary" /> E-Wallet
                          </h4>
                          
                          <div className="text-center mb-4">
                            <img 
                              src="/images/payment-qr.png" 
                              alt="QR Code Payment" 
                              className="img-fluid mb-3" 
                              style={{maxWidth: '200px'}}
                            />
                            <p className="fw-bold">Scan QR Code untuk pembayaran</p>
                            <p className="text-muted small">Gunakan aplikasi Gopay, OVO, DANA, atau LinkAja</p>
                          </div>
                          
                          <div className="e-wallet-methods">
                            <div className="wallet-method">
                              <img src="/images/gopay.png" alt="Gopay" className="wallet-logo" />
                              <div className="wallet-info">
                                <h6 className="mb-0">Gopay</h6>
                                <small className="text-muted">0812-3456-7890</small>
                              </div>
                            </div>
                            
                            <div className="wallet-method">
                              <img src="/images/ovo.png" alt="OVO" className="wallet-logo" />
                              <div className="wallet-info">
                                <h6 className="mb-0">OVO</h6>
                                <small className="text-muted">0812-3456-7890</small>
                              </div>
                            </div>
                            
                            <div className="wallet-method">
                              <img src="/images/dana.png" alt="DANA" className="wallet-logo" />
                              <div className="wallet-info">
                                <h6 className="mb-0">DANA</h6>
                                <small className="text-muted">0812-3456-7890</small>
                              </div>
                            </div>
                          </div>
                          
                          <div className="d-grid mt-4">
                            <button 
                              className="btn btn-outline-primary"
                              onClick={() => setIsSuccess(true)}
                            >
                              Saya Sudah Bayar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate(-1)}
              className="btn btn-outline-secondary"
            >
              <FaArrowLeft className="me-2" /> Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;