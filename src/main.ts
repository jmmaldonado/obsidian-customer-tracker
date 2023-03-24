import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { Customers, Customer } from 'src/Customers'
import { CustomerInitiatives, CustomerInitiative } from 'src/CustomerInitiatives'

// Remember to rename these classes and interfaces!

interface CustomerTrackerSettings {
	customersBaseFolder: string;
	areaRegex: string;
	initiativeRegex: string;
	updateRegex: string;

	//TODO: Future implementation to separate customer areas in different files
	customerAreasInMainFile: boolean;
}

const DEFAULT_SETTINGS: CustomerTrackerSettings = {
	customersBaseFolder: 'Spaces/Customers/',
	areaRegex: '^#{1}\\s(.*)',
	initiativeRegex: '^#{2}\\s(.*)',
	updateRegex: '^#{4}\\s(.*)', 
	customerAreasInMainFile: true
}

export default class CustomerTracker extends Plugin {
	settings: CustomerTrackerSettings;
	customers: Customers;

	async generateCustomers(): Promise<boolean> {
		const { vault } = this.app;
		let result = false;

		const fileContents: string[] = await Promise.all(
			vault.getMarkdownFiles().map((file) => vault.cachedRead(file))
		);

		//TODO: Sacarlo a settings
		/*let areaRegex = new RegExp('^#{1}\\s(.*)');
		let initiativeRegex = new RegExp('^#{2}\\s(.*)');
		let updateRegex = new RegExp('^#{4}\\s(.*)');*/
		let areaRegex = new RegExp(this.settings.areaRegex);
		let initiativeRegex = new RegExp(this.settings.initiativeRegex);
		let updateRegex = new RegExp(this.settings.updateRegex);

		this.customers = new Customers();
		const files = this.app.vault.getMarkdownFiles()
		for (const file of files) {

			if (file.path.contains(this.settings.customersBaseFolder)) {
				let customer: Customer = new Customer(file.basename, file.path);

				let fileContent = await vault.cachedRead(file);
				let lines = fileContent.split("\n").filter(line => line.includes("#"))

				let customerArea = "";
				let customerInitiative: CustomerInitiative | undefined;



				for (const line of lines) {

					if (updateRegex.test(line)) {
						if (!(customerInitiative == null)) {
							customerInitiative.addUpdate(line);
						}
					} else if (initiativeRegex.test(line)) {
						if (!(customerArea === "")) {
							if (!(customerInitiative == null)) {
								//Add the previous initiative, create a new one and add it to the customer object
								customer.addInitiativeToArea(customerArea, customerInitiative);
								customerInitiative = new CustomerInitiative(line, customerArea, customer.name);
								//customer.addInitiativeToArea(customerArea, customerInitiative);
							} else {
								customerInitiative = new CustomerInitiative(line, customerArea, customer.name);
								//customer.addInitiativeToArea(customerArea, customerInitiative);
							}
						}

					} else if (areaRegex.test(line)) {
						if (!(customerArea === "")) {
							//We update the last area with the initiatives we had captured and re-initialize the initiatives
							if (!(customerInitiative == null)) {
								customer.addInitiativeToArea(customerArea, customerInitiative);
								customerInitiative = undefined;
							}
						}
						//We add the new area with an empty set of initiatives
						customerArea = line;
						customer.addInitiativeToArea(customerArea, customerInitiative);
						
					}
				}

				//If we finished going through the file, add the last initiatives we found in case there are any
				if (!(customerArea === "") && !(customerInitiative == null))
					customer.addInitiativeToArea(customerArea, customerInitiative);

				this.customers.addCustomer(customer);
			}
		}

		result = true;
		return result;
	}

	async onload() {
		await this.loadSettings();


		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Customer tracker', async (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			await this.generateCustomers();
			if (this.customers) {
				new SampleModal(this.app, this.customers).open();
			}
			//new Notice('This is a notice!');

		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		/*
		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');
		*/

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				//new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						//new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	customers: Customers;
	constructor(app: App, customers: Customers) {
		super(app);
		this.customers = customers;
	}

	onOpen() {
		const { contentEl } = this;
		//contentEl.setText('Woah!');
		contentEl.createDiv().innerHTML = this.customers.renderHTML();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
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
