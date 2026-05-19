import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Upload } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { calculateCartTotal } from '../utils/orderTotals';

export function PaymentPage() {
  const navigate = useNavigate();
  const { cart, totalPrice } = useCart();
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null);
  const pendingOrder = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('pending_order') || 'null');
    } catch {
      return null;
    }
  }, []);
  const amountToPay = Number(pendingOrder?.total || 0) || calculateCartTotal(pendingOrder?.items || cart) || totalPrice;
  const qrCells = useMemo(
    () => Array.from({ length: 64 }, (_, index) => (index * 7 + index * index) % 5 !== 0),
    []
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofOfPayment(e.target.files[0]);
    }
  };

  const handleConfirmPayment = () => {
    if (!proofOfPayment) {
      alert('Please upload proof of payment');
      return;
    }
    navigate('/order-confirmation');
  };

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/checkout')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#F57C00] mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Checkout
        </button>

        <div className="rounded-lg bg-white p-5 shadow-lg sm:p-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">GCash Payment</h1>
          <p className="text-gray-600 mb-8">Scan the QR code below to complete your payment</p>

          {/* QR Code */}
          <div className="mb-8">
            <div className="flex flex-col items-center rounded-lg bg-gray-100 p-4 sm:p-8">
              <div className="mb-4 rounded-lg bg-white p-3 shadow-md sm:p-4">
                <div className="flex h-56 w-56 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 sm:h-64 sm:w-64">
                  <div className="rounded bg-white p-5 sm:p-6">
                    <div className="grid grid-cols-8 gap-1">
                      {qrCells.map((filled, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 ${filled ? 'bg-black' : 'bg-white'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#F57C00] mb-2">₱{amountToPay}</p>
              <p className="text-sm text-gray-600">Amount to Pay</p>
            </div>
          </div>

          {/* Upload Proof */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Upload Proof of Payment
            </label>
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-5 text-center transition-colors hover:border-[#F57C00] sm:p-8">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="proof-upload"
              />
              <label
                htmlFor="proof-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-3" />
                {proofOfPayment ? (
                  <p className="break-all font-medium text-[#F57C00]">{proofOfPayment.name}</p>
                ) : (
                  <>
                    <p className="text-gray-600 mb-1">Click to upload screenshot</p>
                    <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirmPayment}
            disabled={!proofOfPayment}
            className="w-full bg-[#F57C00] text-white py-3 rounded-lg hover:bg-[#E65100] font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
}
