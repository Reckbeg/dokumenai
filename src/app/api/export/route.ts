import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

function safeFilenamePart(value: string | null | undefined) {
  return (value || 'dokumen')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'dokumen';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = body?.data as Record<string, unknown> | undefined;
    const templateId = safeFilenamePart(body?.templateId);

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return NextResponse.json({ error: 'Data export tidak valid' }, { status: 400 });
    }

    const rows = Object.entries(data).filter(([key]) => !key.startsWith('_'));

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'DokumenAI';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Data');
    worksheet.columns = [
      { header: 'Field', key: 'field', width: 32 },
      { header: 'Value', key: 'value', width: 48 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F2937' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    for (const [field, value] of rows) {
      worksheet.addRow({
        field,
        value: value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value),
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `dokumenai_${templateId}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Gagal membuat file XLSX' }, { status: 500 });
  }
}
