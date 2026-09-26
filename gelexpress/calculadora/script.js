(function () {
  const form = document.querySelector("#calculator-form");
  const resetButton = document.querySelector("#reset-button");
  const copyButton = document.querySelector("#copy-button");
  const copyFeedback = document.querySelector("#copy-feedback");

  const fields = {
    price: document.querySelector("#price"),
    materials: document.querySelector("#materials"),
    hours: document.querySelector("#hours"),
    hourly: document.querySelector("#hourly"),
    fixed: document.querySelector("#fixed"),
    clients: document.querySelector("#clients"),
    goal: document.querySelector("#goal"),
  };

  const outputs = {
    recommended: document.querySelector("#recommended-price"),
    revenue: document.querySelector("#monthly-revenue"),
    profit: document.querySelector("#monthly-profit"),
    profitService: document.querySelector("#profit-service"),
    clientsGoal: document.querySelector("#clients-goal"),
    statusCard: document.querySelector("#status-card"),
    statusMessage: document.querySelector("#status-message"),
  };

  const defaults = {
    price: 50,
    materials: 8,
    hours: 2,
    hourly: 15,
    fixed: 150,
    clients: 20,
    goal: 1000,
  };

  const currency = new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });

  const number = (field, fallback = 0) => {
    const value = Number.parseFloat(field.value.replace?.(",", ".") ?? field.value);
    return Number.isFinite(value) ? Math.max(value, 0) : fallback;
  };

  function calculate() {
    const price = number(fields.price);
    const materials = number(fields.materials);
    const hours = Math.max(number(fields.hours, 1), 0.25);
    const hourly = number(fields.hourly);
    const fixed = number(fields.fixed);
    const clients = Math.max(Math.round(number(fields.clients, 1)), 1);
    const goal = number(fields.goal);

    const fixedPerClient = fixed / clients;
    const recommended = materials + hours * hourly + fixedPerClient;
    const revenue = price * clients;
    const totalMaterials = materials * clients;
    const profit = revenue - totalMaterials - fixed;
    const profitService = price - materials - fixedPerClient;
    const clientsGoal = price > 0 ? Math.ceil(goal / price) : 0;

    outputs.recommended.textContent = currency.format(recommended);
    outputs.revenue.textContent = currency.format(revenue);
    outputs.profit.textContent = currency.format(profit);
    outputs.profitService.textContent = currency.format(profitService);
    outputs.clientsGoal.textContent = String(clientsGoal);

    const coversMinimum = price >= recommended;
    outputs.statusCard.classList.toggle("warning", !coversMinimum);
    outputs.statusMessage.textContent = coversMinimum
      ? "O preço atual cobre a referência mínima calculada. Confirma ainda impostos e taxas aplicáveis."
      : `O preço atual está ${currency.format(recommended - price)} abaixo da referência mínima calculada.`;

    const values = { price, materials, hours, hourly, fixed, clients, goal };
    localStorage.setItem("gelExpressCalculator", JSON.stringify(values));

    return { recommended, revenue, profit, profitService, clientsGoal, ...values };
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem("gelExpressCalculator"));
      if (!saved) return;
      Object.entries(fields).forEach(([key, field]) => {
        if (Number.isFinite(saved[key])) field.value = saved[key];
      });
    } catch (_) {
      localStorage.removeItem("gelExpressCalculator");
    }
  }

  function reset() {
    Object.entries(fields).forEach(([key, field]) => {
      field.value = defaults[key];
    });
    localStorage.removeItem("gelExpressCalculator");
    calculate();
  }

  async function copySummary() {
    const result = calculate();
    const summary = [
      "Resumo - Calculadora Gel Express PRO",
      `Preço escolhido: ${currency.format(result.price)}`,
      `Preço mínimo recomendado: ${currency.format(result.recommended)}`,
      `Clientes previstas: ${result.clients}`,
      `Faturação mensal: ${currency.format(result.revenue)}`,
      `Lucro estimado: ${currency.format(result.profit)}`,
      `Clientes necessárias para a meta: ${result.clientsGoal}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      copyFeedback.textContent = "Resumo copiado.";
    } catch (_) {
      copyFeedback.textContent = "Não foi possível copiar automaticamente. Faz uma captura do resultado.";
    }
    window.setTimeout(() => { copyFeedback.textContent = ""; }, 3000);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    calculate();
    document.querySelector("#results-title").scrollIntoView({ behavior: "smooth", block: "center" });
  });

  Object.values(fields).forEach((field) => field.addEventListener("input", calculate));
  resetButton.addEventListener("click", reset);
  copyButton.addEventListener("click", copySummary);

  restore();
  calculate();
})();
