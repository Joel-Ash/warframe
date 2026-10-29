const tabs = ['/main', '/guide', '/moding'];

const currentPath = window.location.pathname.replace(/\/$/, '');
const currentIndex = tabs.indexOf(currentPath);

if (currentIndex !== -1) {
  let startX = 0;
  let startY = 0;
  let tracking = false;

  document.addEventListener('touchstart', (event) => {
    tracking = false;

    if (event.touches.length !== 1) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    // 가로 스크롤 영역과 입력 요소에서는 비활성화
    if (target.closest('input, textarea, select, [contenteditable], [data-no-swipe]')) {
      return;
    }

    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    tracking = true;
  }, { passive: true });

  document.addEventListener('touchend', (event) => {
    if (!tracking || event.changedTouches.length !== 1) return;
    tracking = false;

    const deltaX = event.changedTouches[0].clientX - startX;
    const deltaY = event.changedTouches[0].clientY - startY;

    if (Math.abs(deltaX) < 80) return;
    if (Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;

    const nextIndex = currentIndex + (deltaX < 0 ? 1 : -1);

    if (nextIndex < 0 || nextIndex >= tabs.length) return;

    window.location.assign(tabs[nextIndex]);
  }, { passive: true });

  document.addEventListener('touchcancel', () => {
    tracking = false;
  }, { passive: true });
}