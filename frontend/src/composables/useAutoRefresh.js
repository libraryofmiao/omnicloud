import { onBeforeUnmount, onMounted } from 'vue';

export function useAutoRefresh(refreshFn, { intervalMs = 30000, immediate = true } = {}) {
	let timer = null;

	function start() {
		stop();
		if (typeof refreshFn !== 'function') return;
		if (immediate) {
			refreshFn();
		}
		timer = window.setInterval(() => {
			refreshFn();
		}, intervalMs);
	}

	function stop() {
		if (timer) {
			window.clearInterval(timer);
			timer = null;
		}
	}

	onMounted(start);
	onBeforeUnmount(stop);

	return { start, stop };
}
