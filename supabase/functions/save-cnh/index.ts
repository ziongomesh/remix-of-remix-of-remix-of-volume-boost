import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";
import QRCode from "https://esm.sh/qrcode@1.5.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
      admin_id,
      session_token,
      cpf,
      nome,
      dataNascimento,
      sexo,
      nacionalidade,
      docIdentidade,
      categoria,
      numeroRegistro,
      dataEmissao,
      dataValidade,
      hab,
      pai,
      mae,
      uf,
      localEmissao,
      estadoExtenso,
      espelho,
      codigo_seguranca,
      renach,
      obs,
      matrizFinal,
      cnhDefinitiva,
      // Base64 images from canvas
      cnhFrenteBase64,
      cnhMeioBase64,
      cnhVersoBase64,
      fotoBase64,
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
    const { data: existingCnh } = await supabase
      .from("usuarios")
      .select("id, nome")
      .eq("cpf", cleanCpf)
      .maybeSingle();

    if (existingCnh) {
      return new Response(
        JSON.stringify({
          error: "CPF já cadastrado",
          details: { existingCnh },
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Gerar senha (últimos 6 dígitos do CPF)
    const senha = cleanCpf.slice(-6);

    // Upload das imagens para storage
    const timestamp = Date.now();
    const folder = `cnh/${cleanCpf}`;

    const uploadFile = async (
      base64: string,
      filename: string
    ): Promise<string | null> => {
      if (!base64) return null;
      // Remove data:image/png;base64, prefix
      const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
      const bytes = Uint8Array.from(atob(cleanBase64), (c) => c.charCodeAt(0));

      const path = `${folder}/${filename}`;
      const { error } = await supabase.storage
        .from("uploads")
        .upload(path, bytes, {
          contentType: "image/png",
          upsert: true,
        });

      if (error) {
        console.error(`Upload error for ${filename}:`, error);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(path);

      return urlData?.publicUrl || null;
    };

    const [frenteUrl, meioUrl, versoUrl, fotoUrl] = await Promise.all([
      uploadFile(cnhFrenteBase64, `frente_${timestamp}.png`),
      uploadFile(cnhMeioBase64, `meio_${timestamp}.png`),
      uploadFile(cnhVersoBase64, `verso_${timestamp}.png`),
      uploadFile(fotoBase64, `foto_${timestamp}.png`),
    ]);

    // Gerar PDF com base.png + matrizes posicionadas + QR code
    let pdfUrl: string | null = null;
    let qrcodeUrl: string | null = null;
    try {
      // mm para pontos PDF (1mm = 2.834645669pt)
      const mmToPt = (mm: number) => mm * 2.834645669;

      // A4 em pontos: 595.28 x 841.89
      const pageWidth = 595.28;
      const pageHeight = 841.89;

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      // 1) Carregar e desenhar base.png como fundo
      const baseUrl = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/uploads/templates/base.png`;
      const baseResponse = await fetch(baseUrl);
      if (baseResponse.ok) {
        const baseBytes = new Uint8Array(await baseResponse.arrayBuffer());
        const baseImg = await pdfDoc.embedPng(baseBytes);
        page.drawImage(baseImg, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      }

      // Helper para embed de base64 PNG
      const embedBase64 = async (b64: string) => {
        const clean = b64.replace(/^data:image\/\w+;base64,/, "");
        const bytes = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
        return await pdfDoc.embedPng(bytes);
      };

      // Coordenadas das matrizes (em mm convertidas para pt)
      // Baseado no template-generator: posições Y invertidas porque pdf-lib usa Y de baixo para cima

      // Matriz 1 (Verso) - parte superior do PDF (y alto em pdf-lib)
      // No template: y=118.547mm do topo → em pdf-lib: pageHeight - mmToPt(118.547) - altura
      const matrizW = mmToPt(85);
      const matrizH = mmToPt(55);

      // Matriz 3 (Verso) - topo: ~118mm do topo
      if (cnhVersoBase64) {
        const versoImg = await embedBase64(cnhVersoBase64);
        const yFromTop = mmToPt(118.547);
        page.drawImage(versoImg, {
          x: mmToPt(57.14),
          y: pageHeight - yFromTop - matrizH,
          width: matrizW,
          height: matrizH,
        });
      }

      // Matriz 2 (Meio) - meio: ~183mm do topo
      if (cnhMeioBase64) {
        const meioImg = await embedBase64(cnhMeioBase64);
        const yFromTop = mmToPt(183.441);
        page.drawImage(meioImg, {
          x: mmToPt(57.849),
          y: pageHeight - yFromTop - matrizH,
          width: matrizW,
          height: matrizH,
        });
      }

      // Matriz 1 (Frente/Final) - parte inferior: ~247mm do topo
      if (cnhFrenteBase64) {
        const frenteImg = await embedBase64(cnhFrenteBase64);
        const yFromTop = mmToPt(247.806);
        page.drawImage(frenteImg, {
          x: mmToPt(56.647),
          y: pageHeight - yFromTop - matrizH,
          width: matrizW,
          height: matrizH,
        });
      }

      // QR Code - gerar e posicionar
      // Posição: x=155.017mm, y=231.788mm, tamanho=77.192mm
      try {
        const qrData = `https://condutor-cnhdigital-vio-web.info/verificar?cpf=${cleanCpf}`;
        const qrDataUrl = await QRCode.toDataURL(qrData, { width: 400, margin: 1 });
        const qrClean = qrDataUrl.replace(/^data:image\/\w+;base64,/, "");
        const qrBytes = Uint8Array.from(atob(qrClean), (c) => c.charCodeAt(0));
        const qrImg = await pdfDoc.embedPng(qrBytes);
        const qrSize = mmToPt(77.192);
        const qrYFromTop = mmToPt(231.788);
        page.drawImage(qrImg, {
          x: mmToPt(155.017),
          y: pageHeight - qrYFromTop - qrSize,
          width: qrSize,
          height: qrSize,
        });

        // Upload QR code
        const qrPath = `${folder}/qrcode_${timestamp}.png`;
        await supabase.storage.from("uploads").upload(qrPath, qrBytes, {
          contentType: "image/png",
          upsert: true,
        });
        const { data: qrUrlData } = supabase.storage.from("uploads").getPublicUrl(qrPath);
        qrcodeUrl = qrUrlData?.publicUrl || null;
      } catch (qrErr) {
        console.error("QR code error:", qrErr);
      }

      const pdfBytes = await pdfDoc.save();
      const pdfPath = `${folder}/CNH_DIGITAL_${cleanCpf}.pdf`;

      const { error: pdfError } = await supabase.storage
        .from("uploads")
        .upload(pdfPath, pdfBytes, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (!pdfError) {
        const { data: pdfUrlData } = supabase.storage
          .from("uploads")
          .getPublicUrl(pdfPath);
        pdfUrl = pdfUrlData?.publicUrl || null;
      } else {
        console.error("PDF upload error:", pdfError);
      }
    } catch (pdfErr) {
      console.error("PDF generation error:", pdfErr);
    }

    // Salvar no banco de dados
    const { data: insertedCnh, error: insertError } = await supabase
      .from("usuarios")
      .insert({
        admin_id,
        cpf: cleanCpf,
        nome,
        senha,
        data_nascimento: dataNascimento,
        sexo,
        nacionalidade,
        doc_identidade: docIdentidade,
        categoria,
        numero_registro: numeroRegistro,
        data_emissao: dataEmissao,
        data_validade: dataValidade,
        hab,
        pai,
        mae,
        uf,
        local_emissao: localEmissao,
        estado_extenso: estadoExtenso,
        espelho,
        codigo_seguranca,
        renach,
        obs,
        matriz_final: matrizFinal,
        cnh_definitiva: cnhDefinitiva || "sim",
        foto_url: fotoUrl,
        cnh_frente_url: frenteUrl,
        cnh_meio_url: meioUrl,
        cnh_verso_url: versoUrl,
        pdf_url: pdfUrl,
        qrcode_url: qrcodeUrl,
      })
      .select("id, data_expiracao")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Erro ao salvar CNH", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Descontar 1 crédito
    await supabase
      .from("admins")
      .update({ creditos: adminData.creditos - 1 })
      .eq("id", admin_id);

    // Registrar transação
    await supabase.from("credit_transactions").insert({
      from_admin_id: admin_id,
      to_admin_id: admin_id,
      amount: 1,
      transaction_type: "cnh_creation",
    });

    return new Response(
      JSON.stringify({
        success: true,
        id: insertedCnh.id,
        senha,
        pdf: pdfUrl,
        dataExpiracao: insertedCnh.data_expiracao,
        images: { frente: frenteUrl, meio: meioUrl, verso: versoUrl },
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
