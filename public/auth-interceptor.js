(function () {
  const originalFetch = window.fetch;

  window.fetch = async function (resource, config = {}) {
    const url = typeof resource === "string" ? resource : (resource && resource.url) || "";

    if (url.includes("/api/")) {
      const token = localStorage.getItem("jwt_token_sistema");
      if (token) {
        const headersAtuais = config.headers instanceof Headers
          ? Object.fromEntries(config.headers.entries())
          : (config.headers || {});

        config = {
          ...config,
          headers: {
            ...headersAtuais,
            "Authorization": "Bearer " + token
          }
        };
      }
    }

    const response = await originalFetch(resource, config);

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
