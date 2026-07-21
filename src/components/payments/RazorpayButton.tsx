import { useCallback } from 'react'
import { Button } from '@/components/ui/button'

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.body.appendChild(script)
  })
}

interface RazorpayButtonProps {
  orderId: string
  amount: number
  keyId: string
  description: string
  mock?: boolean
  onSuccess: (paymentId: string) => void
  onError?: (err: Error) => void
  children?: React.ReactNode
}

export function RazorpayButton({
  orderId,
  amount,
  keyId,
  description,
  mock,
  onSuccess,
  onError,
  children,
}: RazorpayButtonProps) {
  const handlePay = useCallback(async () => {
    if (mock || !keyId || keyId === 'mock_key') {
      onSuccess(`pay_mock_${Date.now()}`)
      return
    }

    try {
      await loadRazorpayScript()
      const rzp = new window.Razorpay!({
        key: keyId,
        amount,
        currency: 'INR',
        name: 'LinkMe',
        description,
        order_id: orderId,
        handler: (response: { razorpay_payment_id: string }) => {
          onSuccess(response.razorpay_payment_id)
        },
        theme: { color: '#7c3aed' },
      })
      rzp.open()
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Payment failed'))
    }
  }, [orderId, amount, keyId, description, mock, onSuccess, onError])

  return (
    <Button type="button" onClick={handlePay}>
      {children ?? 'Pay with Razorpay'}
    </Button>
  )
}
