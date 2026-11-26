(function () {
  const SUPORTE_WHATSAPP = "923105102";
  const SUPORTE_IBAN = "Coloca aqui o teu IBAN ou Multicaixa Express";

  function mostrarTelaBloqueio(igrejaNome, motivo) {
    if (document.getElementById("tela-bloqueio-assinatura")) return;
    const overlay = document.createElement("div");
    overlay.id = "tela-bloqueio-assinatura";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(2,6,23,0.97);z-index:99999;display:grid;place-items:center;padding:20px;color:#f1f5f9;font-family:sans-serif;text-align:center;";
    overlay.innerHTML = `
      <div style="max-width:460px;background:#0f172a;border:2px solid #ef4444;border-radius:18px;padding:32px;box-shadow:0 20px 50px rgba(0,0,0,0.8);">
        <div style="font-size:48px;margin-bottom:12px;">🔒</div>
        <h2 style="color:#facc15;font-size:22px;margin-bottom:10px;">Assinatura Expirada</h2>
        <p style="color:#cbd5e1;font-size:14px;line-height:1.5;margin-bottom:18px;">
          O acesso aos painéis administrativos da igreja <strong>${igrejaNome || ""}</strong> encontra-se temporariamente suspenso (${motivo}).
        </p>
        <div style="background:#020617;border:1px solid #334155;border-radius:12px;padding:14px;margin-bottom:20px;font-size:13px;text-align:left;">
          <p style="color:#94a3b8;margin-bottom:6px;">Para reativar imediatamente (+30 dias):</p>
          <p style="margin-bottom:4px;">💳 <strong>Pagamento:</strong> ${SUPORTE_IBAN}</p>
          <p>📱 <strong>Enviar comprovativo (WhatsApp):</strong> ${SUPORTE_WHATSAPP}</p>
        </div>
        <button onclick="localStorage.clear();location.reload();" style="background:#facc15;color:#020617;border:none;padding:12px 24px;border-radius:10px;font-weight:700;cursor:pointer;width:100%;">
          Verificar Novamente / Sair
        </button>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function mostrarAvisoVencimento(diasRestantes) {
    if (document.getElementById("banner-aviso-assinatura")) return;
    const banner = document.createElement("div");
    banner.id = "banner-aviso-assinatura";
    banner.style.cssText = "background:#eab308;color:#020617;padding:8px 16px;text-align:center;font-weight:700;font-size:13px;position:sticky;top:0;z-index:9998;";
    banner.textContent = `⚠️ Atenção: A assinatura da igreja vence em ${diasRestantes} dia(s). Contacte o suporte (${SUPORTE_WHATSAPP}) para renovar.`;
    document.body.prepend(banner);
  }

  async function checarAssinaturaDaIgreja() {
    try {
      const partes = window.location.pathname.split("/");
      const slug = partes[2];
      if (!slug) return;

      const res = await fetch("/api/igrejas");
      if (!res.ok) return;
      const lista = await res.json();
      const igreja = lista.find(i => i.slug === slug);
      if (!igreja) return;

      if (igreja.ativo === false) {
        mostrarTelaBloqueio(igreja.nome, "conta desativada");
        return;
      }

      if (igreja.dataExpiracao) {
        const hoje = new Date();
        const exp = new Date(igreja.dataExpiracao);
        const diffMs = exp - hoje;
        const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffMs < 0) {
          mostrarTelaBloqueio(igreja.nome, "venceu em " + exp.toLocaleDateString("pt-PT"));
        } else if (dias <= 5) {
          mostrarAvisoVencimento(dias);
        }
      }
    } catch (e) {}
  }

  window.addEventListener("DOMContentLoaded", checarAssinaturaDaIgreja);
})();
