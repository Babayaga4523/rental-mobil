import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Status colors mapping
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    unpaid: 'bg-gray-100 text-gray-800',
  };

  // Payment status colors
  const paymentStatusColors = {
    unpaid: 'bg-gray-100 text-gray-800',
    paid: 'bg-green-100 text-green-800',
    pending_verification: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
    refunded: 'bg-purple-100 text-purple-800',
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrder(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data pesanan');
        toast.error(err.response?.data?.message || 'Gagal memuat data pesanan');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning('Pilih file bukti pembayaran terlebih dahulu');
      return;
    }

    const formData = new FormData();
    formData.append('payment_proof', selectedFile);

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      await axios.put(`/api/orders/${id}/payment`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Bukti pembayaran berhasil diupload');
      // Refresh order data
      const response = await axios.get(`/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrder(response.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengupload bukti pembayaran');
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`/api/orders/${id}/cancel`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        toast.success('Pesanan berhasil dibatalkan');
        // Refresh order data
        const response = await axios.get(`/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrder(response.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Gagal membatalkan pesanan');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <button
            onClick={() => navigate('/orders')}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
          >
            Kembali ke Daftar Pesanan
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative max-w-md">
          <strong className="font-bold">Peringatan!</strong>
          <span className="block sm:inline"> Pesanan tidak ditemukan</span>
          <button
            onClick={() => navigate('/orders')}
            className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm"
          >
            Kembali ke Daftar Pesanan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Detail Pesanan</h1>
          <p className="mt-2 text-sm text-gray-600">
            ID Pesanan: {order.id} | Dibuat pada: {formatDate(order.created_at)}
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Informasi Pesanan
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Detail lengkap tentang pesanan Anda
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Status Pesanan
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {order.status === 'pending' && 'Menunggu Konfirmasi'}
                    {order.status === 'confirmed' && 'Dikonfirmasi'}
                    {order.status === 'completed' && 'Selesai'}
                    {order.status === 'cancelled' && 'Dibatalkan'}
                    {order.status === 'unpaid' && 'Belum Dibayar'}
                  </span>
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Status Pembayaran
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusColors[order.payment_status] || 'bg-gray-100 text-gray-800'}`}>
                    {order.payment_status === 'unpaid' && 'Belum Dibayar'}
                    {order.payment_status === 'paid' && 'Lunas'}
                    {order.payment_status === 'pending_verification' && 'Menunggu Verifikasi'}
                    {order.payment_status === 'rejected' && 'Ditolak'}
                    {order.payment_status === 'refunded' && 'Dikembalikan'}
                  </span>
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Tanggal Pengambilan
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(order.pickup_date)}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Tanggal Pengembalian
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(order.return_date)}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Metode Pembayaran
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {order.payment_method === 'credit_card' && 'Kartu Kredit'}
                  {order.payment_method === 'bank_transfer' && 'Transfer Bank'}
                  {order.payment_method === 'e_wallet' && 'E-Wallet'}
                  {!order.payment_method && 'Belum dipilih'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Catatan Tambahan
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {order.additional_notes || 'Tidak ada catatan'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Informasi Layanan
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden bg-gray-200">
                  <img
                    src={order.layanan.gambar || '/images/default-service.jpg'}
                    alt={order.layanan.nama}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">{order.layanan.nama}</h4>
                  <p className="mt-1 text-sm text-gray-500">{order.layanan.deskripsi}</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {formatCurrency(order.layanan.harga)} / hari
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Rincian Pembayaran
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Harga Sewa ({order.durasi} hari)
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatCurrency(order.total_price)}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Pajak (10%)
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatCurrency(order.total_price * 0.1)}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                <dt className="text-sm font-medium text-gray-500">
                  Total Pembayaran
                </dt>
                <dd className="mt-1 text-sm font-bold text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatCurrency(order.total_price)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Payment Proof Section */}
        {order.payment_status !== 'paid' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Upload Bukti Pembayaran
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Silakan upload bukti pembayaran Anda
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {order.payment_proof ? (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Bukti pembayaran sudah diupload:</p>
                  <a
                    href={order.payment_proof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Lihat Bukti Pembayaran
                  </a>
                  <p className="text-xs text-gray-500 mt-2">
                    Status: {order.payment_status === 'pending_verification' ?
                    'Menunggu verifikasi admin' : order.payment_status}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                          />
                        </label>
                        <p className="pl-1">atau drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, PDF maksimal 5MB
                      </p>
                    </div>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      File dipilih: {selectedFile.name}
                    </div>
                  )}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={!selectedFile || uploading}
                      className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        (!selectedFile || uploading) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploading ? 'Mengupload...' : 'Upload Bukti Pembayaran'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Kembali ke Daftar Pesanan
          </button>

          {order.status === 'pending' && order.payment_status === 'unpaid' && (
            <button
              onClick={handleCancelOrder}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Batalkan Pesanan
            </button>
          )}

          {order.payment_status === 'paid' && order.status !== 'completed' && (
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cetak Invoice
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
