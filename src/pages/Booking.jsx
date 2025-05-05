import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaCar,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaPercentage,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import { format, addDays } from "date-fns";

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    carId,
    carName,
    price,
    days = 1,
    totalPrice,
    image,
    discount,
  } = location.state || {};

  const [formData, setFormData] = useState({
    car_id: carId,
    pickup_date: "",
    return_date: "",
    payment_method: "credit_card",
    additional_notes: "",
    total_price: totalPrice,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Check if token is valid on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const tokenExpiry = localStorage.getItem("token_expiry");

    if (!token || Date.now() > tokenExpiry) {
      setIsSessionExpired(true);
      toast.error("Session expired. Please log in again.");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (formData.pickup_date && days) {
      const pickupDate = new Date(formData.pickup_date);
      const returnDate = addDays(pickupDate, days);
      setFormData((prev) => ({
        ...prev,
        return_date: format(returnDate, "yyyy-MM-dd"),
      }));
    }
  }, [formData.pickup_date, days]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.pickup_date) {
      errors.pickup_date = "Pickup date is required";
    }
    if (!formData.return_date) {
      errors.return_date = "Return date is required";
    }
    return Object.keys(errors).length === 0 ? null : errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors) {
      setErrors(validationErrors);
      toast.error("Please fill the form correctly");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        "http://localhost:3000/api/orders",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Order created successfully!");

      navigate(`/orders/${response.data.data.id}`, {
        state: {
          order: response.data.data,
          car: { id: carId, name: carName, image, price },
        },
      });
    } catch (error) {
      console.error("Order creation error:", error);
      let errorMessage = "Failed to create order";
      if (error.response) {
        errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          errorMessage;
      } else if (error.request) {
        errorMessage = "No response from server";
      } else {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSessionExpired) {
    return null; // If session is expired, do not render the rest of the page
  }

  if (!carId) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div
          className="text-center p-5 bg-white rounded-4 shadow"
          style={{ maxWidth: "600px" }}
        >
          <div className="mb-4">
            <FaCar className="text-danger" style={{ fontSize: "4rem" }} />
          </div>
          <h2 className="fw-bold mb-3">Car Not Found</h2>
          <p className="lead mb-4">
            Please return to the car list to choose a vehicle
          </p>
          <button
            onClick={() => navigate("/layanan")}
            className="btn btn-primary px-4 py-2"
          >
            Back to Car List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card border-0 shadow-lg overflow-hidden">
              <div className="card-header bg-primary text-white py-3">
                <h2 className="mb-0 fw-bold">
                  <FaCar className="me-2" /> Car Booking
                </h2>
              </div>

              <div className="card-body p-4">
                <div className="row g-4">
                  {/* Car Summary Section */}
                  <div className="col-lg-5">
                    <div className="card border-0 shadow-sm h-100">
                      <div
                        className="card-img-top overflow-hidden"
                        style={{ height: "200px" }}
                      >
                        <img
                          src={image || "/images/default-car.jpg"}
                          className="img-fluid w-100 h-100 object-fit-cover"
                          alt={carName}
                        />
                      </div>
                      <div className="card-body">
                        <h4 className="fw-bold mb-3">{carName}</h4>

                        <div className="d-flex align-items-center mb-2">
                          <FaMoneyBillWave className="text-primary me-2" />
                          <span>
                            Price per day:{" "}
                            <strong>
                              Rp {price?.toLocaleString("id-ID") || "0"}
                            </strong>
                          </span>
                        </div>

                        <div className="d-flex align-items-center mb-2">
                          <FaCalendarAlt className="text-primary me-2" />
                          <span>
                            Rental duration: <strong>{days} days</strong>
                          </span>
                        </div>

                        {discount > 0 && (
                          <div className="d-flex align-items-center mb-2">
                            <FaPercentage className="text-success me-2" />
                            <span>
                              Discount:{" "}
                              <strong className="text-success">
                                {discount}%
                              </strong>
                            </span>
                          </div>
                        )}

                        <div className="border-top mt-3 pt-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Total Price:</h5>
                            <h4 className="mb-0 text-success fw-bold">
                              Rp {totalPrice?.toLocaleString("id-ID") || "0"}
                            </h4>
                          </div>
                          <small className="text-muted">
                            Includes tax and insurance
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Form Section */}
                  <div className="col-lg-7">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <h4 className="fw-bold mb-4">
                          <FaCalendarAlt className="me-2 text-primary" />{" "}
                          Booking Details
                        </h4>

                        <form onSubmit={handleSubmit}>
                          <div className="mb-3">
                            <label
                              htmlFor="pickup_date"
                              className="form-label fw-bold"
                            >
                              <FaCalendarAlt className="me-2 text-muted" />{" "}
                              Pickup Date
                            </label>
                            <input
                              type="date"
                              className={`form-control py-2 ${
                                errors.pickup_date ? "is-invalid" : ""
                              }`}
                              id="pickup_date"
                              name="pickup_date"
                              value={formData.pickup_date}
                              onChange={handleChange}
                              min={format(new Date(), "yyyy-MM-dd")}
                              required
                            />
                            {errors.pickup_date && (
                              <div className="invalid-feedback">
                                {errors.pickup_date}
                              </div>
                            )}
                          </div>

                          <div className="mb-3">
                            <label
                              htmlFor="return_date"
                              className="form-label fw-bold"
                            >
                              <FaCalendarAlt className="me-2 text-muted" />{" "}
                              Return Date
                            </label>
                            <input
                              type="date"
                              className="form-control py-2"
                              id="return_date"
                              name="return_date"
                              value={formData.return_date}
                              readOnly
                              required
                            />
                            <small className="text-muted">
                              Automatically calculated based on rental duration
                            </small>
                          </div>

                          <div className="mb-3">
                            <label
                              htmlFor="payment_method"
                              className="form-label fw-bold"
                            >
                              Payment Method
                            </label>
                            <select
                              className="form-select py-2"
                              id="payment_method"
                              name="payment_method"
                              value={formData.payment_method}
                              onChange={handleChange}
                            >
                              <option value="credit_card">Credit Card</option>
                              <option value="bank_transfer">
                                Bank Transfer
                              </option>
                              <option value="e_wallet">E-Wallet</option>
                            </select>
                          </div>

                          <div className="mb-4">
                            <label
                              htmlFor="additional_notes"
                              className="form-label fw-bold"
                            >
                              Additional Notes
                            </label>
                            <textarea
                              className="form-control"
                              id="additional_notes"
                              name="additional_notes"
                              value={formData.additional_notes}
                              onChange={handleChange}
                              rows="3"
                              placeholder="Example: Pickup address, special requirements, etc."
                            ></textarea>
                          </div>

                          <div className="d-grid mt-4">
                            <button
                              type="submit"
                              className="btn btn-primary btn-lg py-3 fw-bold"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>
                                  Processing...
                                </>
                              ) : (
                                "Confirm Booking"
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

export default Booking;
