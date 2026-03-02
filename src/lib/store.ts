import { invoke } from '@tauri-apps/api/core';
import type { Preferences } from './types';
import { DEFAULT_PREFERENCES } from './types';

export async function getPreferences(): Promise<Preferences> {
  try {
    const prefs = await invoke<Preferences>('get_preferences');
    return { ...DEFAULT_PREFERENCES, ...prefs };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(prefs: Preferences): Promise<void> {
  await invoke('save_preferences', { preferences: prefs });
}

export async function showAdhkar(): Promise<void> {
  await invoke('show_adhkar');
}

export async function hideAdhkar(): Promise<void> {
  await invoke('hide_adhkar');
}

export async function openSettings(): Promise<void> {
  await invoke('open_settings');
}
