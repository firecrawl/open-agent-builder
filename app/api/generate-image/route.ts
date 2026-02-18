import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/huggingface";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, width, height } = body as {
      prompt: string;
      width?: number;
      height?: number;
    };

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const apiToken = process.env.HF_API_TOKEN;

    const imageBlob = await generateImage(prompt, {
      apiToken,
      width: width || 512,
      height: height || 512,
    });

    // Convert blob to base64
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({ image: dataUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Image generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
