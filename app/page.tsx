"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const cacambas = [
  { size: "4m³", price: 280 },
  { size: "5m³", price: 320 },
  { size: "7m³", price: 380 },
  { size: "10m³", price: 450 },
]

export default function HomePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedSize, setSelectedSize] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    observations: "",
  })
  const [loading, setLoading] = useState(false)

  const selectedCacamba = cacambas.find((c) => c.size === selectedSize)

  const handleSubmit = async () => {
    if (!selectedSize || !formData.name || !formData.email || !formData.phone) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    setLoading(true)
    try {
      console.log("[v0] Enviando dados para criar pagamento...")

      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          size: selectedSize,
          amount: selectedCacamba?.price,
        }),
      })

      const data = await response.json()
      console.log("[v0] Resposta da API:", data)

      if (data.success) {
        const paymentId = data.secureId || data.transactionId
        localStorage.setItem(`payment_${paymentId}`, JSON.stringify(data))
        router.push(`/pagamento/${paymentId}`)
      } else {
        alert(`Erro ao criar pagamento: ${data.error || "Tente novamente."}`)
      }
    } catch (error) {
      console.error("[v0] Erro ao processar:", error)
      alert("Erro ao processar. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-orange-600 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold tracking-wide">EXPRESS ENTULHOS</h1>
          <p className="text-sm mt-1 text-orange-100">Locação de Caçambas - Rápido e Fácil</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Locação de Caçambas</h2>
          <p className="text-gray-600">Complete sua reserva em apenas 3 etapas simples</p>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  step >= 1 ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > 1 ? <CheckCircle2 className="w-6 h-6" /> : "1"}
              </div>
              <span className="text-sm mt-2 font-medium">Caçamba</span>
            </div>

            {/* Line */}
            <div className="w-24 h-0.5 bg-gray-300" />

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  step >= 2 ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > 2 ? <CheckCircle2 className="w-6 h-6" /> : "2"}
              </div>
              <span className="text-sm mt-2 font-medium text-gray-600">Dados</span>
            </div>

            {/* Line */}
            <div className="w-24 h-0.5 bg-gray-300" />

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  step >= 3 ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                3
              </div>
              <span className="text-sm mt-2 font-medium text-gray-600">Pagamento</span>
            </div>
          </div>
        </div>

        {/* Step 1: Escolha da Caçamba */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-[2fr,1fr] gap-8">
              {/* Left Column - Seleção */}
              <div className="space-y-6">
                {/* Escolha o Tamanho */}
                <div className="border-2 border-orange-500 rounded-lg p-6 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="w-6 h-6 text-orange-600" />
                    <h3 className="text-lg font-semibold">Escolha o Tamanho da sua Caçamba</h3>
                  </div>

                  <div className="relative">
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger className="w-full h-14 text-base border-2 border-gray-300 bg-white">
                        <SelectValue placeholder="Selecione o tamanho da caçamba" />
                      </SelectTrigger>
                      <SelectContent>
                        {cacambas.map((cacamba) => (
                          <SelectItem key={cacamba.size} value={cacamba.size} className="text-base py-3">
                            {cacamba.size} - R$ {cacamba.price},00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                        clique aqui
                      </span>
                    </div>
                  </div>
                </div>

                {/* Condições Incluídas */}
                <div className="border rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-lg">Condições Incluídas</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                      <span className="text-sm text-blue-600">Entrega inclusa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                      <span className="text-sm text-blue-600">Período de locação</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                      <span className="text-sm text-blue-600">Retirada agendada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                      <span className="text-sm text-blue-600">Melhor preço</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Benefícios */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Entrega rápida e segura</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Agendamento flexível</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Retirada inclusa</span>
                </div>
              </div>
            </div>

            {selectedSize && (
              <div className="bg-orange-600 text-white p-4 rounded-lg text-center">
                <p className="text-sm mb-1">Valor Total</p>
                <p className="text-3xl font-bold">R$ {selectedCacamba?.price},00</p>
              </div>
            )}

            <Button
              onClick={() => setStep(2)}
              disabled={!selectedSize}
              className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white text-base"
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Step 2: Dados */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center">Seus Dados</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="address">Endereço de Entrega *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, número"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Cidade"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="UF"
                    maxLength={2}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="zipCode">CEP *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  placeholder="00000-000"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="observations">Observações (opcional)</Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  placeholder="Alguma informação adicional?"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1 h-12">
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-white"
              >
                {loading ? "Processando..." : "Ir para Pagamento"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Pagamento */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center">Pagamento PIX</h3>

            <div className="bg-gray-50 border-2 border-orange-600 rounded-lg p-6 text-center space-y-4">
              <p className="text-lg font-semibold">Escaneie o QR Code para pagar</p>

              {/* Placeholder for QR Code */}
              <div className="bg-white p-4 inline-block rounded-lg">
                <img src="https://via.placeholder.com/200" alt="QR Code PIX" className="w-48 h-48" />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Ou copie o código PIX:</p>
                <div className="bg-white p-3 rounded border text-xs break-all">Placeholder Code</div>
                <Button onClick={() => alert("Código PIX copiado!")} variant="outline" className="w-full">
                  Copiar Código PIX
                </Button>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Valor a pagar:</p>
                <p className="text-3xl font-bold">R$ {selectedCacamba?.price},00</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
              <p className="font-semibold mb-2">Instruções:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Abra o app do seu banco</li>
                <li>Escolha pagar com PIX</li>
                <li>Escaneie o QR Code ou cole o código</li>
                <li>Confirme o pagamento</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600">© 2025 EXPRESS ENTULHOS - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  )
}
