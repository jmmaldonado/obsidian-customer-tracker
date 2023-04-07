import { CustomerInitiatives } from "src/CustomerInitiatives";
import { CustomerInitiative } from "src/CustomerInitiative";


export class Customer {
    name: string;
    path: string;
    areas: Map<string, CustomerInitiatives>;

    public constructor(name: string, path: string) {
        this.name = name;
        this.path = path;
        this.areas = new Map();
    }

    public containsArea(areaName: string): boolean {
        return this.areas.has(areaName);
    }

    public addArea(areaName: string) {
        if (!this.containsArea(areaName)) {
            let initiatives = new CustomerInitiatives(areaName, this.name);
            this.areas.set(areaName, initiatives);
        }
    }

    public getInitiativesFromArea(area: string): CustomerInitiatives | undefined | null {
        if (!this.containsArea(area))
            return null;
        return this.areas.get(area);
    }

    public addInitiativeToArea(area: string, initiative: CustomerInitiative | undefined) {
        if (initiative === undefined)
            return;

        let areaInitiatives = this.getInitiativesFromArea(area);
        if (areaInitiatives == null)
            areaInitiatives = new CustomerInitiatives(area, this.name);
        areaInitiatives.setInitiative(initiative.name, initiative);
        this.areas.set(area, areaInitiatives);
    }

    public getInitiative(initiativeName: string): CustomerInitiative | null {
        let result = null;
        for (let area of this.areas.values()) {
            for (let initiative of area.initiatives.values()) {
                if (initiative.name == initiativeName) {
                    result = initiative;
                }
            }
        }
        return result;
    }
}
