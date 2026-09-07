async function carregarCargas() {
  const container = document.getElementById("cargas");

  try {
    const resposta = await fetch("/api/cargas");
    const cargas = await resposta.json();

    document.getElementById("total").textContent = cargas.length;
    document.getElementById("disponiveis").textContent =
      cargas.filter(c => c.status === "Disponível").length;
    document.getElementById("andamento").textContent =
      cargas.filter(c => c.status === "Em andamento").length;
    document.getElementById("entregues").textContent =
      cargas.filter(c => c.status === "Entregue").length;

    if (cargas.length === 0) {
      container.innerHTML =
        '<p class="carregando">Nenhuma carga cadastrada.</p>';
      return;
    }

    container.innerHTML = cargas.map(carga => `
      <div class="carga">
        <h3>${escapar(carga.carga)}</h3>

        <div class="info">
          <div>
            <span>Valor</span>
            R$ ${Number(carga.valor).toFixed(2)}
          </div>

          <div>
            <span>Motorista</span>
            ${escapar(carga.motorista)}
          </div>

          <div>
            <span>Placa</span>
            ${escapar(carga.placa)}
          </div>

          <div>
            <span>Local de coleta</span>
            ${escapar(carga.local_coleta)}
          </div>

          <div>
            <span>Local de entrega</span>
            ${escapar(carga.local_entrega)}
          </div>

          <div>
            <span>Data</span>
            ${carga.data_carga
              ? new Date(carga.data_carga).toLocaleDateString("pt-BR")
              : "-"}
          </div>
        </div>

        <div class="status">
          ${escapar(carga.status)}
        </div>

        ${
          carga.observacao
            ? `<p style="margin-top:15px;color:#9aa7b5;">
                ${escapar(carga.observacao)}
              </p>`
            : ""
        }
      </div>
    `).join("");

  } catch (erro) {
    container.innerHTML =
      '<p class="carregando">Erro ao carregar as cargas.</p>';
  }
}

function escapar(texto) {
  if (texto === null || texto === undefined) return "";

  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

carregarCargas();

setInterval(carregarCargas, 15000);
