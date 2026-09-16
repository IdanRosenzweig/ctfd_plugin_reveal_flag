document.addEventListener('DOMContentLoaded', () => {

  const revealed = new Map();
  let timeoutId = null;

  const renderFlag = (data) => {
    let box = document.querySelector('#revealed-flag');

    if (data.success && data.flags?.length > 0) {
      if (!box) {
        // support both the core theme (#challenge) and the modern theme (.challenge-modal-body)
        const container = document.querySelector('#challenge')
                       || document.querySelector('.challenge-modal-body');
        if (!container) {
          return;
	}

        box = document.createElement('div');
        box.id = 'revealed-flag';
        box.className = 'mt-3 text-center';
        container.appendChild(box);
      }

      const currentHTML = box.innerHTML;
      // Build the list with DOM APIs so flag contents are inserted as text and
      // can't inject markup into the page
      const fragment = document.createDocumentFragment();
      const label = document.createElement('strong');
      label.textContent = `Current flag${data.flags.length > 1 ? `s (${data.flags.length})` : ''}:`;
      fragment.appendChild(label);
      fragment.appendChild(document.createElement('br'));

      data.flags.forEach(flag => {
        const code = document.createElement('code');
        code.className = 'flag p-1 rounded';
        code.style.cursor = 'pointer';
        code.title = 'Click to copy';
        code.textContent = flag;
        fragment.appendChild(code);
        fragment.appendChild(document.createElement('br'));
      });

      const scratch = document.createElement('div');
      scratch.appendChild(fragment.cloneNode(true));
      const newHTML = scratch.innerHTML;

      if (currentHTML !== newHTML) {
        box.replaceChildren(fragment);

        box.querySelectorAll('code.flag').forEach(code => {
          code.addEventListener('click', () => {
            const flagText = code.textContent;
            navigator.clipboard.writeText(flagText).then(() => {
              const originalText = code.textContent;
              code.textContent = 'Copied!';
              setTimeout(() => {
                code.textContent = originalText;
              }, 1500);
            });
          });
        });
      }

    } else if (box) {
      box.remove();
    }
  };

  const updateFlagBox = () => {
    const input = document.querySelector('#challenge-id');
    if (!input) return;

    const chalId = input.value.trim();
    if (!chalId) return;

    if (revealed.has(chalId)) {
      renderFlag(revealed.get(chalId));
      return;
    }

    fetch(`/api/v1/reveal_flag/${chalId}`, {
      credentials: 'same-origin',
      cache: 'no-store'
    })
      .then(r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(data => {
        revealed.set(chalId, data);
        renderFlag(data);
      })
      .catch(() => {
        document.querySelector('#revealed-flag')?.remove();
      });
  };

  const modalContainer = document.getElementById('challenge-modal')
                      || document.querySelector('.modal.fade')
                      || document.querySelector('.modal')
                      || document.body;

  const observer = new MutationObserver(() => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      const isModalOpen = !!document.querySelector('#challenge-input, #challenge-submit');

      if (isModalOpen) {
        updateFlagBox();
      } else {
        document.querySelector('#revealed-flag')?.remove();
      }
    }, 100);
  });

  observer.observe(modalContainer, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });

});
