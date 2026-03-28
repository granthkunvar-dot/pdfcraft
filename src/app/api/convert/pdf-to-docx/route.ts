import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import os from "os";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 20MB limit" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `input-${Date.now()}.pdf`);
    const outputPath = path.join(tmpDir, `output-${Date.now()}.docx`);

    await writeFile(inputPath, buffer);

    let pdfToDocx;
    try {
      pdfToDocx = require("pdf-to-docx");
    } catch (e) {
      throw new Error("Conversion library 'pdf-to-docx' not available in runtime environment.");
    }

    await new Promise((resolve, reject) => {
      pdfToDocx(inputPath, outputPath, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const docxBuffer = await readFile(outputPath);

    // cleanup
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});

    return new NextResponse(docxBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="converted.docx"`,
      },
    });

  } catch (error: any) {
    console.error("pdf-to-docx error:", error);
    return NextResponse.json({ error: "Conversion failed", details: error.message }, { status: 500 });
  }
}
