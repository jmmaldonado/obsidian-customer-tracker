import { App, PluginSettingTab, Setting } from 'obsidian';
import CustomerTracker from './main';


export interface CustomerTrackerSettings {
	customerTrackingNote: string;
    customersBaseFolder: string;
	peopleBaseFolder: string;
	//areaRegex: string;
	customerInitiativeRegex: string;
	initiativeStatusRegex: string;
	peopleDateRegex: string;
	peopleUpdateRegex: string;

	//TODO: Future implementation to separate customer areas in different files
	customerAreasInMainFile: boolean;
}

export const DEFAULT_SETTINGS: CustomerTrackerSettings = {
    customerTrackingNote: 'Customer Tracking',
	customersBaseFolder: 'Spaces/Customers/',
	peopleBaseFolder: 'Spaces/Management/Team/',
	//areaRegex: '^#{1}\\s(.*)',
	customerInitiativeRegex: '^#{2}\\s(.*)',
	initiativeStatusRegex: '^status::(.*)',
	peopleDateRegex: '^#{4}\\s(\\d{4}-\\d{2}-\\d{2}).*', //#### yyyy-MM-dd ...
	peopleUpdateRegex: '^#{5}\\s(\\d{4}-\\d{2}-\\d{2})\\s(\\[{2}.*\\]{2}).*', //##### yyyy-MM-dd [[...]] ...
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
			.setName('Customer tracking note')
			.setDesc('Note name to render customer tracking information')
			.addText(text => text
				.setPlaceholder('Customer Tracking')
				.setValue(this.plugin.settings.customerTrackingNote)
				.onChange(async (value) => {
					this.plugin.settings.customerTrackingNote = value;
					await this.plugin.saveSettings();
				}));

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
			.setName('Customer initiative regex')
			.setDesc('Regex to detect initiatives in a customer note (ie: ## AREA NAME @ INITIATIVE status::... )')
			.addText(text => text
				.setPlaceholder('^#{2}\\s(.*)')
				.setValue(this.plugin.settings.customerInitiativeRegex)
				.onChange(async (value) => {
					this.plugin.settings.customerInitiativeRegex = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Initiative status regex')
			.setDesc('Regex to detect the status of an initiative (ie: status::... )')
			.addText(text => text
				.setPlaceholder('^status::(.*)')
				.setValue(this.plugin.settings.initiativeStatusRegex)
				.onChange(async (value) => {
					this.plugin.settings.initiativeStatusRegex = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('People date regex')
			.setDesc('Detects the update date in a person note (ie, #### yyyy-MM-dd ...)')
			.addText(text => text
				.setPlaceholder('^#{4}\\s(\\d{4}-\\d{2}-\\d{2}).*')
				.setValue(this.plugin.settings.peopleDateRegex)
				.onChange(async (value) => {
					this.plugin.settings.peopleDateRegex = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('People initiative update regex')
			.setDesc('Detects the initiative update in a person note (ie, ##### [[...]] ...)')
			.addText(text => text
				.setPlaceholder('^#{5}\\s(\\d{4}-\\d{2}-\\d{2})\\s(\\[{2}.*\\]{2}).*')
				.setValue(this.plugin.settings.peopleUpdateRegex)
				.onChange(async (value) => {
					this.plugin.settings.peopleUpdateRegex = value;
					await this.plugin.saveSettings();
				}));
	}

}

