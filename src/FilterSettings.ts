export class FilterSettings {
    filter: string;
    onlyOpen: boolean;
    olderThan: number;
    sortByLastUpdate: boolean;

    public constructor() {
        this.filter = "";
        this.onlyOpen = false;
        this.olderThan = 0;
        this.sortByLastUpdate = true;
    }
}