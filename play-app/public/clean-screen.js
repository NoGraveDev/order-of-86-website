// Presentation only: never change gameplay, room state, or individual HUD preferences.
const button = document.getElementById('menusToggle');
const menuKeys = new Set(['KeyM', 'KeyP', 'KeyC']);
function setCleanScreen(hidden) {
  document.body.classList.toggle('clean-screen', hidden);
  button.textContent = hidden ? 'Show menus' : 'Hide menus';
  button.setAttribute('aria-pressed', String(hidden));
  button.title = hidden ? 'Show menus and overlays' : 'Hide menus and overlays';
}
button.addEventListener('click', () => {
  setCleanScreen(!document.body.classList.contains('clean-screen'));
  document.getElementById('world').focus({preventScroll: true});
});
// An intentional menu shortcut restores the HUD; action dialogs (E) still work normally.
addEventListener('keydown', event => {
  if (!document.body.classList.contains('clean-screen') || event.repeat ||
      document.querySelector('dialog[open]') || document.body.classList.contains('sled-racing') ||
      event.target?.closest?.('input,textarea,select,[contenteditable="true"]')) return;
  if (menuKeys.has(event.code)) setCleanScreen(false);
}, true);
