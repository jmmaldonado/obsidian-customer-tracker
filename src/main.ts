import { Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { CustomerTrackerSettings, CustomerTrackerSettingsTab, DEFAULT_SETTINGS } from './Settings';
import { CustomerTracker } from 'src/CustomerTracker'
import { Customer } from "src/Customer";
import { CustomerInitiative } from "src/CustomerInitiative";
import { FilterModal } from './views/FilterModal';
import { CustomerUpdate } from './CustomerUpdate';
import { SelectInitiativeModal } from './views/SelectInitiativeModal';
import { InitiativeUpdatesView, INITIATIVEUPDATES_VIEW_TYPE } from './views/InitiativeUpdatesView';
import { registerQueryCodeBlock } from './views/QueryCodeBlock';
import { StatisticsView, STATISTICS_VIEW_TYPE } from './views/StatisticsView';
import { RecentUpdatesView, RECENTUPDATES_VIEW_TYPE } from './views/RecentUpdatesView';


export default class CustomerTracking extends Plugin {
	settings: CustomerTrackerSettings;
	tracker: CustomerTracker;


	async generateUpdatesFromPeople(): Promise<void> {
		const { vault } = this.app;
		let updateRegex = new RegExp(this.settings.peopleUpdateRegex);
		const files = this.app.vault.getMarkdownFiles()
		for (const file of files) {
			if (!file.basename.startsWith("+") && file.path.contains(this.settings.peopleBaseFolder)) {
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
							update.file = file;
							this.tracker.addUpdate(update);
						} else {
							console.log("ERR: Update line in file {0} has an incorrect backlink to the initiative: {1}".format(file.path, line));
						}
					}
				}
			}
		}
	}


	async generatePersonalUpdatesFromPath(path: string) {
		let person = "myself";
		const { vault } = this.app;
		let updateRegex = new RegExp(this.settings.peopleUpdateRegex);
		const files = this.app.vault.getMarkdownFiles()
		for (const file of files) {
			if (!file.basename.startsWith("+") && file.path.contains(path)) {
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
							update.file = file;
							this.tracker.addUpdate(update);
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
			if (!file.basename.startsWith("+") && file.path.contains(this.settings.customersBaseFolder)) {
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
						if (i + 1 < lines.length) {
							let nextLine = lines[i + 1];
							let statusRegex = new RegExp(this.settings.initiativeStatusRegex);
							let statusLine = nextLine.match(statusRegex);
							if (statusLine) {
								initiative.status = statusLine[1];
							}
						}

						customer.addInitiativeToArea("", initiative);
					}

				}
				this.tracker.addCustomer(customer);
			}
		}
	}


	async generateCustomers(): Promise<void> {
		this.tracker = new CustomerTracker();
		//We need to do this in two steps to ensure we have all the customer initiatives
		//before we start processing the updates from the people's notes
		await this.generateCustomerInitiatives();
		await this.generateUpdatesFromPeople();
		await this.generatePersonalUpdatesFromPath(this.settings.journalBaseFolder);
	}

	registerCommands() {
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Customer tracker', async (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			await this.generateCustomers();
			if (this.tracker) {
				new FilterModal(this.app, this.app.workspace.activeEditor?.editor, this.tracker).open();
			}

		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		this.addCommand({
			id: 'customerTracker-open-customer-tracker-modal-window',
			name: 'Add summary / customer updates to current note...',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				new FilterModal(this.app, this.app.workspace.activeEditor?.editor, this.tracker).open();
			}
		})

		this.addCommand({
			id: 'customerTracker-add-update-header-current-note',
			name: 'Add update header to current note',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				new SelectInitiativeModal(this.app, this.tracker, editor).open();
			}
		})

		this.addCommand({
			id: 'customerTracker-generate-customers',
			name: 'Reload customer updates',
			callback: () => {
				this.generateCustomers();
			}
		});

		this.addCommand({
			id: 'customerTracker-recent-updates',
			name: 'Show recent updates',
			callback: () => {
				this.showRecentUpdates();
			}
		})

		this.addCommand({
			id: 'customerTracker-add-initiatives-to-followup-in-person-note',
			name: 'Add initiatives to followup in person note',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const file = this.app.workspace.getActiveFile();
				if (file && file.path.contains(this.settings.peopleBaseFolder)) {
					editor.replaceSelection(this.tracker.renderInitiativesToFolloup(file.basename));
				} else {
					new Notice("Can only do this in a Person note under {0}".format(this.settings.peopleBaseFolder));
				}
			}
		});

	}

	async showRecentUpdates() {

		//Only allows one InitiativeUpdates view
		this.app.workspace.detachLeavesOfType(RECENTUPDATES_VIEW_TYPE);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: RECENTUPDATES_VIEW_TYPE,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(RECENTUPDATES_VIEW_TYPE)[0]
		);
	}

	registerContextMenu() {

		this.app.workspace.on("editor-menu", (menu, editor, view) => {
			menu.addItem((item) => {
				item
					.setTitle("Show initiative updates")
					.setIcon("document")
					.onClick(() => {
						this.showUpdatesForInitiativeAtCurrentLine();
					});
			});
		})

	}


	public async showUpdatesForInitiativeAtCurrentLine() {
		//Only allows one InitiativeUpdates view
		this.app.workspace.detachLeavesOfType(INITIATIVEUPDATES_VIEW_TYPE);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: INITIATIVEUPDATES_VIEW_TYPE,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(INITIATIVEUPDATES_VIEW_TYPE)[0]
		);
	}


	load() {
		this.app.workspace.onLayoutReady(async () => {
			await this.loadSettings();
			await this.generateCustomers();
			this.registerCommands();
			this.registerContextMenu();
			this.registerMarkdownCodeBlockProcessor("customerTracking", (source, el, ctx) => registerQueryCodeBlock(source, el, ctx, this.tracker));

			// This adds a settings tab so the user can configure various aspects of the plugin
			this.addSettingTab(new CustomerTrackerSettingsTab(this.app, this));

			this.registerView(
				INITIATIVEUPDATES_VIEW_TYPE,
				(leaf) => new InitiativeUpdatesView(leaf, this.app, this.tracker, this.settings)
			);

			this.registerView(
				RECENTUPDATES_VIEW_TYPE,
				(leaf) => new RecentUpdatesView(leaf, this.app, this.tracker, this.settings)
			);
		})
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(INITIATIVEUPDATES_VIEW_TYPE);
		this.app.workspace.detachLeavesOfType(STATISTICS_VIEW_TYPE);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


