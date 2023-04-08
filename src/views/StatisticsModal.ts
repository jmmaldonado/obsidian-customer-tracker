import { App, Modal } from 'obsidian';
import { CustomerTracker } from 'src/CustomerTracker';

export class StatisticsModal extends Modal {
	tracker: CustomerTracker;

	constructor(app: App, tracker: CustomerTracker) {
		super(app);
		this.tracker = tracker;
	}

	onOpen() {
		const { contentEl } = this;
		//contentEl.setText('Woah!');
		//contentEl.createDiv().innerHTML = 
		this.renderStatisticsHTMLTable(contentEl);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	private renderStatisticsHTMLTable(el: HTMLElement) {

		const table = el.createEl("table");
		const body = table.createEl("tbody");
		const row = body.createEl("tr");
		row.createEl("td", { text:"Person" });
		row.createEl("td", { text:"Customers" });
		row.createEl("td", { text:"Initiatives" });
		row.createEl("td", { text:"WIP" });
		row.createEl("td", { text:"Won" });
		row.createEl("td", { text:"Lost" });
		row.createEl("td", { text:"Other" });
	
		for (const [person, initiatives] of this.tracker.peopleUpdates.updates) {
			let initiativesByStatus = this.tracker.peopleUpdates.numberOfInitiativesByStatus(person);	
		  	const row = body.createEl("tr");
  			row.createEl("td", { text: person });
			row.createEl("td", { text: this.tracker.peopleUpdates.numberOfCustomers(person).toString() });
			row.createEl("td", { text: this.tracker.peopleUpdates.numberOfInitatives(person).toString() });
			row.createEl("td", { text: initiativesByStatus[0].toString() });
			row.createEl("td", { text: initiativesByStatus[1].toString() });
			row.createEl("td", { text: initiativesByStatus[2].toString() });
			row.createEl("td", { text: initiativesByStatus[3].toString() });
		}
	}
}
