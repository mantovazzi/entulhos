"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

export default function PagamentoPage() {
  const params = useParams()
  const router = useRouter()
  const [paymentData, setPaymentData] = useState<any>(null)
  const [status, setStatus] = useState<"waiting" | "paid" | "error">("waiting")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Recuperar dados do pagamento do localStorage
    const data = localStorage.getItem(`payment_${params.id}`)
    if (data) {
      setPaymentData(JSON.parse(data))
      setLoading(false)
    } else {
      setLoading(false)
      setStatus("error")
    }
  }, [params.id])

  useEffect(() => {
    if (!paymentData?.transactionId) return

    // Verificar status do pagamento a cada 5 segundos
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/check-payment/${paymentData.transactionId}`)
        const data = await response.json()

        if (data.success && data.status === "paid") {
          setStatus("paid")
          clearInterval(interval)
          // Limpar localStorage
          localStorage.removeItem(`payment_${params.id}`)
        }
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [paymentData, params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (status === "error" || !paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Erro</h1>
          <p className="text-gray-600 mb-6">Não foi possível carregar os dados do pagamento.</p>
          <Button onClick={() => router.push("/")} className="w-full">
            Voltar ao Início
          </Button>
        </Card>
      </div>
    )
  }

  if (status === "paid") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Pagamento Confirmado!</h1>
          <p className="text-gray-600 mb-6">
            Sua reserva foi confirmada com sucesso. Em breve entraremos em contato para agendar a entrega da caçamba.
          </p>
          <Button onClick={() => router.push("/")} className="w-full bg-orange-600 hover:bg-orange-700">
            Fazer Nova Reserva
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-orange-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">EXPRESS ENTULHOS</h1>
          <p className="text-center text-sm mt-1">Aluguel de Caçambas</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-6">
          <div className="text-center mb-6">
            <Clock className="w-12 h-12 text-orange-600 mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-2">Aguardando Pagamento</h2>
            <p className="text-gray-600">Escaneie o QR Code abaixo para pagar via PIX</p>
          </div>

          <div className="bg-white border-2 border-orange-600 rounded-lg p-6 mb-6">
            <div className="flex justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentData.qrcode)}`}
                alt="QR Code PIX"
                className="w-64 h-64"
              />
            </div>

            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">Ou copie o código PIX:</p>
              <div className="bg-gray-50 p-3 rounded border break-all text-xs font-mono">{paymentData.qrcode}</div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(paymentData.qrcode)
                  alert("Código PIX copiado!")
                }}
                variant="outline"
                className="mt-3"
              >
                Copiar Código PIX
              </Button>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Detalhes da Reserva:</h3>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Caçamba:</strong> {paymentData.size}
              </p>
              <p>
                <strong>Valor:</strong> R$ {(paymentData.amount / 100).toFixed(2)}
              </p>
              {paymentData.expirationDate && (
                <p>
                  <strong>Válido até:</strong> {new Date(paymentData.expirationDate).toLocaleString("pt-BR")}
                </p>
              )}
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>O pagamento será confirmado automaticamente após a aprovação.</p>
            <p className="mt-2">Verificando pagamento...</p>
            <div className="flex justify-center mt-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
