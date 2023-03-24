import { App, PluginSettingTab, Setting } from 'obsidian';
import CustomerTracker from './main';


export interface CustomerTrackerSettings {
	customersBaseFolder: string;
	areaRegex: string;
	initiativeRegex: string;
	updateRegex: string;

	//TODO: Future implementation to separate customer areas in different files
	customerAreasInMainFile: boolean;
}

export const DEFAULT_SETTINGS: CustomerTrackerSettings = {
	customersBaseFolder: 'Spaces/Customers/',
	areaRegex: '^#{1}\\s(.*)',
	initiativeRegex: '^#{2}\\s(.*)',
	updateRegex: '^#{4}\\s(.*)', 
	customerAreasInMainFile: true
}

export class CustomerTrackerSettingsTab extends PluginSettingTab {
	plugin: CustomerTracker;

	constructor(app: App, plugin: CustomerTracker) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for Customer Tracker plugin.' });

		new Setting(containerEl)
			.setName('Customer base folder')
			.setDesc('Base folder for customers files')
			.addText(text => text
				.setPlaceholder('Spaces/Customers/')
				.setValue(this.plugin.settings.customersBaseFolder)
				.onChange(async (value) => {
					this.plugin.settings.customersBaseFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
		.setName('Area regex')
		.setDesc('Regex to detect customer areas in a customer note')
		.addText(text => text
			.setPlaceholder('^#{1}\\s(.*)')
			.setValue(this.plugin.settings.areaRegex)
			.onChange(async (value) => {
				this.plugin.settings.areaRegex = value;
				await this.plugin.saveSettings();
			}));

		new Setting(containerEl)
			.setName('Initiative regex')
			.setDesc('Regex to detect customer initiatives in a customer note')
			.addText(text => text
				.setPlaceholder('^#{2}\\s(.*)')
				.setValue(this.plugin.settings.initiativeRegex)
				.onChange(async (value) => {
					this.plugin.settings.initiativeRegex = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Update regex')
			.setDesc('Regex to detect updates in a customer note')
			.addText(text => text
				.setPlaceholder('^#{4}\\s(.*)')
				.setValue(this.plugin.settings.updateRegex)
				.onChange(async (value) => {
					this.plugin.settings.updateRegex = value;
					await this.plugin.saveSettings();
				}));
	}

}

