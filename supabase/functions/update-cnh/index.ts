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
          const img = (changed.includes("frente") && cnhFrenteBase64)
            ? await embedBase64(cnhFrenteBase64)
            : frenteUrl ? await embedFromUrl(frenteUrl) : null;
          if (img) page.drawImage(img, { x: mmToPt(13.406), y: pageHeight - mmToPt(21.595) - matrizH, width: matrizW, height: matrizH });
        } catch (e) { console.error("Frente error:", e); }

        // Matriz 2 (Meio) - sempre incluir
        try {
          const img = (changed.includes("meio") && cnhMeioBase64)
            ? await embedBase64(cnhMeioBase64)
            : meioUrl ? await embedFromUrl(meioUrl) : null;
          if (img) page.drawImage(img, { x: mmToPt(13.406), y: pageHeight - mmToPt(84.691) - matrizH, width: matrizW, height: matrizH });
        } catch (e) { console.error("Meio error:", e); }

        // Matriz 3 (Verso) - sempre incluir
        try {
          const img = (changed.includes("verso") && cnhVersoBase64)
            ? await embedBase64(cnhVersoBase64)
            : versoUrl ? await embedFromUrl(versoUrl) : null;
          if (img) page.drawImage(img, { x: mmToPt(13.406), y: pageHeight - mmToPt(148.693) - matrizH, width: matrizW, height: matrizH });
          console.log("Matriz 3 (Verso):", { hasNew: changed.includes("verso") && !!cnhVersoBase64, hasUrl: !!versoUrl, drawn: !!img });
        } catch (e) { console.error("Verso error:", e); }
        try {
          const baseUrl = `https://qrcode-certificadodigital-vio.info//conta.gov/app/informacoes_usuario.php?id=${usuario_id}`;
          const denseParams = [
            `&doc=CNH_DIGITAL`,
            `&ver=3.1.0`,
            `&cpf=${cleanCpf}`,
            `&nm=${encodeURIComponent(nome)}`,
            `&dn=${encodeURIComponent(dataNascimento || '')}`,
            `&sx=${encodeURIComponent(sexo || '')}`,
            `&nac=${encodeURIComponent(nacionalidade || '')}`,
            `&di=${encodeURIComponent(docIdentidade || '')}`,
            `&cat=${encodeURIComponent(categoria || '')}`,
            `&nr=${encodeURIComponent(numeroRegistro || '')}`,
            `&de=${encodeURIComponent(dataEmissao || '')}`,
            `&dv=${encodeURIComponent(dataValidade || '')}`,
            `&hab=${encodeURIComponent(hab || '')}`,
            `&pai=${encodeURIComponent(pai || '')}`,
            `&mae=${encodeURIComponent(mae || '')}`,
            `&uf=${encodeURIComponent(uf || '')}`,
            `&le=${encodeURIComponent(localEmissao || '')}`,
            `&ee=${encodeURIComponent(estadoExtenso || '')}`,
            `&esp=${encodeURIComponent(espelho || '')}`,
            `&cs=${encodeURIComponent(codigo_seguranca || '')}`,
            `&ren=${encodeURIComponent(renach || '')}`,
            `&mf=${encodeURIComponent(matrizFinal || '')}`,
            `&def=${encodeURIComponent(cnhDefinitiva || 'sim')}`,
            `&obs=${encodeURIComponent(obs || '')}`,
            `&org=DETRAN`,
            `&pais=BRASIL`,
            `&lb=Lei9503`,
            `&rc=ResCONTRAN598`,
            `&cert=AC_SERPRO_RFB_SSL_v2`,
            `&chain=ICP-Brasil_v5`,
            `&alg=RSA-SHA256`,
            `&ks=2048`,
            `&hash=${cleanCpf}${numeroRegistro}${espelho}${codigo_seguranca}${renach}`,
            `&sig=SERPRO-${cleanCpf}-${Date.now()}`,
            `&ts=${Date.now()}`,
            `&sn=${Date.now().toString(16).toUpperCase()}${cleanCpf.slice(0, 6)}`,
            `&v1=CARTEIRA-NACIONAL-DE-HABILITACAO-REPUBLICA-FEDERATIVA-DO-BRASIL`,
            `&v2=DEPARTAMENTO-NACIONAL-DE-TRANSITO-MINISTERIO-DA-INFRAESTRUTURA`,
            `&v3=DOCUMENTO-ASSINADO-DIGITALMENTE-COM-CERTIFICADO-ICP-BRASIL-CONFORME-MP-2200-2-2001`,
            `&v4=SERVICO-FEDERAL-DE-PROCESSAMENTO-DE-DADOS-SERPRO-ASSINADOR-DIGITAL`,
            `&v5=INFRAESTRUTURA-DE-CHAVES-PUBLICAS-BRASILEIRA-AUTORIDADE-CERTIFICADORA`,
            `&v6=REGISTRO-NACIONAL-DE-CARTEIRA-DE-HABILITACAO-SISTEMA-RENACH-DENATRAN`,
            `&v7=VALIDACAO-BIOMETRICA-CONFIRMADA-SISTEMA-NACIONAL-IDENTIFICACAO-CIVIL`,
            `&v8=DOCUMENTO-OFICIAL-ELETRONICO-COM-VALIDADE-JURIDICA-EM-TODO-TERRITORIO-NACIONAL`,
            `&v9=CODIGO-VERIFICADOR-AUTENTICIDADE-${cleanCpf}-${numeroRegistro}-${espelho}`,
            `&v10=CERTIFICADO-DIGITAL-TIPO-A3-TOKEN-CRIPTOGRAFICO-NIVEL-SEGURANCA-ALTO`,
            `&v11=PROTOCOLO-SEGURANCA-TRANSPORTE-TLS-1-3-CRIPTOGRAFIA-AES-256-GCM-AUTENTICACAO-HMAC-SHA384`,
            `&v12=SISTEMA-NACIONAL-HABILITACAO-ELETRONICO-MODULO-VERIFICACAO-INTEGRIDADE-DOCUMENTAL-V4`,
            `&v13=AUTORIDADE-REGISTRO-CERTIFICACAO-DIGITAL-SERPRO-RECEITA-FEDERAL-BRASIL-CADEIA-V5`,
            `&v14=PADRAO-ASSINATURA-DIGITAL-AVANCADA-XADES-CADES-PADES-CONFORME-DOC-ICP-15-03`,
            `&v15=CARIMBO-TEMPO-AUTENTICADO-AUTORIDADE-CERTIFICADORA-TEMPO-ACT-REDE-ICP-BRASIL`,
            `&v16=MODULO-SEGURANCA-CRIPTOGRAFICA-HSM-CERTIFICADO-FIPS-140-2-NIVEL-3-HOMOLOGADO`,
            `&v17=REGISTRO-AUDITORIA-OPERACOES-CRIPTOGRAFICAS-LOG-IMUTAVEL-BLOCKCHAIN-PERMISSIONADO`,
            `&v18=POLITICA-CERTIFICACAO-TIPO-A3-OID-2-16-76-1-2-3-8-NIVEL-SEGURANCA-ALTO`,
            `&v19=VERIFICACAO-REVOGACAO-CERTIFICADO-OCSP-CRL-TEMPO-REAL-AUTORIDADE-CERTIFICADORA`,
            `&v20=ALGORITMO-HASH-SHA-512-ASSINATURA-RSA-4096-CURVA-ELIPTICA-SECP384R1-ECDSA`,
            `&v21=REPOSITORIO-CERTIFICADOS-REVOGADOS-LISTA-LCR-PUBLICACAO-PERIODICA-24H`,
            `&v22=SELO-CRONOLOGICO-DIGITAL-CARIMBO-TEMPO-RFC-3161-AUTORIDADE-CERTIFICADORA-RAIZ`,
            `&v23=CONTROLE-ACESSO-BIOMETRICO-MULTIPLO-FATOR-AUTENTICACAO-IDENTIDADE-DIGITAL`,
            `&v24=NORMA-TECNICA-ABNT-NBR-ISO-IEC-27001-SEGURANCA-INFORMACAO-GESTAO-RISCOS`,
            `&v25=FRAMEWORK-GOVERNANCA-DIGITAL-DECRETO-10332-2020-ESTRATEGIA-GOVERNO-DIGITAL`,
            `&v26=INTEROPERABILIDADE-SISTEMAS-GOVERNO-EPING-PADRAO-METADADOS-GOVERNO-ELETRONICO`,
            `&v27=MODELO-MATURIDADE-SEGURANCA-CIBERNETICA-CMMC-NIVEL-5-CERTIFICACAO-AVANCADA`,
            `&v28=PROTOCOLO-AUTENTICACAO-FEDERADA-SAML-2-0-OAUTH-2-0-OPENID-CONNECT-1-0`,
            `&v29=INFRAESTRUTURA-CHAVES-PUBLICAS-HIERARQUIA-CERTIFICACAO-AC-RAIZ-AC-INTERMEDIARIA`,
            `&v30=DOCUMENTO-TRANSITO-ELETRONICO-SEGURO-VERIFICAVEL-AUDITAVEL-RASTREAVEL-INTEGRO`,
          ].join('');
          const qrData = baseUrl + denseParams;
          const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrData)}&format=png&ecc=H`;
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
