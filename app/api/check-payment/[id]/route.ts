import { type NextRequest, NextResponse } from "next/server"

const BLACKCAT_SECRET_KEY = "sk_TBDfMHZxcgA8T-ihmxtvYokdmhrYow5oQUs2ewLOOIpfHR4H"
const BLACKCAT_API_URL = "https://api.blackcatpagamentos.com/v1"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const transactionId = params.id

    console.log("[v0] Verificando status do pagamento:", transactionId)

    const response = await fetch(`${BLACKCAT_API_URL}/transactions/${transactionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BLACKCAT_SECRET_KEY}`,
      },
    })

    const responseText = await response.text()
    console.log("[v0] Status da resposta:", response.status)
    console.log("[v0] Resposta BlackCat:", responseText)

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      throw new Error(`Resposta inválida da API: ${responseText}`)
    }

    if (!response.ok) {
      console.error("[v0] Erro ao verificar pagamento:", responseData)
      throw new Error(responseData.message || "Erro ao verificar pagamento")
    }

    const transaction = responseData.data || responseData

    return NextResponse.json({
      success: true,
      status: transaction.status,
      paidAt: transaction.paidAt,
      paidAmount: transaction.paidAmount,
    })
  } catch (error: any) {
    console.error("[v0] Erro ao verificar pagamento:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
