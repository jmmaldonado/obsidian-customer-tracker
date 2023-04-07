import { CustomerInitiative } from "./CustomerInitiative";
import { CustomerUpdate } from "./CustomerUpdate";

export class CustomerInitiatives {
    initiatives: Map<string, CustomerInitiative>;
    area: string;
    customer: string;

    public constructor(area: string, customer: string) {
        this.area = area;
        this.customer = customer;
        this.initiatives = new Map<string, CustomerInitiative>();
    }

    public containsInitiative(name: string): boolean {
        return this.initiatives.has(name);
    }

    public addInitiative(name: string) {
        if (!this.containsInitiative(name)) {
            let initiative: CustomerInitiative = new CustomerInitiative(name, this.area, this.customer);
            this.initiatives.set(name, initiative);
        }
    }

    public setInitiative(name: string, initiative: CustomerInitiative) {
        this.initiatives.set(name, initiative);
    }

    public getInitiative(name: string): CustomerInitiative | undefined {
        return this.initiatives.get(name);
    }

    public addUpdate(update: CustomerUpdate) {
        let initiative = this.getInitiative(update.initiative);
        if (initiative) {
            initiative.addUpdate(update);
        } else {
            initiative = new CustomerInitiative(update.initiative, update.area, update.customer);
            initiative.addUpdate(update);
            this.setInitiative(update.initiative, initiative);
        }
    }

}

