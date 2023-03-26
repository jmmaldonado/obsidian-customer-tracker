import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { CustomerTrackerSettings, CustomerTrackerSettingsTab, DEFAULT_SETTINGS } from './Settings';
import { Customers, Customer } from 'src/Customers'
import { CustomerInitiatives, CustomerInitiative } from 'src/CustomerInitiatives'
import { FilterModal } from './FilterModal';
import { CustomerUpdate } from './CustomerUpdates';


export default class CustomerTracker extends Plugin {
	settings: CustomerTrackerSettings;
	customers: Customers;


	async generateUpdatesFromPeople(): Promise<void> {
		const { vault } = this.app;
		let updateRegex = new RegExp(this.settings.peopleUpdateRegex);
		const files = this.app.vault.getMarkdownFiles()
		for (const file of files) {
			if (file.path.contains(this.settings.peopleBaseFolder)) {
				let person = file.basename;
				let fileContent = await vault.cachedRead(file);
				let lines = fileContent.split("\n").filter(line => line.includes("#"));
				for (const line of lines) {
					let updateLine = line.match(updateRegex);
					if (updateLine) {
						let extraction = new RegExp('\\[{2}(.*)#(.*)\\]{2}'); //[[Customer#Initiative]]
						let extractionLine = updateLine[2].match(extraction);
						if (extractionLine) {
							let update = new CustomerUpdate();
							update.customer = extractionLine[1];
							update.initiative = extractionLine[2];
							update.area = "";
							update.date = new Date(updateLine[1]);
							update.person = person;
							update.raw = line;
							this.customers.addUpdate(update);
						} else {
							console.log("ERR: Update line in file {0} has an incorrect backlink to the initiative: {1}".format(file.path, line));
						}
						
					}
				}
			}
		}
	}


	async generateCustomerInitiatives(): Promise<void> {
		const { vault } = this.app;
		let initiativeRegex = new RegExp(this.settings.customerInitiativeRegex);
		const files = this.app.vault.getMarkdownFiles()
		for (const file of files) {
			if (file.path.contains(this.settings.customersBaseFolder)) {
				let customer: Customer = new Customer(file.basename, file.path);
				customer.addArea("");
				let fileContent = await vault.cachedRead(file);
				let lines = fileContent.split("\n"); //.filter(line => line.includes("#"))
				for (let i = 0; i < lines.length; i++) {
					let line = lines[i];
					let initiativeLine = line.match(initiativeRegex);
					if (initiativeLine) {
						let initiative: CustomerInitiative = new CustomerInitiative(initiativeLine[1], "", customer.name);
						initiative.raw = initiativeLine[0];
						
						//Try to get the status
						initiative.status = "";
						if (i+1 < lines.length) {
							let nextLine = lines[i+1];
							let statusRegex = new RegExp(this.settings.initiativeStatusRegex);
							let statusLine = nextLine.match(statusRegex);
							if (statusLine) {
								initiative.status = statusLine[1];
							} 
						}

						customer.addInitiativeToArea("", initiative);
					}

				}
				this.customers.addCustomer(customer);
			}
		}
	}


	async generateCustomers(): Promise<void> {
		this.customers = new Customers();
		//We need to do this in two steps to ensure we have all the customer initiatives
		//before we start processing the updates from the people's notes
		await this.generateCustomerInitiatives();
		await this.generateUpdatesFromPeople();
	}

	async onload() {
		await this.loadSettings();
		await this.generateCustomers();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Customer tracker', async (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			await this.generateCustomers();
			if (this.customers) {
				new FilterModal(this.app, this.app.workspace.activeEditor?.editor, this.customers).open();
			}

		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'add-customer-tracking-summary-current-note',
			name: 'Add customer tracking summary to current note',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				editor.replaceSelection(this.customers.renderMD());
			}
		});

		this.addCommand({
			id: 'generate-customers',
			name: 'Reload customer updates',
			callback: () => {
				this.generateCustomers();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new CustomerTrackerSettingsTab(this.app, this));

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


