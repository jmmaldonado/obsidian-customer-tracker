import { CustomerUpdate } from "src/CustomerUpdates"

export class CustomerInitiatives {
    #initiatives: Map<string, CustomerInitiative>;
    area: string;
    customer: string;

    public constructor(area: string, customer: string) {
        this.area = area;
        this.customer = customer;
        this.#initiatives = new Map<string, CustomerInitiative>();
    }

    public containsInitiative(name: string): boolean {
        return this.#initiatives.has(name);
    }

    public addInitiative(name: string) {
        if (!this.containsInitiative(name)) {
            let initiative: CustomerInitiative = new CustomerInitiative(name, this.area, this.customer);
            this.#initiatives.set(name, initiative);
        }
    }

    public getInitiative(name: string): CustomerInitiative | undefined {
        return this.#initiatives.get(name);
    }

}

export class CustomerInitiative {
    name: string;
    area: string;
    customer: string;
    updates: CustomerUpdate[];
    numUpdates: number;
    firstUpdate: Date;
    lastUpdate: Date;

    public constructor(name: string, area: string, customer: string) {
        this.name = name;
        this.area = area;
        this.customer = customer;
        this.updates = [];
        this.numUpdates = 0;
        this.firstUpdate = new Date("9999-12-31");
        this.lastUpdate = new Date("1900-01-01");
    }

    public addUpdate(updateLine: string) {

        let date = this.#extractDate(updateLine);
        let person = this.#extractPerson(updateLine);
        let update = new CustomerUpdate();

        if (date == null || person == "") {
            console.log("ERROR: Could not add update for the initiative. Date or person not detected. Line: " + updateLine);
            return;
        }

        update.area = this.area;
        update.customer = this.customer;
        update.initiative = this.name;
        update.date = date;
        update.person = person;
        update.link

        this.numUpdates++;
        this.firstUpdate = (date < this.firstUpdate) ? date : this.firstUpdate;
        this.lastUpdate = (date > this.lastUpdate) ? date : this.lastUpdate;

        this.updates.push(update);
    }

    #extractDate(line: string): Date | null {
        let dateRegEx = new RegExp("(\\d{4}-\\d{2}-\\d{1,2})");
        let result = line.match(dateRegEx);
        if (result == null)
            return null;
		return new Date(result[0]);
	}

	#extractPerson(line: string): string {
        let personRegEx = new RegExp("(\\[{2}.*\\]{2})");
        let result = line.match(personRegEx);
        if (result == null)
            return "";
		return result[0];
	}
}