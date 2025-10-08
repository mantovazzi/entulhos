import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[v0] ===== WEBHOOK RECEBIDO =====")
    console.log("[v0] Tipo:", body.type)
    console.log("[v0] Dados completos:", JSON.stringify(body, null, 2))

    if (body.type === "transaction") {
      const transaction = body.data

      console.log("[v0] Transaction ID:", transaction.id)
      console.log("[v0] Status:", transaction.status)
      console.log("[v0] Valor pago:", transaction.paidAmount)

      if (transaction.status === "paid") {
        console.log("[v0] ✅ PAGAMENTO CONFIRMADO!")
        console.log("[v0] Cliente:", transaction.customer?.name)
        console.log("[v0] Email:", transaction.customer?.email)
        console.log("[v0] Metadata:", transaction.metadata)

        // Aqui você pode:
        // - Enviar email de confirmação
        // - Atualizar banco de dados
        // - Notificar equipe de entrega
        // - Enviar WhatsApp
      } else if (transaction.status === "waiting_payment") {
        console.log("[v0] ⏳ Aguardando pagamento...")
      } else if (transaction.status === "refunded") {
        console.log("[v0] 💰 Pagamento estornado")
      } else {
        console.log("[v0] ⚠️ Status desconhecido:", transaction.status)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] ❌ Erro ao processar webhook:", error)
    return NextResponse.json({ error: "Erro ao processar webhook" }, { status: 500 })
  }
}
