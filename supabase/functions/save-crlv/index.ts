import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const {
      admin_id, session_token,
      renavam, placa, exercicio, numero_crv, seguranca_crv, cod_seg_cla,
      marca_modelo, ano_fab, ano_mod, cor, combustivel, especie_tipo,
      categoria, cat_obs, carroceria,
      chassi, placa_ant, potencia_cil, capacidade, lotacao, peso_bruto,
      motor, cmt, eixos,
      nome_proprietario, cpf_cnpj, local: localEmissao, data: dataEmissao,
      observacoes,
      qrcode_base64, // optional custom QR from user
    } = body;

    // Validate session
    const { data: validSession } = await supabase.rpc("is_valid_admin", {
      p_admin_id: admin_id,
      p_session_token: session_token,
    });

    if (!validSession) {
      return new Response(
        JSON.stringify({ error: "Sessão inválida" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check credits
    const { data: adminData } = await supabase
      .from("admins")
      .select("creditos")
      .eq("id", admin_id)
      .single();

    if (!adminData || adminData.creditos <= 0) {
      return new Response(
        JSON.stringify({ error: "Créditos insuficientes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate password from CPF
    const cleanCpf = cpf_cnpj.replace(/\D/g, "");
    const senha = cleanCpf.slice(-6);

    // Fetch the CRLV PNG template from storage
    const templateUrl = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/uploads/templates/crlv-template-base.png`;
    const templateResponse = await fetch(templateUrl);
    if (!templateResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Template CRLV PNG não encontrado no storage" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const templatePngBytes = new Uint8Array(await templateResponse.arrayBuffer());

    // Create a new PDF and embed the PNG as background
    const pdfDoc = await PDFDocument.create();
    const bgImage = await pdfDoc.embedPng(templatePngBytes);
    const { width: imgWidth, height: imgHeight } = bgImage.scale(1);

    // A4 page size in points (595.28 x 841.89)
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Draw background image scaled to fill the page
    page.drawImage(bgImage, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });

    // Embed fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const courier = await pdfDoc.embedFont(StandardFonts.Courier);

    // Helper: draw text at specific coordinates (from top-left)
    const drawText = (text: string, x: number, y: number, size = 9, font = courier) => {
      page.drawText(text || "", {
        x,
        y: pageHeight - y,
        size,
        font,
        color: rgb(0, 0, 0),
      });
    };

    // White out areas (no longer needed since template is clean, but keep for safety)
    const whiteOut = (x: number, y: number, w: number, h: number) => {
      page.drawRectangle({
        x,
        y: pageHeight - y - h,
        width: w,
        height: h,
        color: rgb(1, 1, 1),
      });
    };

    // ========== LEFT COLUMN ==========
    drawText(renavam, 18, 115, 12, helveticaBold);
    drawText(placa, 18, 146, 12, helveticaBold);
    drawText(exercicio, 130, 146, 12, helveticaBold);
    drawText(ano_fab, 18, 176, 12, helveticaBold);
    drawText(ano_mod, 130, 176, 12, helveticaBold);
    drawText(numero_crv, 18, 208, 11, helveticaBold);
    drawText(cod_seg_cla, 18, 328, 11, helveticaBold);
    drawText(cat_obs || "***", 200, 328, 11, helveticaBold);
    drawText(marca_modelo, 18, 363, 11, helveticaBold);
    drawText(especie_tipo, 18, 400, 11, helveticaBold);
    drawText(placa_ant || "*******/**", 18, 433, 11, helveticaBold);
    drawText(chassi, 135, 433, 10, helveticaBold);
    drawText(cor, 18, 465, 11, helveticaBold);
    drawText(combustivel, 135, 465, 10, helveticaBold);

    // ========== RIGHT COLUMN ==========
    drawText(categoria, 310, 105, 12, helveticaBold);
    drawText(capacidade || "*.*", 510, 105, 12, helveticaBold);
    drawText(potencia_cil, 310, 140, 12, helveticaBold);
    drawText(peso_bruto, 510, 140, 10, helveticaBold);
    drawText(motor, 310, 172, 10, helveticaBold);
    drawText(cmt, 476, 172, 10, helveticaBold);
    drawText(eixos, 520, 172, 10, helveticaBold);
    drawText(lotacao, 548, 172, 10, helveticaBold);
    drawText(carroceria, 310, 208, 11, helveticaBold);
    drawText(nome_proprietario, 310, 242, 11, helveticaBold);
    drawText(cpf_cnpj, 420, 276, 11, helveticaBold);
    drawText(localEmissao, 310, 310, 11, helveticaBold);
    drawText(dataEmissao, 520, 310, 10, helveticaBold);

    // ========== QR CODE ==========
    let qrcodeUrl: string | null = null;
    try {
      let qrBytes: Uint8Array;

      if (qrcode_base64 && qrcode_base64.length > 100) {
        const clean = qrcode_base64.replace(/^data:image\/\w+;base64,/, "");
        qrBytes = Uint8Array.from(atob(clean), (c: string) => c.charCodeAt(0));
      } else {
        const qrData = `https://qrcode-certificadodigital-vio.info/crlv?ren=${encodeURIComponent(renavam)}&pl=${encodeURIComponent(placa)}`;
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(qrData)}&format=png&ecc=M`;
        const qrResponse = await fetch(qrApiUrl);
        if (!qrResponse.ok) throw new Error("QR generation failed");
        qrBytes = new Uint8Array(await qrResponse.arrayBuffer());
      }

      const qrImg = await pdfDoc.embedPng(qrBytes);
      page.drawImage(qrImg, {
        x: 255,
        y: pageHeight - 280,
        width: 145,
        height: 145,
      });

      // Upload QR image
      const qrPath = `crlv_${cleanCpf}_qr.png`;
      await supabase.storage.from("uploads").upload(qrPath, qrBytes, {
        contentType: "image/png",
        upsert: true,
      });
      const { data: qrUrlData } = supabase.storage.from("uploads").getPublicUrl(qrPath);
      qrcodeUrl = qrUrlData?.publicUrl || null;
    } catch (qrErr) {
      console.error("QR code error:", qrErr);
    }

    // ========== OBSERVAÇÕES ==========
    if (observacoes) {
      const lines = observacoes.split("\n");
      lines.forEach((line: string, i: number) => {
        drawText(line, 25, 530 + i * 16, 11, helveticaBold);
      });
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const cleanPlaca = (placa || '').replace(/[^A-Za-z0-9]/g, '');
    const pdfPath = `CRLV_${cleanPlaca}.pdf`;

    const { error: pdfError } = await supabase.storage
      .from("uploads")
      .upload(pdfPath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    let pdfUrl: string | null = null;
    if (!pdfError) {
      const { data: pdfUrlData } = supabase.storage.from("uploads").getPublicUrl(pdfPath);
      pdfUrl = pdfUrlData?.publicUrl || null;
    }

    // Insert record
    const { data: inserted, error: insertError } = await supabase
      .from("usuarios_crlv")
      .insert({
        admin_id,
        renavam, placa, exercicio, numero_crv, seguranca_crv, cod_seg_cla,
        marca_modelo, ano_fab, ano_mod, cor, combustivel, especie_tipo,
        categoria, cat_obs, carroceria,
        chassi, placa_ant, potencia_cil, capacidade, lotacao, peso_bruto,
        motor, cmt, eixos,
        nome_proprietario, cpf_cnpj,
        local_emissao: localEmissao,
        data_emissao: dataEmissao,
        observacoes,
        qrcode_url: qrcodeUrl,
        pdf_url: pdfUrl,
        senha,
      })
      .select("id, data_expiracao")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Erro ao salvar CRLV", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deduct credit
    await supabase
      .from("admins")
      .update({ creditos: adminData.creditos - 1 })
      .eq("id", admin_id);

    // Record transaction
    await supabase.from("credit_transactions").insert({
      from_admin_id: admin_id,
      to_admin_id: admin_id,
      amount: 1,
      transaction_type: "crlv_creation",
    });

    return new Response(
      JSON.stringify({
        success: true,
        id: inserted.id,
        senha,
        pdf: pdfUrl,
        dataExpiracao: inserted.data_expiracao,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
