
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generatePaymentInstruction = async (title: string, amount: number) => {
  try {
    // Validação de entrada
    if (!title || amount <= 0) {
      throw new Error('Invalid input parameters');
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Modelo correto da API Gemini
      contents: `Gere uma mensagem curta e profissional de instrução de pagamento para um carnê de "${title}" no valor de R$ ${amount.toFixed(2)}.`,
    });
    return response.text || "Pagamento via PIX disponível para sua comodidade.";
  } catch (error) {
    // Log de erro em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro ao gerar instrução de pagamento:', error);
    }
    return "Utilize o QR Code para realizar o pagamento via PIX.";
  }
};

function crc16(data: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function f(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export const generatePixPayload = (params: {
  key: string;
  name: string;
  city: string;
  amount: number;
  txid?: string;
}) => {
  const { key, name, city, amount, txid = "CPX" } = params;

  // Limpeza agressiva de strings para padrão PIX (apenas ASCII básico, sem acentos ou caracteres especiais)
  const cleanKey = key.replace(/[^a-zA-Z0-9@.-]/g, "");
  const cleanName = name.normalize("NFD").replace(/[^a-zA-Z0-9 ]/g, "").toUpperCase().substring(0, 25);
  const cleanCity = city.normalize("NFD").replace(/[^a-zA-Z0-9 ]/g, "").toUpperCase().substring(0, 15);
  const cleanTxid = txid.replace(/[^a-zA-Z0-9]/g, "").substring(0, 25);
  const amountStr = amount.toFixed(2);

  const merchantAccount = f("00", "br.gov.bcb.pix") + f("01", cleanKey);

  const payload = [
    f("00", "01"),           // Payload Format Indicator
    f("26", merchantAccount), // Merchant Account Info
    f("52", "0000"),          // Merchant Category Code
    f("53", "986"),           // Transaction Currency (BRL)
    f("54", amountStr),       // Transaction Amount
    f("58", "BR"),            // Country Code
    f("59", cleanName),       // Merchant Name
    f("60", cleanCity),       // Merchant City
    f("62", f("05", cleanTxid || "***")), // Additional Data (TXID)
  ].join("");

  const finalPayload = payload + "6304";
  return finalPayload + crc16(finalPayload);
};
