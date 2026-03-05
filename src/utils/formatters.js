export function formatarDataBR(dataISO) {
  if (!dataISO) return "—";
  const d = new Date(dataISO);
  return isNaN(d.getTime()) 
    ? dataISO 
    : d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function linkWhatsApp(telefone, mensagem = "") {
  const t = (telefone || "").replace(/\D/g, "");
  const num = t.startsWith("55") ? t : "55" + t;
  return `https://wa.me/${num}?text=${encodeURIComponent(mensagem)}`;
}