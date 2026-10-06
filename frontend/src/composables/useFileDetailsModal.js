import { ref } from 'vue';

export function useFileDetailsModal({ fetchDetails, onError, logPrefix = 'useFileDetailsModal' } = {}) {
	if (typeof fetchDetails !== 'function') {
		throw new Error(`${logPrefix}: fetchDetails is required`);
	}

	const detailsFile = ref(null);
	const isDetailsOpen = ref(false);
	const isDetailsLoading = ref(false);

	function closeDetails() {
		isDetailsOpen.value = false;
		detailsFile.value = null;
		isDetailsLoading.value = false;
	}

	async function openDetails(file) {
		if (!file) return false;
		isDetailsLoading.value = true;
		isDetailsOpen.value = true;
		try {
			const { data } = await fetchDetails(file);
			detailsFile.value = data ?? null;
			return true;
		} catch (error) {
			if (typeof onError === 'function') onError(error, file);
			closeDetails();
			return false;
		} finally {
			isDetailsLoading.value = false;
		}
	}

	function setDetailsFile(value) {
		detailsFile.value = value;
	}

	return {
		detailsFile,
		isDetailsOpen,
		isDetailsLoading,
		openDetails,
		closeDetails,
		setDetailsFile,
	};
}
