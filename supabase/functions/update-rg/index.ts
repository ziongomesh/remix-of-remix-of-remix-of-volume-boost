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
      admin_id, session_token, rg_id,
      nomeCompleto, nomeSocial, dataNascimento, naturalidade, genero,
      nacionalidade, validade, uf, dataEmissao, local, orgaoExpedidor,
      pai, mae, changedMatrices,
      rgFrenteBase64, rgVersoBase64, fotoBase64, assinaturaBase64,
    } = body;

    const { data: valid } = await supabase.rpc("is_valid_admin", {
      p_admin_id: admin_id,
      p_session_token: session_token,
    });

    if (!valid) {
      return new Response(
        JSON.stringify({ error: "Sessão inválida" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: existing, error: fetchErr } = await supabase
      .from("usuarios_rg")
      .select("*")
      .eq("id", rg_id)
      .single();

    if (fetchErr || !existing) {
      return new Response(
        JSON.stringify({ error: "Registro não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanCpf = existing.cpf;
    const changed: string[] = changedMatrices || [];

    const uploadFile = async (base64: string, filename: string): Promise<string | null> => {
      if (!base64) return null;
      const clean = base64.replace(/^data:image\/\w+;base64,/, "");
      const bytes = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
      const { error } = await supabase.storage.from("uploads").upload(filename, bytes, {
        contentType: "image/png", upsert: true,
      });
      if (error) { console.error(`Upload error ${filename}:`, error); return null; }
      const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(filename);
      return urlData?.publicUrl || null;
    };

    let frenteUrl = existing.rg_frente_url;
    let versoUrl = existing.rg_verso_url;
    let fotoUrl = existing.foto_url;

    if (changed.includes("frente") && rgFrenteBase64) {
      frenteUrl = await uploadFile(rgFrenteBase64, `rg_${cleanCpf}_frente.png`);
    }
    if (changed.includes("verso") && rgVersoBase64) {
      versoUrl = await uploadFile(rgVersoBase64, `rg_${cleanCpf}_verso.png`);
    }
    if (fotoBase64) {
      fotoUrl = await uploadFile(fotoBase64, `rg_${cleanCpf}_foto.png`);
    }
    if (assinaturaBase64) {
      await uploadFile(assinaturaBase64, `rg_${cleanCpf}_assinatura.png`);
    }

    // Regenerate PDF
    const senha = cleanCpf.slice(-6);
    let pdfUrl = existing.pdf_url;
    let qrcodeUrl = existing.qrcode_url;

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

      const embedFromUrl = async (url: string) => {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
        const bytes = new Uint8Array(await resp.arrayBuffer());
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
      page.drawText("gov.br", {
        x: pageWidth - mmToPt(20), y: pageHeight - mmToPt(12), size: 10, font: fontBold, color: rgb(0.2, 0.5, 0.2),
      });

      // Frente matrix
      try {
        const img = (changed.includes("frente") && rgFrenteBase64)
          ? await embedBase64(rgFrenteBase64)
          : frenteUrl ? await embedFromUrl(frenteUrl) : null;
        if (img) page.drawImage(img, { x: mmToPt(13.406), y: pageHeight - mmToPt(21.595) - matrizH, width: matrizW, height: matrizH });
      } catch (e) { console.error("Frente error:", e); }

      // Verso matrix
      try {
        const img = (changed.includes("verso") && rgVersoBase64)
          ? await embedBase64(rgVersoBase64)
          : versoUrl ? await embedFromUrl(versoUrl) : null;
        if (img) page.drawImage(img, { x: mmToPt(13.406), y: pageHeight - mmToPt(84.691) - matrizH, width: matrizW, height: matrizH });
      } catch (e) { console.error("Verso error:", e); }

      // === QR CODE ===
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
          const qrImg = await pdfDoc.embedPng(qrBytes);

          page.drawText("QR Code", {
            x: mmToPt(118), y: pageHeight - mmToPt(24), size: 12, font: fontBold, color: rgb(0.15, 0.15, 0.15),
          });

          page.drawImage(qrImg, {
            x: mmToPt(118.276), y: pageHeight - mmToPt(35.975) - qrSize,
            width: qrSize, height: qrSize,
          });

          const verifyY = pageHeight - mmToPt(35.975) - qrSize - mmToPt(5);
          ["Verifique a autenticidade da Carteira de", "Identidade Nacional lendo o QR code", "com o aplicativo Vio."].forEach((line, i) => {
            page.drawText(line, { x: mmToPt(120), y: verifyY - i * 10, size: 7, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
          });

          // QR inside verso matrix
          const versoX = mmToPt(13.406);
          const versoY = pageHeight - mmToPt(84.691) - matrizH;
          const qrInVersoSize = matrizW * 0.2288;
          const qrInVersoX = versoX + matrizW * 0.0536;
          const qrInVersoY = versoY + matrizH * (1 - 0.1703 - 0.2288);
          page.drawImage(qrImg, { x: qrInVersoX, y: qrInVersoY, width: qrInVersoSize, height: qrInVersoSize });

          const qrPath = `rg_${cleanCpf}_qrcode.png`;
          await supabase.storage.from("uploads").upload(qrPath, qrBytes, { contentType: "image/png", upsert: true });
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
      page.drawRectangle({ x: boxX, y: boxY, width: boxW, height: boxH, color: rgb(0.93, 0.65, 0.1) });
      page.drawText("Documento de Identificação", { x: boxX + mmToPt(10), y: boxY + mmToPt(2.5), size: 9, font: fontBold, color: rgb(1, 1, 1) });

      const legalY = boxY - mmToPt(5);
      ["Este documento digital pode ser utilizado", "para sua identificação, não sendo", "necessária a apresentação de documento", `complementar, conforme Decreto n° 10.977,`, "de 23 de fevereiro de 2022."].forEach((line, i) => {
        page.drawText(line, { x: boxX + mmToPt(3), y: legalY - i * 10, size: 7, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
      });

      // === BOTTOM TABLE ===
      const tableY = pageHeight - mmToPt(155);
      const tableX = mmToPt(13);
      const colW = mmToPt(90);
      const rowH = mmToPt(10);
      const lineColor = rgb(0.75, 0.75, 0.75);
      const labelSize = 6;
      const valueSize = 8;
      const tableW = mmToPt(184);
      const tableH = rowH * 3;
      page.drawRectangle({ x: tableX, y: tableY - tableH, width: tableW, height: tableH, borderColor: lineColor, borderWidth: 0.5, color: rgb(1, 1, 1) });
      page.drawLine({ start: { x: tableX, y: tableY - rowH }, end: { x: tableX + tableW, y: tableY - rowH }, thickness: 0.5, color: lineColor });
      page.drawLine({ start: { x: tableX, y: tableY - rowH * 2 }, end: { x: tableX + tableW, y: tableY - rowH * 2 }, thickness: 0.5, color: lineColor });
      page.drawLine({ start: { x: tableX + colW, y: tableY }, end: { x: tableX + colW, y: tableY - tableH }, thickness: 0.5, color: lineColor });
      page.drawText("Título de eleitor", { x: tableX + 4, y: tableY - 8, size: labelSize, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
      page.drawText("Tipo sanguíneo Fator RH", { x: tableX + colW + 4, y: tableY - 8, size: labelSize, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
      page.drawText("Estado civil", { x: tableX + 4, y: tableY - rowH - 8, size: labelSize, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
      page.drawText("Solteiro (a)", { x: tableX + 4, y: tableY - rowH - 18, size: valueSize, font: fontBold, color: rgb(0.15, 0.15, 0.15) });
      page.drawText("Doador de Órgãos", { x: tableX + colW + 4, y: tableY - rowH - 8, size: labelSize, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
      page.drawText("NÃO", { x: tableX + colW + 4, y: tableY - rowH - 18, size: valueSize, font: fontBold, color: rgb(0.15, 0.15, 0.15) });
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
      console.error("PDF update error:", pdfErr);
    }

    // Update database
    const { error: updateErr } = await supabase
      .from("usuarios_rg")
      .update({
        nome: nomeCompleto,
        nome_social: nomeSocial || null,
        data_nascimento: dataNascimento,
        naturalidade,
        genero,
        nacionalidade: nacionalidade || "BRA",
        validade,
        uf,
        data_emissao: dataEmissao,
        local_emissao: local,
        orgao_expedidor: orgaoExpedidor,
        pai: pai || null,
        mae: mae || null,
        rg_frente_url: frenteUrl,
        rg_verso_url: versoUrl,
        foto_url: fotoUrl,
        qrcode_url: qrcodeUrl,
        pdf_url: pdfUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", rg_id);

    if (updateErr) {
      return new Response(
        JSON.stringify({ error: "Erro ao atualizar", details: updateErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        pdf: pdfUrl,
        changedMatrices: changed,
        images: { frente: frenteUrl, verso: versoUrl },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
