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

    // Fetch the CRLV PDF template from storage
    const templateUrl = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/uploads/templates/crlv-template.pdf`;
    const templateResponse = await fetch(templateUrl);
    if (!templateResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Template CRLV não encontrado no storage" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const templateBytes = new Uint8Array(await templateResponse.arrayBuffer());
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const page = pages[0];
    const { width: pageWidth, height: pageHeight } = page.getSize();

    // Embed fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const courier = await pdfDoc.embedFont(StandardFonts.Courier);

    // Helper: draw text at specific coordinates (from top-left)
    // The PDF coordinate system starts from bottom-left, so we convert
    const drawText = (text: string, x: number, y: number, size = 9, font = courier) => {
      page.drawText(text || "", {
        x,
        y: pageHeight - y,
        size,
        font,
        color: rgb(0, 0, 0),
      });
    };

    // White out areas that need to be replaced (cover existing data with white rectangles)
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
    // CÓDIGO RENAVAM - clear and redraw
    whiteOut(18, 100, 200, 20);
    drawText(renavam, 18, 115, 12, helveticaBold);

    // PLACA
    whiteOut(18, 132, 100, 18);
    drawText(placa, 18, 146, 12, helveticaBold);

    // EXERCÍCIO
    whiteOut(130, 132, 90, 18);
    drawText(exercicio, 130, 146, 12, helveticaBold);

    // ANO FABRICAÇÃO
    whiteOut(18, 162, 100, 18);
    drawText(ano_fab, 18, 176, 12, helveticaBold);

    // ANO MODELO
    whiteOut(130, 162, 90, 18);
    drawText(ano_mod, 130, 176, 12, helveticaBold);

    // NÚMERO DO CRV
    whiteOut(18, 192, 200, 20);
    drawText(numero_crv, 18, 208, 11, helveticaBold);

    // CÓDIGO DE SEGURANÇA DO CLA
    whiteOut(18, 312, 165, 20);
    drawText(cod_seg_cla, 18, 328, 11, helveticaBold);

    // CAT
    whiteOut(195, 312, 50, 20);
    drawText(cat_obs || "***", 200, 328, 11, helveticaBold);

    // MARCA / MODELO / VERSÃO
    whiteOut(18, 347, 230, 22);
    drawText(marca_modelo, 18, 363, 11, helveticaBold);

    // ESPÉCIE / TIPO
    whiteOut(18, 382, 230, 22);
    drawText(especie_tipo, 18, 400, 11, helveticaBold);

    // PLACA ANTERIOR / UF
    whiteOut(18, 418, 110, 18);
    drawText(placa_ant || "*******/**", 18, 433, 11, helveticaBold);

    // CHASSI
    whiteOut(135, 418, 120, 18);
    drawText(chassi, 135, 433, 10, helveticaBold);

    // COR PREDOMINANTE
    whiteOut(18, 450, 110, 18);
    drawText(cor, 18, 465, 11, helveticaBold);

    // COMBUSTÍVEL
    whiteOut(135, 450, 120, 18);
    drawText(combustivel, 135, 465, 10, helveticaBold);

    // ========== RIGHT COLUMN ==========
    // CATEGORIA
    whiteOut(310, 87, 190, 22);
    drawText(categoria, 310, 105, 12, helveticaBold);

    // CAPACIDADE
    whiteOut(500, 87, 80, 22);
    drawText(capacidade || "*.*", 510, 105, 12, helveticaBold);

    // POTÊNCIA/CILINDRADA
    whiteOut(310, 122, 190, 22);
    drawText(potencia_cil, 310, 140, 12, helveticaBold);

    // PESO BRUTO TOTAL
    whiteOut(500, 122, 80, 22);
    drawText(peso_bruto, 510, 140, 10, helveticaBold);

    // MOTOR
    whiteOut(310, 156, 165, 20);
    drawText(motor, 310, 172, 10, helveticaBold);

    // CMT
    whiteOut(476, 156, 40, 20);
    drawText(cmt, 476, 172, 10, helveticaBold);

    // EIXOS
    whiteOut(518, 156, 25, 20);
    drawText(eixos, 520, 172, 10, helveticaBold);

    // LOTAÇÃO
    whiteOut(545, 156, 40, 20);
    drawText(lotacao, 548, 172, 10, helveticaBold);

    // CARROCERIA
    whiteOut(310, 190, 280, 22);
    drawText(carroceria, 310, 208, 11, helveticaBold);

    // NOME
    whiteOut(310, 224, 280, 22);
    drawText(nome_proprietario, 310, 242, 11, helveticaBold);

    // CPF / CNPJ
    whiteOut(420, 258, 170, 22);
    drawText(cpf_cnpj, 420, 276, 11, helveticaBold);

    // LOCAL
    whiteOut(310, 292, 190, 22);
    drawText(localEmissao, 310, 310, 11, helveticaBold);

    // DATA
    whiteOut(520, 292, 70, 22);
    drawText(dataEmissao, 520, 310, 10, helveticaBold);

    // ========== QR CODE ==========
    // White out existing QR code area
    whiteOut(240, 100, 175, 195);

    // Generate or use custom QR
    let qrcodeUrl: string | null = null;
    try {
      let qrBytes: Uint8Array;

      if (qrcode_base64 && qrcode_base64.length > 100) {
        // User provided custom QR
        const clean = qrcode_base64.replace(/^data:image\/\w+;base64,/, "");
        qrBytes = Uint8Array.from(atob(clean), (c: string) => c.charCodeAt(0));
      } else {
        // Generate dense QR with vehicle data as URL params
        const crlvDenseParams = [
          `doc=CRLV_DIGITAL`,
          `&ver=2026`,
          `&ren=${encodeURIComponent(renavam)}`,
          `&pl=${encodeURIComponent(placa)}`,
          `&ex=${encodeURIComponent(exercicio)}`,
          `&crv=${encodeURIComponent(numero_crv || '')}`,
          `&cla=${encodeURIComponent(cod_seg_cla || '')}`,
          `&mm=${encodeURIComponent(marca_modelo)}`,
          `&af=${encodeURIComponent(ano_fab || '')}`,
          `&am=${encodeURIComponent(ano_mod || '')}`,
          `&cr=${encodeURIComponent(cor || '')}`,
          `&cb=${encodeURIComponent(combustivel || '')}`,
          `&et=${encodeURIComponent(especie_tipo || '')}`,
          `&cat=${encodeURIComponent(categoria || '')}`,
          `&car=${encodeURIComponent(carroceria || '')}`,
          `&ch=${encodeURIComponent(chassi || '')}`,
          `&pc=${encodeURIComponent(potencia_cil || '')}`,
          `&cap=${encodeURIComponent(capacidade || '')}`,
          `&lot=${encodeURIComponent(lotacao || '')}`,
          `&pb=${encodeURIComponent(peso_bruto || '')}`,
          `&mt=${encodeURIComponent(motor || '')}`,
          `&cm=${encodeURIComponent(cmt || '')}`,
          `&ei=${encodeURIComponent(eixos || '')}`,
          `&np=${encodeURIComponent(nome_proprietario)}`,
          `&cpf=${encodeURIComponent(cpf_cnpj)}`,
          `&lc=${encodeURIComponent(localEmissao || '')}`,
          `&dt=${encodeURIComponent(dataEmissao || '')}`,
          `&obs=${encodeURIComponent(observacoes || '')}`,
          `&v1=CERTIFICADO-REGISTRO-LICENCIAMENTO-VEICULO-REPUBLICA-FEDERATIVA-DO-BRASIL`,
          `&v2=DEPARTAMENTO-NACIONAL-DE-TRANSITO-MINISTERIO-DA-INFRAESTRUTURA`,
          `&v3=DOCUMENTO-ASSINADO-DIGITALMENTE-COM-CERTIFICADO-ICP-BRASIL-CONFORME-MP-2200-2-2001`,
          `&v4=SERVICO-FEDERAL-DE-PROCESSAMENTO-DE-DADOS-SERPRO-ASSINADOR-DIGITAL`,
          `&v5=INFRAESTRUTURA-DE-CHAVES-PUBLICAS-BRASILEIRA-AUTORIDADE-CERTIFICADORA`,
          `&v6=REGISTRO-NACIONAL-VEICULOS-AUTOMOTORES-SISTEMA-RENAVAM-DENATRAN`,
          `&v7=DOCUMENTO-OFICIAL-ELETRONICO-COM-VALIDADE-JURIDICA-EM-TODO-TERRITORIO-NACIONAL`,
          `&v8=CERTIFICADO-DIGITAL-TIPO-A3-TOKEN-CRIPTOGRAFICO-NIVEL-SEGURANCA-ALTO`,
          `&ts=${Date.now()}`,
        ].join('');
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(crlvDenseParams)}&format=png&ecc=H`;
        const qrResponse = await fetch(qrApiUrl);
        if (!qrResponse.ok) throw new Error("QR generation failed");
        qrBytes = new Uint8Array(await qrResponse.arrayBuffer());
      }

      const qrImg = await pdfDoc.embedPng(qrBytes);
      // Place QR in the original position (between left and right columns)
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
    whiteOut(18, 505, 270, 245);
    if (observacoes) {
      const lines = observacoes.split("\n");
      lines.forEach((line: string, i: number) => {
        drawText(line, 25, 530 + i * 16, 11, helveticaBold);
      });
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const pdfPath = `CRLV_DIGITAL_${cleanCpf}.pdf`;

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
