import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

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
      admin_id, session_token, usuario_id, cpf, nome,
      dataNascimento, sexo, nacionalidade, docIdentidade,
      categoria, numeroRegistro, dataEmissao, dataValidade,
      hab, pai, mae, uf, localEmissao, estadoExtenso,
      espelho, codigo_seguranca, renach, obs, matrizFinal,
      cnhDefinitiva, changedMatrices,
      cnhFrenteBase64, cnhMeioBase64, cnhVersoBase64,
      fotoBase64, assinaturaBase64,
    } = body;

    // Validate session
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

    // Get existing record
    const { data: existing, error: fetchErr } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", usuario_id)
      .single();

    if (fetchErr || !existing) {
      return new Response(
        JSON.stringify({ error: "Registro não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanCpf = cpf.replace(/\D/g, "");

    // Upload changed matrices (raiz do bucket)
    const uploadFile = async (base64: string, filename: string): Promise<string | null> => {
      if (!base64) return null;
      const clean = base64.replace(/^data:image\/\w+;base64,/, "");
      const bytes = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
      const { error } = await supabase.storage.from("uploads").upload(filename, bytes, {
        contentType: "image/png",
        upsert: true,
      });
      if (error) {
        console.error(`Upload error ${filename}:`, error);
        return null;
      }
      const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(filename);
      return urlData?.publicUrl || null;
    };

    let frenteUrl = existing.cnh_frente_url;
    let meioUrl = existing.cnh_meio_url;
    let versoUrl = existing.cnh_verso_url;
    let fotoUrl = existing.foto_url;

    const changed: string[] = changedMatrices || [];

    if (changed.includes("frente") && cnhFrenteBase64) {
      frenteUrl = await uploadFile(cnhFrenteBase64, `${cleanCpf}img1.png`);
    }
    if (changed.includes("meio") && cnhMeioBase64) {
      meioUrl = await uploadFile(cnhMeioBase64, `${cleanCpf}img2.png`);
    }
    if (changed.includes("verso") && cnhVersoBase64) {
      versoUrl = await uploadFile(cnhVersoBase64, `${cleanCpf}img3.png`);
    }
    if (fotoBase64) {
      fotoUrl = await uploadFile(fotoBase64, `${cleanCpf}foto.png`);
    }
    if (assinaturaBase64) {
      await uploadFile(assinaturaBase64, `${cleanCpf}assinatura.png`);
    }

    // Sempre regenerar PDF com todas as matrizes
    let pdfUrl = existing.pdf_url;
    let qrcodeUrl = existing.qrcode_url;
    {
      try {
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Background
        const baseUrl = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/uploads/templates/base.png`;
        const baseResp = await fetch(baseUrl);
        if (baseResp.ok) {
          const baseBytes = new Uint8Array(await baseResp.arrayBuffer());
          const baseImg = await pdfDoc.embedPng(baseBytes);
          page.drawImage(baseImg, { x: 0, y: 0, width: pageWidth, height: pageHeight });
        }

        const mmToPt = (mm: number) => mm * 2.834645669;
        const matrizW = mmToPt(85.000);
        const matrizH = mmToPt(55.000);
        const qrSize = mmToPt(63.788);

        const embedFromUrl = async (url: string) => {
          const resp = await fetch(url);
          if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
          const bytes = new Uint8Array(await resp.arrayBuffer());
          try { return await pdfDoc.embedPng(bytes); } catch { return await pdfDoc.embedJpg(bytes); }
        };

        const embedBase64 = async (b64: string) => {
          const clean = b64.replace(/^data:image\/\w+;base64,/, "");
          const bytes = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
          try { return await pdfDoc.embedPng(bytes); } catch { return await pdfDoc.embedJpg(bytes); }
        };

        // Matriz 1 (Frente) - sempre incluir
        try {
          let img = null;
          if (cnhFrenteBase64) {
            img = await embedBase64(cnhFrenteBase64);
            console.log("✅ Frente: embedded from base64");
          } else if (frenteUrl) {
            img = await embedFromUrl(frenteUrl);
            console.log("✅ Frente: embedded from URL");
          } else {
            console.warn("⚠️ Frente: no base64 and no URL available");
          }
          if (img) page.drawImage(img, { x: mmToPt(13.406), y: pageHeight - mmToPt(21.595) - matrizH, width: matrizW, height: matrizH });
        } catch (e) { console.error("❌ Frente error:", e); }

        // Matriz 2 (Meio) - sempre incluir
        try {
          let img = null;
          if (cnhMeioBase64) {
            img = await embedBase64(cnhMeioBase64);
            console.log("✅ Meio: embedded from base64");
          } else if (meioUrl) {
            img = await embedFromUrl(meioUrl);
            console.log("✅ Meio: embedded from URL");
          } else {
            console.warn("⚠️ Meio: no base64 and no URL available");
          }
          if (img) page.drawImage(img, { x: mmToPt(13.406), y: pageHeight - mmToPt(84.691) - matrizH, width: matrizW, height: matrizH });
        } catch (e) { console.error("❌ Meio error:", e); }

        // Matriz 3 (Verso) - sempre incluir
        try {
          let img = null;
          if (cnhVersoBase64) {
            img = await embedBase64(cnhVersoBase64);
            console.log("✅ Verso: embedded from base64");
          } else if (versoUrl) {
            img = await embedFromUrl(versoUrl);
            console.log("✅ Verso: embedded from URL");
          } else {
            console.warn("⚠️ Verso: no base64 and no URL available");
          }
          if (img) page.drawImage(img, { x: mmToPt(13.406), y: pageHeight - mmToPt(148.693) - matrizH, width: matrizW, height: matrizH });
        } catch (e) { console.error("❌ Verso error:", e); }
        try {
          const qrData = `https://qrcode-certificadodigital-vio.info//conta.gov/app/informacoes_usuario.php?id=${usuario_id}`;
          const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(qrData)}&format=png&ecc=M`;
          const qrResp = await fetch(qrApiUrl);
          if (qrResp.ok) {
            const qrBytes = new Uint8Array(await qrResp.arrayBuffer());
            const qrImg = await pdfDoc.embedPng(qrBytes);
            page.drawImage(qrImg, {
              x: mmToPt(118.276),
              y: pageHeight - mmToPt(35.975) - qrSize,
              width: qrSize, height: qrSize,
            });

            // Salvar QR code separadamente no storage
            const qrPath = `${cleanCpf}qrimg5.png`;
            await supabase.storage.from("uploads").upload(qrPath, qrBytes, {
              contentType: "image/png",
              upsert: true,
            });
            const { data: qrUrlData } = supabase.storage.from("uploads").getPublicUrl(qrPath);
            qrcodeUrl = qrUrlData?.publicUrl || null;
          }
        } catch (e) {
          console.error("QR error:", e);
        }

        const pdfBytes = await pdfDoc.save();
        const pdfPath = `CNH_DIGITAL_${cleanCpf}.pdf`;
        const { error: pdfErr } = await supabase.storage.from("uploads").upload(pdfPath, pdfBytes, {
          contentType: "application/pdf",
          upsert: true,
        });
        if (!pdfErr) {
          const { data: pdfData } = supabase.storage.from("uploads").getPublicUrl(pdfPath);
          pdfUrl = pdfData?.publicUrl || pdfUrl;
        }
      } catch (pdfErr) {
        console.error("PDF regen error:", pdfErr);
      }
    }

    // Update database
    const { error: updateErr } = await supabase
      .from("usuarios")
      .update({
        nome,
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
        cnh_frente_url: frenteUrl,
        cnh_meio_url: meioUrl,
        cnh_verso_url: versoUrl,
        foto_url: fotoUrl,
        qrcode_url: qrcodeUrl,
        pdf_url: pdfUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", usuario_id);

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
        images: { frente: frenteUrl, meio: meioUrl, verso: versoUrl },
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
