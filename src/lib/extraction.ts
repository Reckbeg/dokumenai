
import { getTemplate, type Template } from './templates';
import { PDFParse } from 'pdf-parse';

const LLM_BASE_URL = process.env.LLM_BASE_URL || 'http://localhost:4000/v1';
const LLM_API_KEY = process.env.LLM_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'mimo-v2.5-pro';
const VISION_MODEL = process.env.VISION_MODEL || 'gpt-4o-mini';

interface ExtractionResult {
  data: Record<string, any>;
  rawText: string;
  confidence: number;
}

export async function extractFromDocument(
  fileBuffer: Buffer,
  fileType: string,
  templateId: string,
): Promise<ExtractionResult> {
  const template = getTemplate(templateId);
  if (!template) throw new Error('Template not found');

  // Step 1: OCR - read the document content
  const rawText = await ocrDocument(fileBuffer, fileType);

  // Step 2: Extract structured data using template
  const data = await extractStructuredData(rawText, template);

  // Step 3: Calculate confidence
  const confidence = calculateConfidence(data, template);

  return { data, rawText, confidence };
}

async function ocrDocument(fileBuffer: Buffer, fileType: string): Promise<string> {
  const isImage = fileType.startsWith('image/');
  const isPdf = fileType === 'application/pdf';

  if (isImage) {
    const base64 = fileBuffer.toString('base64');
    const mimeType = fileType;
    
    const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Read and transcribe ALL text from this document image. Include every detail: names, numbers, dates, addresses, items, amounts. Preserve the structure. Output only the transcribed text, nothing else. If the document is in Indonesian/Bahasa, keep it in Indonesian.',
              },
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
            ],
          },
        ],
        max_tokens: 4000,
      }),
    });

    const result = await response.json() as any;
    return result.choices?.[0]?.message?.content || '';
  }

  if (isPdf) {
    const parser = new PDFParse({ data: fileBuffer });

    try {
      const result = await parser.getText();
      const text = result.text.trim();

      if (!text) {
        throw new Error('PDF tidak memiliki teks yang bisa dibaca. Untuk PDF hasil scan, upload halaman sebagai gambar JPG/PNG dulu.');
      }

      return text;
    } finally {
      await parser.destroy();
    }
  }

  throw new Error('Unsupported file type. Please upload an image (JPG, PNG) or PDF.');
}

async function extractStructuredData(rawText: string, template: Template): Promise<Record<string, any>> {
  const fieldsDescription = template.fields
    .map(f => `- ${f.key} (${f.labelId}): ${f.type}${f.required ? ' [WAJIB]' : ''}`)
    .join('\n');

  const prompt = `Kamu adalah AI yang mengekstrak data dari dokumen bisnis Indonesia.

DOKUMEN:
${rawText}

TEMPLATE: ${template.nameId}
Ekstrak field berikut:
${fieldsDescription}

${template.promptHint}

ATURAN:
1. Output HARUS dalam format JSON valid
2. Jika field tidak ditemukan, gunakan null
3. Untuk currency, gunakan angka tanpa titik/koma (contoh: 150000 bukan 150.000 atau Rp 150.000)
4. Untuk date, gunakan format YYYY-MM-DD
5. Jika ragu, tulis nilai yang kamu lihat di dokumen
6. Pastikan semua field yang WAJIB diisi

Output HANYA JSON, tanpa penjelasan:`;

  const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 2000,
    }),
  });

  const result = await response.json() as any;
  const content = result.choices?.[0]?.message?.content || '{}';
  
  // Parse JSON from response (handle markdown code blocks)
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
  const jsonStr = jsonMatch[1]?.trim() || content.trim();
  
  try {
    return JSON.parse(jsonStr);
  } catch {
    // Try to find JSON object in the text
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }
    return { _error: 'Gagal parse response AI', _raw: content };
  }
}

function calculateConfidence(data: Record<string, any>, template: Template): number {
  const requiredFields = template.fields.filter(f => f.required);
  const filledRequired = requiredFields.filter(f => data[f.key] != null && data[f.key] !== '');
  const optionalFields = template.fields.filter(f => !f.required);
  const filledOptional = optionalFields.filter(f => data[f.key] != null && data[f.key] !== '');
  
  const requiredScore = requiredFields.length > 0 ? (filledRequired.length / requiredFields.length) * 70 : 70;
  const optionalScore = optionalFields.length > 0 ? (filledOptional.length / optionalFields.length) * 30 : 30;
  
  return Math.round(requiredScore + optionalScore);
}
