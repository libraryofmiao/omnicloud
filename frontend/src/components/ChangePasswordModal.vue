<script setup>
import { computed, reactive, ref } from 'vue';
import { IconLoader2, IconLock, IconX } from '@tabler/icons-vue';
import { useAuthStore } from '../stores/auth';

defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(['close']);
const authStore = useAuthStore();
const form = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' });
const localError = ref('');
const success = ref(false);
const busy = computed(() => authStore.loading);

function reset() {
	form.currentPassword = '';
	form.newPassword = '';
	form.confirmPassword = '';
	localError.value = '';
	success.value = false;
	authStore.error = null;
}

function close() {
	if (busy.value) return;
	reset();
	emit('close');
}

async function submit() {
	localError.value = '';
	success.value = false;
	if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
		localError.value = 'Please fill in all fields.';
		return;
	}
	if (form.newPassword.length < 8) {
		localError.value = 'New password must be at least 8 characters.';
		return;
	}
	if (form.newPassword !== form.confirmPassword) {
		localError.value = 'New passwords do not match.';
		return;
	}
	const ok = await authStore.changePassword({
		currentPassword: form.currentPassword,
		newPassword: form.newPassword,
	});
	if (!ok) {
		localError.value = authStore.error || 'Unable to change password.';
		return;
	}
	success.value = true;
	form.currentPassword = '';
	form.newPassword = '';
	form.confirmPassword = '';
}
</script>

<template>
	<Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
		<div v-if="open" class="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm" @click.self="close">
			<div class="relative w-full max-w-md overflow-hidden rounded-[28px] border border-[#dfe6f1] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)] dark:border-slate-700 dark:bg-slate-900">
				<button type="button" class="absolute right-4 top-4 grid size-10 place-items-center rounded-full text-[#5f6368] hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10" aria-label="Close" @click="close">
					<IconX :size="20" />
				</button>
				<div class="border-b border-[#eef2f7] p-6 dark:border-slate-800">
					<h3 class="text-xl font-semibold text-[#202124] dark:text-slate-100">Change password</h3>
					<p class="mt-1 text-sm text-[#5f6368] dark:text-slate-400">Update the password for your OmniCloud account.</p>
				</div>
				<form class="space-y-4 p-6" @submit.prevent="submit">
					<label v-for="field in [
						{ key: 'currentPassword', label: 'Current password', autocomplete: 'current-password' },
						{ key: 'newPassword', label: 'New password', autocomplete: 'new-password' },
						{ key: 'confirmPassword', label: 'Confirm new password', autocomplete: 'new-password' }
					]" :key="field.key" class="block">
						<span class="mb-1.5 block text-sm font-medium text-[#3c4043] dark:text-slate-200">{{ field.label }}</span>
						<span class="flex h-11 items-center gap-2 rounded-xl border border-[#dfe6f1] bg-[#f8fafd] px-3 focus-within:border-[#1a73e8] dark:border-slate-700 dark:bg-slate-800">
							<IconLock :size="17" class="shrink-0 text-[#5f6368] dark:text-slate-400" />
							<input v-model="form[field.key]" type="password" :autocomplete="field.autocomplete" class="w-full bg-transparent text-sm text-[#202124] outline-none dark:text-slate-100" required />
						</span>
					</label>
					<p v-if="localError" class="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{{ localError }}</p>
					<p v-if="success" class="rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">Password changed successfully.</p>
					<div class="flex justify-end gap-2 pt-2">
						<button type="button" class="rounded-xl px-4 py-2.5 text-sm font-medium text-[#5f6368] hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10" :disabled="busy" @click="close">Cancel</button>
						<button type="submit" class="inline-flex items-center gap-2 rounded-xl bg-[#1a73e8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1765cc] disabled:opacity-60" :disabled="busy">
							<IconLoader2 v-if="busy" :size="16" class="animate-spin" />
							{{ busy ? 'Saving…' : 'Change password' }}
						</button>
					</div>
				</form>
			</div>
		</div>
	</Transition>
</template>
