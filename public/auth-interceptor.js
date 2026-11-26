(function () {
  const originalFetch = window.fetch;

  window.fetch = async function (resource, config = {}) {
    const url = typeof resource === "string" ? resource : (resource && resource.url) || "";

    // 1. Se for uma chamada para a API, anexa o token JWT guardado
    if (url.includes("/api/")) {
      const token = localStorage.getItem("jwt_token_sistema");
      if (token) {
        config.headers = new Headers(config.headers || {});
        if (!config.headers.has("Authorization")) {
          config.headers.set("Authorization", "Bearer " + token);
        }
      }
    }

    const response = await originalFetch(resource, config);

    // 2. Se for uma resposta de login que devolveu token, guarda-o automaticamente
    if (url.includes("/login") && response.ok) {
      try {
        const clone = response.clone();
        const data = await clone.json();
        if (data && data.token) {
          localStorage.setItem("jwt_token_sistema", data.token);
        }
      } catch (e) {}
    }

    return response;
  };
})();
