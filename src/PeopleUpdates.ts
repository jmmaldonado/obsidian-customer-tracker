import { CustomerInitiatives } from "./CustomerInitiatives";
import { CustomerUpdate } from "./CustomerUpdate";

export class PeopleUpdates {
    updates: Map<string, CustomerInitiatives>;

    public constructor() {
        this.updates = new Map<string, CustomerInitiatives>();
    }
    
    public addUpdate(update: CustomerUpdate) {
        let initiatives = this.updates.get(update.person);
        if (initiatives) {
            initiatives.addUpdate(update);
        } else {
            initiatives = new CustomerInitiatives(update.area, update.customer);
            initiatives.addUpdate(update);
            this.updates.set(update.person, initiatives);
        }
    }
}