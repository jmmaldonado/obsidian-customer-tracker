import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { Customers, Customer } from 'src/Customers'
import { CustomerInitiatives, CustomerInitiative } from 'src/CustomerInitiatives'

// Remember to rename these classes and interfaces!

interface CustomerTrackerSettings {
	customersBaseFolder: string;

	//TODO: Future implementation to separate customer areas in different files
	customerAreasInMainFile: boolean;
}

const DEFAULT_SETTINGS: CustomerTrackerSettings = {
	customersBaseFolder: 'Spaces/Customers/',
	customerAreasInMainFile: true
}

export default class CustomerTracker extends Plugin {
	settings: CustomerTrackerSettings;
	customers: Customers;

	async readAllFiles(): Promise<void> {
		const { vault } = this.app;

		const fileContents: string[] = await Promise.all(
		  	vault.getMarkdownFiles().map((file) => vault.cachedRead(file))
		);

		//TODO: Sacarlo a settings
		let areaRegex = new RegExp('^#{1}\\s(.*)');
		let initiativeRegex = new RegExp('^#{2}\\s(.*)');
		let updateRegex = new RegExp('^#{4}\\s(.*)');

		let customerFiles = [];
		const files = this.app.vault.getMarkdownFiles()
		files.forEach(async (file) => {

			if (file.path.contains(this.settings.customersBaseFolder)) {
				let customer: Customer = new Customer(file.basename, file.path);

				let fileContent = await vault.cachedRead(file);
				let lines = await fileContent.split("\n").filter(line => line.includes("#"))
				let customerInitiative: CustomerInitiative | undefined = undefined;

				lines.forEach((line) => {

					//If we have no initiative and the line
					if (customerInitiative === undefined && areaRegex.test(line))
						return;
					
					//Check if the line is a new customer area
					if (areaRegex.test(line)) console.log("H1: " + line);
					if (initiativeRegex.test(line)) console.log("H2: " + line);
					if (updateRegex.test(line)) console.log("H4: " + line);
					//console.log(content);

				});		  	

				this.customers.addCustomer(customer);
			}			
		})

	
		let totalLength = 0;
		
		fileContents.forEach(async (content) => {
			let lines = await content.split("\n").filter(line => line.includes("#"))
			lines.forEach((line) => {
				totalLength += content.length;
				if (areaRegex.test(line)) console.log("H1: " + line);
				if (initiativeRegex.test(line)) console.log("H2: " + line);
				if (updateRegex.test(line)) console.log("H4: " + line);
				  //console.log(content);
			});		  	
		});
		
	}

	async onload() {
		await this.loadSettings();


		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', async (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			await this.readAllFiles();
			new Notice('This is a notice!');
			
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
				new SampleModal(this.app).open();
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
						new SampleModal(this.app).open();
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
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
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
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Customer Tracker plugin.'});

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
	}
}
