import { type NextRequest, NextResponse } from "next/server"

const BLACKCAT_SECRET_KEY = "sk_TBDfMHZxcgA8T-ihmxtvYokdmhrYow5oQUs2ewLOOIpfHR4H"
const BLACKCAT_API_URL = "https://api.blackcatpagamentos.com/v1"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, cpf, address, city, state, zipCode, size, amount, observations } = body

    const transactionData = {
      amount: Math.round(amount * 100), // Converter para centavos (inteiro)
      currency: "BRL",
      paymentMethod: "pix",
      postbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`,
      metadata: JSON.stringify({ size, observations }),
      externalRef: `cacamba-${Date.now()}`, // Referência única
      items: [
        {
          title: `Caçamba ${size} para Entulho`,
          quantity: 1,
          tangible: true,
          unitPrice: Math.round(amount * 100),
          externalRef: `cacamba-${size}`,
        },
      ],
      customer: {
        name,
        email,
        phone: phone.replace(/\D/g, ""),
        document: {
          type: "cpf",
          number: cpf.replace(/\D/g, ""),
        },
        address: {
          street: address,
          streetNumber: "S/N",
          zipCode: zipCode.replace(/\D/g, ""),
          neighborhood: "Centro",
          city,
          state,
          country: "BR",
        },
      },
    }

    console.log("[v0] Criando transação BlackCat:", JSON.stringify(transactionData, null, 2))

    const response = await fetch(`${BLACKCAT_API_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BLACKCAT_SECRET_KEY}`,
      },
      body: JSON.stringify(transactionData),
    })

    const responseText = await response.text()
    console.log("[v0] Status da resposta:", response.status)
    console.log("[v0] Resposta BlackCat (texto):", responseText)

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      throw new Error(`Resposta inválida da API: ${responseText}`)
    }

    if (!response.ok) {
      console.error("[v0] Erro na API BlackCat:", responseData)
      throw new Error(responseData.message || responseData.error || "Erro ao criar transação")
    }

    console.log("[v0] Transação criada com sucesso:", responseData)

    const transaction = responseData.data || responseData

    if (!transaction.pix?.qrcode) {
      throw new Error("QR Code PIX não foi gerado pela API")
    }

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      secureId: transaction.secureId,
      qrcode: transaction.pix.qrcode,
      expirationDate: transaction.pix.expirationDate,
      amount: transaction.amount,
      status: transaction.status,
    })
  } catch (error: any) {
    console.error("[v0] Erro ao criar pagamento:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro ao processar pagamento",
      },
      { status: 500 },
    )
  }
}
