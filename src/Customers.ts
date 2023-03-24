import { CustomerInitiatives } from "src/CustomerInitiatives"

export class Customers {
    #customers: Map<string, Customer>;

    public contains(customer: string): boolean {
        return this.#customers.has(customer);
    }

    public getCustomer(customer: string): Customer | undefined {
        return this.#customers.get(customer);
    }

    public addCustomer(customer: Customer) {
        this.#customers.set(customer.name, customer);
    }
}

export class Customer {
    name: string;
    file: string;
    areas: Map<string, CustomerInitiatives>;

    public constructor(name: string, file: string) {
        this.name = name;
        this.file = file;
        this.areas = new Map();
    }

    public containsArea(area: string): boolean {
        return this.areas.has(area);
    }

    public getInitiativesFromArea(area: string): CustomerInitiatives | undefined | null {
        if (!this.containsArea(area)) 
            return null;
        return this.areas.get(area);
    }
}
