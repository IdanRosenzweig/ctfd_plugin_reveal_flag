document.addEventListener('DOMContentLoaded', () => {
  const revealed = new Map();

  const updateFlagBox = () => {
    const input = document.querySelector('#challenge-id');
    if (!input) return;

    const chalId = input.value;
    if (!chalId) return;

    const existing = document.querySelector('#revealed-flag');
    if (existing) return; // already rendered

    if (revealed.has(chalId)) {
      render(revealed.get(chalId), chalId);
      return;
    }

    const container = document.querySelector('#challenge-input')?.parentElement
                    || document.querySelector('.modal-content .form-group:last-child')
                    || document.body;

    const box = document.createElement('div');
    box.id = 'revealed-flag';
    box.className = 'mt-3 text-center';
    box.textContent = 'Loading...';
    container.appendChild(box);

    fetch(`/api/v1/reveal_flag/${chalId}`, { credentials: 'same-origin' })
      .then(r => r.json())
      .then(data => {
        revealed.set(chalId, data);
        render(data, chalId);
      })
      .catch(() => {
        box.remove();
      });
  };

  const render = (data, id) => {
    const box = document.querySelector('#revealed-flag');
    if (!box) return;

    if (data.success && data.flags?.length > 0) {
      let html = '<strong>current flag';
      if (data.flag_count > 1) html += `s (${data.flag_count})`;
      html += ':</strong><br>';

      data.flags.forEach(f => {
        html += `<code class="flag">${f}</code><br>`;
      });

      box.innerHTML = html;
    } else {
      box.remove();
    }
  };

  const observer = new MutationObserver(() => {
    if (document.querySelector('#challenge-input, #challenge-submit')) {
      updateFlagBox();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
