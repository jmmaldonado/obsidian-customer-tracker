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
		contentEl.createDiv().innerHTML = this.renderStatisticsHTMLTable();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	private renderStatisticsHTMLTable() : string {
		let html = "";
		html += "<table><tr>";
		html += "<td width='200'>{0}</td>".format("Person");
		html += "<td>{0}</td>".format("Customers");
		html += "<td>{0}</td>".format("Initiatives");
		html += "<td>{0}</td>".format("In progress");
		html += "<td>{0}</td>".format("Won");
		html += "<td>{0}</td>".format("Lost");
		html += "<td>{0}</td>".format("Other");
		html += "</tr>"
		for (const [person, initiatives] of this.tracker.peopleUpdates.updates) {
			let initiativesByStatus = this.tracker.peopleUpdates.numberOfInitiativesByStatus(person);
			html += "<tr>";
			html += "<td>{0}</td>".format(person);
			html += "<td>{0}</td>".format(this.tracker.peopleUpdates.numberOfCustomers(person).toString());
			html += "<td>{0}</td>".format(this.tracker.peopleUpdates.numberOfInitatives(person).toString());
			html += "<td>{0}</td>".format(initiativesByStatus[0].toString());
			html += "<td>{0}</td>".format(initiativesByStatus[1].toString());
			html += "<td>{0}</td>".format(initiativesByStatus[2].toString());
			html += "<td>{0}</td>".format(initiativesByStatus[3].toString());
			html += "</tr>"
		}
		html += "</table>"
		return html;
	}
}
