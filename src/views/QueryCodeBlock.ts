import { MarkdownPostProcessorContext, MarkdownRenderer } from "obsidian";
import { CustomerTracker } from "src/CustomerTracker";
import { FilterSettings } from "src/FilterSettings";

/// ```customerTracking
///    filterOn:xxxxx
///    onlyOpen:true
///    olderThan:0
///    newerThan:10000
///``` 

export function registerQueryCodeBlock(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext, tracker: CustomerTracker) {

    const rows = source.split("\n").filter((row) => row.length > 0);
    if (rows.length != 4) {
        el.createSpan({text: "Incorrect syntax for customerTracking code block"});
        console.log("ERR: incorrect syntax for customerTracking code block at file {0}".format(ctx.sourcePath));
        return;
    } 

    let value = "";
    let onlyOpen = false;
    let olderThan = 0;
    let newerThan = Number.MAX_VALUE; 

    //Parsing code block query
    try {
        if (!rows[0].startsWith("filterOn"))
            throw Error("First line must start with filterOn: followed by the value");
        else {
            value = rows[0].split(":")[1];
        }

        if (!rows[1].startsWith("onlyOpen:"))
            throw Error("Second line must be either onlyOpen:true or onlyOpen:false");
        else {
            onlyOpen = rows[1].split(":")[1] === "true";
        }

        if (!rows[2].startsWith("olderThan:"))
            throw Error("Third line must start with olderThan: followed by a number");
        else {
            olderThan = parseInt( rows[2].split(":")[1]);
        }

        if (!rows[3].startsWith("newerThan:"))
            throw Error("Fourth line must start with newerThan: followed by a number");
        else {
            newerThan = parseInt( rows[3].split(":")[1]);
        }

    } catch (ex: any) {
        el.createSpan({text: "Exception {0} ({1}) parsing customerTracking code block".format(ex.name, ex.message)});
        console.log("ERR: Exception {0} ({1}) parsing customerTracking code block at file {2}".format(ex.name, ex.message, ctx.sourcePath));
        return;
    } 

    let filterSettings = new FilterSettings();
    filterSettings.filter = value;
    filterSettings.olderThan = olderThan;
    filterSettings.onlyOpen = onlyOpen;

    MarkdownRenderer.renderMarkdown( tracker.renderMD(filterSettings), el, ctx.sourcePath, this);

}