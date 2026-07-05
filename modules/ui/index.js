export function init(engine, options = {}) {
  console.log('[ui] init', options);
  return {
    createHUD(container) {
      const el = document.createElement('div');
      el.style.position = 'absolute'; el.style.left='8px'; el.style.top='8px'; el.style.color='#ffd700';
      container.appendChild(el);
      return {
        set(text) { el.textContent = text; }
      };
    },
    registerWidget(widget) { console.log('[ui] registerWidget', widget); }
  };
}
