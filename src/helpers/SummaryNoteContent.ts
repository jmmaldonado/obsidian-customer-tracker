export function generateSummaryNoteContentMD(): string {
    let result = "";
    result += "\n\n";
    result += "```customerTracking\n";
    result += "filterOn:\n";
    result += "onlyOpen:false\n";
    result += "olderThan:0\n";
    result += "newerThan:1000000\n";
    result += "```";
    return result;
}