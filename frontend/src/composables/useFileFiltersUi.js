import { computed } from 'vue';

export function useFileFiltersUi({
	typeOptions,
	ownerOptions,
	updatedOptions,
	selectedTypeFilter,
	selectedOwnerFilter,
	selectedUpdatedFilter,
	activeFilterMenu,
	t,
	providerLabel,
}) {
	const typeList = computed(() => (typeOptions?.value || typeOptions || []));
	const ownerList = computed(() => (ownerOptions?.value || ownerOptions || []));
	const updatedList = computed(() => (updatedOptions?.value || updatedOptions || []));

	function getFilterLabel(type, value) {
		if (type === 'type') return typeList.value.find((option) => option.value === value)?.label || t('filters.type');
		if (type === 'updated') return updatedList.value.find((option) => option.value === value)?.label || t('filters.modified');
		return value;
	}

	function renderOwnerLabel(value) {
		if (value === 'all') return t('filters.allOwners');
		const owner = ownerList.value.find((item) => item.key === value);
		if (!owner) return t('filters.allOwners');
		return `${owner.email} · ${providerLabel(owner.provider)}`;
	}

	function toggleFilterMenu(menu) {
		activeFilterMenu.value = activeFilterMenu.value === menu ? null : menu;
	}

	function applyFilter(type, value) {
		if (type === 'type') selectedTypeFilter.value = value;
		if (type === 'owner' && selectedOwnerFilter) selectedOwnerFilter.value = value;
		if (type === 'updated') selectedUpdatedFilter.value = value;
		activeFilterMenu.value = null;
	}

	function clearFilter(type) {
		if (type === 'type') selectedTypeFilter.value = 'all';
		if (type === 'owner' && selectedOwnerFilter) selectedOwnerFilter.value = 'all';
		if (type === 'updated') selectedUpdatedFilter.value = 'all';
	}

	function isFilterActive(type) {
		if (type === 'type') return selectedTypeFilter.value !== 'all';
		if (type === 'owner') return selectedOwnerFilter ? selectedOwnerFilter.value !== 'all' : false;
		if (type === 'updated') return selectedUpdatedFilter.value !== 'all';
		return false;
	}

	return {
		getFilterLabel,
		renderOwnerLabel,
		toggleFilterMenu,
		applyFilter,
		clearFilter,
		isFilterActive,
	};
}
