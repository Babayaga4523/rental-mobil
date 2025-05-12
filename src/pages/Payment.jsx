import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaWallet,
  FaCheckCircle,
  FaArrowLeft,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { order, car, totalPrice, days } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Redirect jika tidak ada data order
  useEffect(() => {
    if (!order) {
      toast.error("No booking data found");
      navigate("/layanan");
    }
  }, [order, navigate]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulasi proses pembayaran
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update status pembayaran di backend
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/api/orders/${order.id}/payment`,
        {
          payment_status: "paid",
          payment_method: paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPaymentSuccess(true);
      toast.success("Payment successful!");

      // Redirect ke halaman invoice setelah 3 detik
      setTimeout(() => {
        navigate("/invoice", {
          state: {
            order: { ...order, payment_status: "paid" },
            car,
            totalPrice,
            days,
          },
        });
      }, 3000);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!order) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <h2>No Booking Data Found</h2>
          <button
            onClick={() => navigate("/layanan")}
            className="btn btn-primary mt-3"
          >
            Back to Car List
          </button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center p-5 bg-white rounded-3 shadow-sm">
          <FaCheckCircle className="text-success mb-4" style={{ fontSize: "5rem" }} />
          <h2 className="mb-3">Payment Successful!</h2>
          <p className="lead">Your booking is now confirmed</p>
          <p>Redirecting to invoice page...</p>
          <div className="spinner-border text-primary mt-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card border-0 shadow-lg overflow-hidden">
              <div className="card-header bg-primary text-white py-3">
                <div className="d-flex align-items-center">
                  <button
                    onClick={() => navigate(-1)}
                    className="btn btn-sm btn-outline-light me-3"
                  >
                    <FaArrowLeft />
                  </button>
                  <h2 className="mb-0 fw-bold">Payment</h2>
                </div>
              </div>

              <div className="card-body p-4">
                <div className="row g-4">
                  {/* Order Summary */}
                  <div className="col-lg-5">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <h4 className="fw-bold mb-4">Order Summary</h4>

                        <div className="mb-4">
                          <h6 className="text-muted mb-3">Car Details</h6>
                          <div className="d-flex mb-3">
                            <img
                              src={car.image || "/images/default-car.jpg"}
                              alt={car.name}
                              className="rounded me-3"
                              style={{ width: "80px", height: "60px", objectFit: "cover" }}
                            />
                            <div>
                              <h6 className="mb-1">{car.name}</h6>
                              <small className="text-muted">
                                {days} day rental
                              </small>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h6 className="text-muted mb-3">Booking Details</h6>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Order ID:</span>
                            <span className="fw-bold">{order.id}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Pickup Date:</span>
                            <span className="fw-bold">
                              {new Date(order.pickup_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Return Date:</span>
                            <span className="fw-bold">
                              {new Date(order.return_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="border-top pt-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Total Amount:</h5>
                            <h4 className="mb-0 text-success fw-bold">
                              Rp {totalPrice.toLocaleString("id-ID")}
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Form */}
                  <div className="col-lg-7">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <h4 className="fw-bold mb-4">Payment Method</h4>

                        <form onSubmit={handlePaymentSubmit}>
                          <div className="mb-4">
                            <div className="btn-group w-100" role="group">
                              <button
                                type="button"
                                className={`btn ${
                                  paymentMethod === "credit_card"
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                                }`}
                                onClick={() => setPaymentMethod("credit_card")}
                              >
                                <FaCreditCard className="me-2" />
                                Credit Card
                              </button>
                              <button
                                type="button"
                                className={`btn ${
                                  paymentMethod === "bank_transfer"
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                                }`}
                                onClick={() => setPaymentMethod("bank_transfer")}
                              >
                                <FaMoneyBillWave className="me-2" />
                                Bank Transfer
                              </button>
                              <button
                                type="button"
                                className={`btn ${
                                  paymentMethod === "e_wallet"
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                                }`}
                                onClick={() => setPaymentMethod("e_wallet")}
                              >
                                <FaWallet className="me-2" />
                                E-Wallet
                              </button>
                            </div>
                          </div>

                          {paymentMethod === "credit_card" && (
                            <>
                              <div className="mb-3">
                                <label className="form-label">Card Number</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="1234 5678 9012 3456"
                                  value={cardNumber}
                                  onChange={(e) =>
                                    setCardNumber(
                                      e.target.value.replace(/\D/g, "").slice(0, 16)
                                    )
                                  }
                                  required
                                />
                              </div>

                              <div className="mb-3">
                                <label className="form-label">Cardholder Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="John Doe"
                                  value={cardName}
                                  onChange={(e) => setCardName(e.target.value)}
                                  required
                                />
                              </div>

                              <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                  <label className="form-label">Expiry Date</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="MM/YY"
                                    value={expiryDate}
                                    onChange={(e) =>
                                      setExpiryDate(
                                        e.target.value
                                          .replace(/\D/g, "")
                                          .replace(/^(\d{2})/, "$1/")
                                          .slice(0, 5)
                                      )
                                    }
                                    required
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">CVV</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="123"
                                    value={cvv}
                                    onChange={(e) =>
                                      setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                                    }
                                    required
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {paymentMethod === "bank_transfer" && (
                            <div className="alert alert-info">
                              <h5>Bank Transfer Instructions</h5>
                              <p>
                                Please transfer to:<br />
                                Bank: BCA<br />
                                Account: 1234567890<br />
                                Name: Rental Mobil Jaya
                              </p>
                              <p className="mb-0">
                                Include your order ID as payment reference.
                              </p>
                            </div>
                          )}

                          {paymentMethod === "e_wallet" && (
                            <div className="alert alert-info">
                              <h5>E-Wallet Payment</h5>
                              <p>
                                Please complete payment via your preferred e-wallet app
                                using QR code below:
                              </p>
                              <div className="text-center my-3">
                                <img
                                  src="/images/qr-code-placeholder.png"
                                  alt="QR Code"
                                  style={{ width: "150px" }}
                                />
                              </div>
                              <p className="mb-0">
                                Or send to phone number: 081234567890
                              </p>
                            </div>
                          )}

                          <div className="d-grid mt-4">
                            <button
                              type="submit"
                              className="btn btn-primary btn-lg py-3 fw-bold"
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>
                                  Processing Payment...
                                </>
                              ) : (
                                "Confirm Payment"
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;