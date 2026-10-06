import { nextTick, ref } from 'vue';

const MENU_PADDING = 12;

function createContextMenuState() {
	return {
		visible: false,
		x: 0,
		y: 0,
		file: null,
	};
}

export function useContextMenu() {
	const contextMenu = ref(createContextMenuState());
	const contextMenuRef = ref(null);

	function closeContextMenu() {
		contextMenu.value = createContextMenuState();
	}

	async function openContextMenu(event, file) {
		event.preventDefault();
		event.stopPropagation();
		contextMenu.value = {
			visible: true,
			x: event.clientX,
			y: event.clientY,
			file,
		};

		await nextTick();

		const menu = contextMenuRef.value;
		if (!menu) return;

		const rect = menu.getBoundingClientRect();
		contextMenu.value = {
			...contextMenu.value,
			x: Math.max(
				MENU_PADDING,
				Math.min(event.clientX, window.innerWidth - rect.width - MENU_PADDING),
			),
			y: Math.max(
				MENU_PADDING,
				Math.min(event.clientY, window.innerHeight - rect.height - MENU_PADDING),
			),
		};
	}

	return {
		contextMenu,
		contextMenuRef,
		closeContextMenu,
		openContextMenu,
	};
}
