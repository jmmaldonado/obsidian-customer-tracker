import { App, PluginSettingTab, Setting } from 'obsidian';
import CustomerTracker from './main';
import { StatisticsView, STATISTICS_VIEW_TYPE } from './views/StatisticsView';


export interface CustomerTrackerSettings {
	customerTrackingNote: string;
    customersBaseFolder: string;
	peopleBaseFolder: string;
	journalBaseFolder: string;
	customerInitiativeRegex: string;
	initiativeStatusRegex: string;
	peopleUpdateRegex: string;

	//TODO: Future implementation to separate customer areas in different files
	customerAreasInMainFile: boolean;
}

export const DEFAULT_SETTINGS: CustomerTrackerSettings = {
    customerTrackingNote: 'Customer Tracking',
	customersBaseFolder: 'Spaces/Customers/',
	peopleBaseFolder: 'Spaces/Management/Team/',
	journalBaseFolder: 'Journal/',
	customerInitiativeRegex: '^#{2}\\s(.*)',
	initiativeStatusRegex: '^status::(.*)',
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
			.setName('People base folder')
			.setDesc('Base folder for people files')
			.addText(text => text
				.setPlaceholder('Spaces/Management/Team/')
				.setValue(this.plugin.settings.peopleBaseFolder)
				.onChange(async (value) => {
					this.plugin.settings.peopleBaseFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Journal base folder')
			.setDesc('Base folder for daily notes')
			.addText(text => text
				.setPlaceholder('Journal/')
				.setValue(this.plugin.settings.journalBaseFolder)
				.onChange(async (value) => {
					this.plugin.settings.journalBaseFolder = value;
					await this.plugin.saveSettings();
				}));

		
		containerEl.createEl('h2', { text: 'Advanced settings' });


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
			.setName('People initiative update regex')
			.setDesc('Detects the initiative update in a person note (ie, ##### [[...]] ...)')
			.addText(text => text
				.setPlaceholder('^#{5}\\s(\\d{4}-\\d{2}-\\d{2})\\s(\\[{2}.*\\]{2}).*')
				.setValue(this.plugin.settings.peopleUpdateRegex)
				.onChange(async (value) => {
					this.plugin.settings.peopleUpdateRegex = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.addButton(bot => bot
				.setButtonText("Show statistics")
				.setCta()
				.onClick(async () => {
					this.app.workspace.detachLeavesOfType(STATISTICS_VIEW_TYPE);

					try {
						this.plugin.registerView(
							STATISTICS_VIEW_TYPE,
							(leaf) => new StatisticsView(leaf, this.app, this.plugin.tracker.generateStatisticsMD())
						);
					} catch (e: any) { }
	
					await this.app.workspace.getRightLeaf(false).setViewState({
						type: STATISTICS_VIEW_TYPE,
						active: true,
					});
	
					this.app.workspace.revealLeaf(
						this.app.workspace.getLeavesOfType(STATISTICS_VIEW_TYPE)[0]
					);
				}));
	}

}

