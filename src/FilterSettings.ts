export class FilterSettings {
    filter: string;
    onlyOpen: boolean;
    olderThan: number;

    public constructor() {
        this.filter = "";
        this.onlyOpen = false;
        this.olderThan = 0;
    }
}