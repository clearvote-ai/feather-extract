import { extractBlocksFromPDF, extractFullTextFromPDF } from "./main";
import fs from "fs";

describe("Main test", () => {

  it("should run a test with pdf", async () => {
    const pages = await extractBlocksFromPDF("__test_data__/zoning.pdf");
    //save the text to a json
    fs.writeFileSync("__test_data__/zoning.json", JSON.stringify(pages, null, 2));

    const full_text = extractFullTextFromPDF(pages);

    //save the text to a json
    fs.writeFileSync("__test_data__/zoning.txt", full_text.join("\n\n==================================================================================\n"));
    //
  }, 1000000);

});