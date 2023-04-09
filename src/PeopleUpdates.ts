import { CustomerInitiatives } from "./CustomerInitiatives";
import { CustomerUpdate } from "./CustomerUpdate";

export class PeopleUpdates {
    updates: Map<string, CustomerInitiatives>;

    public constructor() {
        this.updates = new Map<string, CustomerInitiatives>();
    }



    public addUpdate(update: CustomerUpdate, initiativeStatus: string) {
        let initiatives = this.updates.get(update.person);
        if (initiatives) {
            initiatives.addUpdate(update, initiativeStatus);
        } else {
            initiatives = new CustomerInitiatives(update.area, update.customer);
            initiatives.addUpdate(update, initiativeStatus);
            this.updates.set(update.person, initiatives);
        }
    }

    public getInitiatives(person: string): CustomerInitiatives | undefined {
        return this.updates.get(person);
    }

    public numberOfCustomers(person: string): number {
        let result = 0;
        let initiatives = this.getInitiatives(person);
        if (initiatives) {
            let customers: string[] = []
            for (let initiative of initiatives.initiatives.values()) {
                if (!customers.contains(initiative.customer))
                    customers.push(initiative.customer);
            }
            result = customers.length;
        }
        return result;
    }

    public numberOfInitatives(person: string): number {
        let result = 0;
        let initiatives = this.getInitiatives(person);
        if (initiatives) 
            result = initiatives.initiatives.size;
        return result;
    }

    public numberOfInitiativesByStatus(person: string) : number[] {
        let result = [0, 0, 0, 0]; //InProgress (""), Won, Lost, Other
        let initiatives = this.getInitiatives(person);
        if (initiatives) {
            for (let initiative of initiatives.initiatives.values()) {
                switch (initiative.status.toLowerCase()) {
                    case "": { result[0] += 1; break; }
                    case "won": { result[1] += 1; break; }
                    case "lost": { result[2] += 1; break; }
                    default: { result[3] += 1; break; }
                }
            }
        }
        return result;
    }
}