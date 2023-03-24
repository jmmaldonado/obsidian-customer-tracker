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
        
        update.area = this.area;
        update.customer = this.customer;
        update.initiative = this.name;
        update.date = date;
        update.person = person;
        update.link
        this.updates.push(update);

        this.numUpdates++;

        //TODO: Update dates
    }

    #extractDate(line: string): Date {
		return new Date();
	}

	#extractPerson(line: string): string {
		return "";
	}
}