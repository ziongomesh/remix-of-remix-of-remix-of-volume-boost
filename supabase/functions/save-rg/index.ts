import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
      admin_id, session_token, cpf, nomeCompleto, nomeSocial,
      dataNascimento, naturalidade, genero, nacionalidade, validade,
      uf, dataEmissao, local, orgaoExpedidor, pai, mae,
      rgFrenteBase64, rgVersoBase64, fotoBase64, assinaturaBase64,
    } = body;

    // Validar sessão
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

    // Verificar créditos
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

    // Verificar CPF duplicado
    const cleanCpf = cpf.replace(/\D/g, "");
    const { data: existingRg } = await supabase
      .from("usuarios_rg")
      .select("id, nome")
      .eq("cpf", cleanCpf)
      .maybeSingle();

    if (existingRg) {
      return new Response(
        JSON.stringify({ error: "CPF já cadastrado", details: { existingRg } }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Senha = últimos 6 dígitos do CPF
    const senha = cleanCpf.slice(-6);

    // Upload helper
    const uploadFile = async (base64: string, filename: string): Promise<string | null> => {
      if (!base64) return null;
      const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
      const bytes = Uint8Array.from(atob(cleanBase64), (c) => c.charCodeAt(0));
      const { error } = await supabase.storage.from("uploads").upload(filename, bytes, {
        contentType: "image/png", upsert: true,
      });
      if (error) { console.error(`Upload error ${filename}:`, error); return null; }
      const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(filename);
      return urlData?.publicUrl || null;
    };

    const [frenteUrl, versoUrl, fotoUrl] = await Promise.all([
      uploadFile(rgFrenteBase64, `rg_${cleanCpf}_frente.png`),
      uploadFile(rgVersoBase64, `rg_${cleanCpf}_verso.png`),
      uploadFile(fotoBase64, `rg_${cleanCpf}_foto.png`),
    ]);

    if (assinaturaBase64) {
      await uploadFile(assinaturaBase64, `rg_${cleanCpf}_assinatura.png`);
    }

    // Insert
    const { data: insertedRg, error: insertError } = await supabase
      .from("usuarios_rg")
      .insert({
        admin_id,
        cpf: cleanCpf,
        nome: nomeCompleto,
        nome_social: nomeSocial || null,
        senha,
        data_nascimento: dataNascimento,
        naturalidade,
        genero,
        nacionalidade: nacionalidade || 'BRA',
        validade,
        uf,
        data_emissao: dataEmissao,
        local_emissao: local,
        orgao_expedidor: orgaoExpedidor,
        pai: pai || null,
        mae: mae || null,
        foto_url: fotoUrl,
        rg_frente_url: frenteUrl,
        rg_verso_url: versoUrl,
      })
      .select("id, data_expiracao")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Erro ao salvar RG", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rgId = insertedRg.id;

    // Generate PDF
    let pdfUrl: string | null = null;
    let qrcodeUrl: string | null = null;
    try {
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const mmToPt = (mm: number) => mm * 2.8346;
      const matrizW = mmToPt(85);
      const matrizH = mmToPt(55);
      const qrSizeMm = 63.788;
      const qrSize = mmToPt(qrSizeMm);
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      // Fonts
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontCourier = await pdfDoc.embedFont(StandardFonts.Courier);

      // Background
      const bgUrl = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/uploads/templates/rg-pdf-bg.png`;
      const bgResp = await fetch(bgUrl);
      if (bgResp.ok) {
        const bgBytes = new Uint8Array(await bgResp.arrayBuffer());
        const bgImg = await pdfDoc.embedPng(bgBytes);
        page.drawImage(bgImg, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      }

      const embedBase64 = async (b64: string) => {
        const clean = b64.replace(/^data:image\/\w+;base64,/, "");
        const bytes = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
        try { return await pdfDoc.embedPng(bytes); } catch { return await pdfDoc.embedJpg(bytes); }
      };

      // === HEADER ===
      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`;
      
      page.drawText("Carteira de Identidade", {
        x: mmToPt(13), y: pageHeight - mmToPt(10), size: 14, font: fontBold, color: rgb(0.15, 0.15, 0.15),
      });
      page.drawText(`Compartilhado pelo aplicativo `, {
        x: mmToPt(13), y: pageHeight - mmToPt(15), size: 8, font: fontRegular, color: rgb(0.4, 0.4, 0.4),
      });
      page.drawText("gov.br", {
        x: mmToPt(13) + fontRegular.widthOfTextAtSize("Compartilhado pelo aplicativo ", 8),
        y: pageHeight - mmToPt(15), size: 8, font: fontBold, color: rgb(0.15, 0.15, 0.15),
      });
      const afterGovbr = mmToPt(13) + fontRegular.widthOfTextAtSize("Compartilhado pelo aplicativo ", 8) + fontBold.widthOfTextAtSize("gov.br", 8);
      page.drawText(` em ${dateStr}`, {
        x: afterGovbr, y: pageHeight - mmToPt(15), size: 8, font: fontRegular, color: rgb(0.4, 0.4, 0.4),
      });

      // gov.br logo text (top right)
      page.drawText("gov.br", {
        x: pageWidth - mmToPt(20), y: pageHeight - mmToPt(12), size: 10, font: fontBold, color: rgb(0.2, 0.5, 0.2),
      });

      // Frente matrix
      if (rgFrenteBase64 && rgFrenteBase64.length > 100) {
        const img = await embedBase64(rgFrenteBase64);
        page.drawImage(img, { x: mmToPt(13.406), y: pageHeight - mmToPt(21.595) - matrizH, width: matrizW, height: matrizH });
      }

      // Verso matrix
      if (rgVersoBase64 && rgVersoBase64.length > 100) {
        const img = await embedBase64(rgVersoBase64);
        page.drawImage(img, { x: mmToPt(13.406), y: pageHeight - mmToPt(84.691) - matrizH, width: matrizW, height: matrizH });
      }

      // === QR CODE ===
      let qrImg: any = null;
      try {
        const qrLink = `https://govbr.consulta-rgdigital-vio.info/qr/index.php?cpf=${cleanCpf}`;
        const qrPayload = JSON.stringify({
          url: qrLink, doc: "RG_DIGITAL", ver: "2.0",
          cpf: cleanCpf, nome: nomeCompleto, ns: nomeSocial || "",
          dn: dataNascimento, sx: genero, nac: nacionalidade || "BRA",
          nat: naturalidade, uf, de: dataEmissao, dv: validade,
          le: local, oe: orgaoExpedidor, pai: pai || "", mae: mae || "",
          tp: "CARTEIRA_IDENTIDADE_NACIONAL", org: "SSP/" + uf,
          sn: senha, ts: Date.now(),
        });
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrPayload)}&format=png&ecc=M`;
        const qrResponse = await fetch(qrApiUrl);
        if (qrResponse.ok) {
          const qrBytes = new Uint8Array(await qrResponse.arrayBuffer());
          qrImg = await pdfDoc.embedPng(qrBytes);

          // "QR Code" label
          page.drawText("QR Code", {
            x: mmToPt(118), y: pageHeight - mmToPt(24), size: 12, font: fontBold, color: rgb(0.15, 0.15, 0.15),
          });

          // QR image
          page.drawImage(qrImg, {
            x: mmToPt(118.276), y: pageHeight - mmToPt(35.975) - qrSize,
            width: qrSize, height: qrSize,
          });

          // Verification text below QR
          const verifyY = pageHeight - mmToPt(35.975) - qrSize - mmToPt(5);
          const verifyLines = [
            "Verifique a autenticidade da Carteira de",
            "Identidade Nacional lendo o QR code",
            "com o aplicativo Vio.",
          ];
          verifyLines.forEach((line, i) => {
            page.drawText(line, {
              x: mmToPt(120), y: verifyY - i * 10, size: 7, font: fontRegular, color: rgb(0.4, 0.4, 0.4),
            });
          });

          // QR INSIDE verso matrix
          const versoX = mmToPt(13.406);
          const versoY = pageHeight - mmToPt(84.691) - matrizH;
          const qrInVersoSize = matrizW * 0.2288;
          const qrInVersoX = versoX + matrizW * 0.0536;
          const qrInVersoY = versoY + matrizH * (1 - 0.1703 - 0.2288);
          page.drawImage(qrImg, { x: qrInVersoX, y: qrInVersoY, width: qrInVersoSize, height: qrInVersoSize });

          // Save QR
          const qrPath = `rg_${cleanCpf}_qrcode.png`;
          await supabase.storage.from("uploads").upload(qrPath, qrBytes, {
            contentType: "image/png", upsert: true,
          });
          const { data: qrUrlData } = supabase.storage.from("uploads").getPublicUrl(qrPath);
          qrcodeUrl = qrUrlData?.publicUrl || null;
        }
      } catch (qrErr) {
        console.error("QR code error:", qrErr);
      }

      // === DOCUMENTO DE IDENTIFICAÇÃO BOX ===
      const boxX = mmToPt(108);
      const boxY = pageHeight - mmToPt(120);
      const boxW = mmToPt(90);
      const boxH = mmToPt(8);
      // Orange background
      page.drawRectangle({ x: boxX, y: boxY, width: boxW, height: boxH, color: rgb(0.93, 0.65, 0.1) });
      page.drawText("Documento de Identificação", {
        x: boxX + mmToPt(10), y: boxY + mmToPt(2.5), size: 9, font: fontBold, color: rgb(1, 1, 1),
      });

      // Legal text below box
      const legalY = boxY - mmToPt(5);
      const legalLines = [
        "Este documento digital pode ser utilizado",
        "para sua identificação, não sendo",
        "necessária a apresentação de documento",
        `complementar, conforme Decreto n° 10.977,`,
        "de 23 de fevereiro de 2022.",
      ];
      legalLines.forEach((line, i) => {
        page.drawText(line, {
          x: boxX + mmToPt(3), y: legalY - i * 10, size: 7, font: fontRegular, color: rgb(0.3, 0.3, 0.3),
        });
      });

      // === BOTTOM TABLE ===
      const tableY = pageHeight - mmToPt(155);
      const tableX = mmToPt(13);
      const colW = mmToPt(90);
      const rowH = mmToPt(10);
      const lineColor = rgb(0.75, 0.75, 0.75);
      const labelSize = 6;
      const valueSize = 8;

      // Draw table border
      const tableW = mmToPt(184);
      const tableH = rowH * 3;
      page.drawRectangle({ x: tableX, y: tableY - tableH, width: tableW, height: tableH, borderColor: lineColor, borderWidth: 0.5, color: rgb(1, 1, 1) });

      // Horizontal lines
      page.drawLine({ start: { x: tableX, y: tableY - rowH }, end: { x: tableX + tableW, y: tableY - rowH }, thickness: 0.5, color: lineColor });
      page.drawLine({ start: { x: tableX, y: tableY - rowH * 2 }, end: { x: tableX + tableW, y: tableY - rowH * 2 }, thickness: 0.5, color: lineColor });

      // Vertical line
      page.drawLine({ start: { x: tableX + colW, y: tableY }, end: { x: tableX + colW, y: tableY - tableH }, thickness: 0.5, color: lineColor });

      // Row 1: Título de eleitor | Tipo sanguíneo Fator RH
      page.drawText("Título de eleitor", { x: tableX + 4, y: tableY - 8, size: labelSize, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
      page.drawText("Tipo sanguíneo Fator RH", { x: tableX + colW + 4, y: tableY - 8, size: labelSize, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });

      // Row 2: Estado civil | Doador de Órgãos
      page.drawText("Estado civil", { x: tableX + 4, y: tableY - rowH - 8, size: labelSize, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
      page.drawText("Solteiro (a)", { x: tableX + 4, y: tableY - rowH - 18, size: valueSize, font: fontBold, color: rgb(0.15, 0.15, 0.15) });
      page.drawText("Doador de Órgãos", { x: tableX + colW + 4, y: tableY - rowH - 8, size: labelSize, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
      page.drawText("NÃO", { x: tableX + colW + 4, y: tableY - rowH - 18, size: valueSize, font: fontBold, color: rgb(0.15, 0.15, 0.15) });

      // Row 3: Assinatura | Certidão de Nasc Casamento Averb. Divórcio
      page.drawText("Assinatura", { x: tableX + 4, y: tableY - rowH * 2 - 8, size: labelSize, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
      page.drawText("Certidão de Nasc Casamento Averb. Divórcio", { x: tableX + colW + 4, y: tableY - rowH * 2 - 8, size: labelSize, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });

      // Flatten
      const tempPdfBytes = await pdfDoc.save();
      const tempDoc = await PDFDocument.load(tempPdfBytes);
      const flatDoc = await PDFDocument.create();
      const [embeddedPage] = await flatDoc.embedPages(tempDoc.getPages());
      const flatPage = flatDoc.addPage([pageWidth, pageHeight]);
      flatPage.drawPage(embeddedPage, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      const pdfBytes = await flatDoc.save();
      const pdfPath = `RG_DIGITAL_${cleanCpf}.pdf`;
      const { error: pdfError } = await supabase.storage.from("uploads").upload(pdfPath, pdfBytes, {
        contentType: "application/pdf", upsert: true,
      });
      if (!pdfError) {
        const { data: pdfUrlData } = supabase.storage.from("uploads").getPublicUrl(pdfPath);
        pdfUrl = pdfUrlData?.publicUrl || null;
      }
    } catch (pdfErr) {
      console.error("PDF generation error:", pdfErr);
    }

    // Update with QR and PDF URLs
    await supabase.from("usuarios_rg").update({ qrcode_url: qrcodeUrl, pdf_url: pdfUrl }).eq("id", rgId);

    // Debit 1 credit
    await supabase.from("admins").update({ creditos: adminData.creditos - 1 }).eq("id", admin_id);

    // Log transaction
    await supabase.from("credit_transactions").insert({
      from_admin_id: admin_id, to_admin_id: admin_id, amount: 1, transaction_type: "rg_creation",
    });

    return new Response(
      JSON.stringify({
        success: true, id: rgId, senha, pdf: pdfUrl,
        dataExpiracao: insertedRg.data_expiracao,
        images: { frente: frenteUrl, verso: versoUrl },
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
