const ExcelJS = require('exceljs');
const fs = require('fs');

function excelWidthToPixels(excelWidth) {
  const maxDigitWidth = 7; // This is an approximate max digit width for the default Excel font (Calibri 11)
  const paddingSize = 5; // Excel also adds a small amount of padding to the column width
  return Math.round((excelWidth * maxDigitWidth) + paddingSize);
}



async function readColumnInformations(filePath) {
  const workbook = new ExcelJS.Workbook();
  //await workbook.xlsx.readFile(filePath);
  await workbook.readFile(filePath);

  const worksheet = workbook.worksheets[0]; // Assuming you want the first worksheet
  const worksheet_of_table_with_info = workbook.worksheets[2]; // Assuming you want the first worksheet


  // Get the length of the rows (assuming data doesn't have empty rows in between)
  const lengthRows = worksheet.actualRowCount;
  const lengthRows_of_table_with_info = worksheet_of_table_with_info.actualRowCount;


  const topLeftCellValues = {};
  const jsonDataWithoutMergedCells = [];
  const cellClassMappings = [];




  let indexRStart;
  let indexREndTitles;
  let indexRStartHeaders;
  let indexREndHeaders;
  let indexRStartCells;
  let indexREndCellsDisplayed;
  let last_row_after_header
  


  for (let i = 1; i <= lengthRows_of_table_with_info; i++) {
    if (worksheet_of_table_with_info.getRow(i).getCell(1).value === 'r_start') {
        console.log('i in getRow is : ' + i )
        indexRStart = i-4;
    } else if (worksheet_of_table_with_info.getRow(i).getCell(1).value === 'r_end_titles'){
        indexREndTitles = i-4;
    } else if (worksheet_of_table_with_info.getRow(i).getCell(1).value === 'r_start_headers'){
        indexRStartHeaders = i-4;
    } else if (worksheet_of_table_with_info.getRow(i).getCell(1).value === 'r_end_headers'){
        indexREndHeaders = i-4;
    } else if (worksheet_of_table_with_info.getRow(i).getCell(1).value === 'r_start_cells'){
        indexRStartCells = i-4;
    } else if (worksheet_of_table_with_info.getRow(i).getCell(1).value === 'r_end_cells_displayed'){
        indexREndCellsDisplayed = i-4;
    }
  }
  console.log(indexREndCellsDisplayed)
  console.log(indexRStartCells)

  last_row_after_header = indexREndCellsDisplayed-indexRStartCells

  const mergedCellsInfo = [
    // Your merged cells information here
  ];

  const mergedCellsInfo2 = [
    // Your merged cells information here
  ];

  worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
    row.eachCell({ includeEmpty: true }, function(cell, colNumber) {
        if(cell.isMerged) {
            // Log each merged cell's address and its master cell's address
            //console.log(`Cell ${cell.address} is merged with ${cell.master.address}`);
            mergedCellsInfo.push(`Cell ${cell.address} is merged with ${cell.master.address}`)

            mergedCellsInfo2.push({
                cell: cell.address,
                masterCell: cell.master.address
            });
        }
    });
});

// Populate topLeftCellValues with the value of the top-left cell for each merged range
mergedCellsInfo2.forEach(info => {
    const { masterCell, row, col } = info;
    // Assuming masterCell contains the address of the top-left cell in the merged range
    if (!topLeftCellValues[masterCell]) {
        const cellValue = worksheet.getCell(masterCell).value;
        topLeftCellValues[masterCell] = cellValue;
    }
});





  //console.log('mergedCellsInfo before is : ')
  //console.log(mergedCellsInfo)
  // Initialize an empty object to track unique merges


  // Function to convert column letters to numbers (A->0, B->1, ...)
const colLetterToNum = (letter) => letter.charCodeAt(0) - 'A'.charCodeAt(0);

// Parsing the merged cell information
const parsedCells = mergedCellsInfo.map(info => {
    const parts = info.match(/Cell ([A-Z]+)(\d+) is merged with ([A-Z]+)(\d+)/);
    return {
        cell: parts[1] + parts[2],
        masterCell: parts[3] + parts[4],
        row: parseInt(parts[2], 10) - 1,
        col: colLetterToNum(parts[1]),
        masterRow: parseInt(parts[4], 10) - 1,
        masterCol: colLetterToNum(parts[3])
    };
});


  const merges = {};
  
// Filling the merges object with rowspan and colspan calculations
parsedCells.forEach(({ cell, masterCell, row, col, masterRow, masterCol }) => {
    if (!merges[masterCell]) {
        merges[masterCell] = { row: masterRow, col: masterCol, rowspan: 1, colspan: 1 };
    } else {
        const merge = merges[masterCell];
        merge.rowspan = Math.max(merge.rowspan, row - merge.row + 1);
        merge.colspan = Math.max(merge.colspan, col - merge.col + 1);
    }
});

// Converting the merges object to an array of merge details
const mergedcells_results = Object.values(merges);




worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    const rowObject = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const cellAddress = cell.address;
        const key = `Column${colNumber}`;

        // Check if the current cell is the top-left cell of a merged range or a standalone cell
        if (topLeftCellValues[cellAddress] !== undefined) {
            // It's either the top-left cell of a merged range or not merged at all
            rowObject[key] = cell.value === null ? "" : cell.value;
        } else {
            // Check if this cell is part of a merged range and should thus be skipped (empty value)
            const isPartOfMergedRange = mergedCellsInfo2.some(info => info.cell === cellAddress);
            if (!isPartOfMergedRange) {
                // It's a standalone cell, not merged
                rowObject[key] = cell.value === null ? "" : cell.value;
            } else {
                // It's part of a merged range but not the top-left cell, so leave it empty
                rowObject[key] = "";
            }
        }
    });
    jsonDataWithoutMergedCells.push(rowObject);
});

const Data_without_merged_cells = jsonDataWithoutMergedCells.map(rowObject => {
    // Extract values from each object in the order of keys and return as an array
    return Object.keys(rowObject).sort().map(key => rowObject[key]);
});

//console.log(arrayOfArraysofData);

  

//   const mergedCells = worksheet.merges; // This is an array of the merged cell addresses
//   console.log('Merged Cells:');
//   console.log(mergedCells);



    const columnInformation = worksheet_of_table_with_info.columns.map((column, index) => {
    const type_col = worksheet_of_table_with_info.getRow(2).getCell(index + 1).value;
    const aftervalidate_type = worksheet_of_table_with_info.getRow(3).getCell(index + 1).value;
    const width_exact = worksheet_of_table_with_info.getRow(4).getCell(index + 1).value;

    return {
      header: column.header, // This is to identify the column, might be useful if you have headers
      width: column.width,
      width2: excelWidthToPixels(column.width),
      type_col: type_col,
      aftervalidate_type:aftervalidate_type,
      width_exact: width_exact
    };
  });

  const columnInformations = {
    index_r_start: indexRStart, // The row index where "r_start" is found in the first column
    index_end_titles:indexREndTitles,
    index_start_headers:indexRStartHeaders,
    index_end_headers:indexREndHeaders,
    index_start_cells:indexRStartCells,
    index_end_cells_displayed:indexREndCellsDisplayed,

    length_rows: lengthRows,
    information_of_columns: columnInformation,
    mergedCells:mergedcells_results,
    Data_without_merged_cells:Data_without_merged_cells,

    last_row_after_header:last_row_after_header,

  };

  console.log('columnInformations :::::::: ');
  console.log(columnInformations);
  const jsonInfoData = JSON.stringify(columnInformations, null, 2); // The '2' argument formats the output with 2-space indentation

  fs.writeFile('./output_to_use/jsonInfoData.json', jsonInfoData, 'utf8', (err) => {
    if (err) {
      console.error('An error occurred while writing JSON Object to File.', err);
    } else {
      console.log('JSON file has been saved.');
    }
})
  


}

// Replace 'path/to/your/excelfile.xlsx' with the path to your actual Excel file
readColumnInformations('example_excel_prendschargemacros122.xltm');
