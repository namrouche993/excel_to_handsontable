const ExcelJS = require('exceljs');

function excelWidthToPixels(excelWidth) {
  const maxDigitWidth = 7; // This is an approximate max digit width for the default Excel font (Calibri 11)
  const paddingSize = 5; // Excel also adds a small amount of padding to the column width
  return Math.round((excelWidth * maxDigitWidth) + paddingSize);
}

function getColorClassName(color) {
    if (!color || !color.argb) return '';
    // Remove alpha part if it exists (first two characters)
    const colorCode = color.argb.slice(2);
    return `bg-${colorCode}`;
}

function getBorderStyleClassName(border) {
    if (!border || !border.style || !border.color || !border.color.argb) return '';
    const borderColorCode = border.color.argb.slice(2);
    return `border-${border.style.toLowerCase()}-${borderColorCode}`;
}

async function readColumnWidths(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
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
        indexRStart = i-3;
    } else if (worksheet_of_table_with_info.getRow(i).getCell(1).value === 'r_end_titles'){
        indexREndTitles = i-3;
    } else if (worksheet_of_table_with_info.getRow(i).getCell(1).value === 'r_start_headers'){
        indexRStartHeaders = i-3;
    } else if (worksheet_of_table_with_info.getRow(i).getCell(1).value === 'r_end_headers'){
        indexREndHeaders = i-3;
    } else if (worksheet_of_table_with_info.getRow(i).getCell(1).value === 'r_start_cells'){
        indexRStartCells = i-3;
    } else if (worksheet_of_table_with_info.getRow(i).getCell(1).value === 'r_end_cells_displayed'){
        indexREndCellsDisplayed = i-3;
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


worksheet.eachRow({ includeEmpty: true }, (row, rowIndex) => {
    row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
        const cellAddress = cell.address;
        let className = [];
        className[0] = 'htMiddle '; // Default to 'htMiddle ' if no specific alignment is found

        // Check if the cell is part of a merged range but not the top-left cell
        const isMergedButNotTopLeft = mergedCellsInfo2.some(info => 
            info.cell === cellAddress && info.cell !== info.masterCell);

        if (isMergedButNotTopLeft) {
            // Skip this cell because it's part of a merged range but not the top-left cell
            return;
        }

        // Proceed to determine the className based on the cell's alignment
        if (cell.style && cell.style.alignment) {
            switch (cell.style.alignment.horizontal) {
                case 'center':
                    className[0] += 'htCenter ';
                    break;
                case 'left':
                    className[0] += 'htLeft ';
                    break;
                case 'right':
                    className[0] += 'htRight ';
                    break;
                // Add more cases as needed for other alignments
            }
        }
        if(rowIndex==4 && colIndex==1){
        console.log('-------------------------------***********------')
        console.log(rowIndex)
        console.log(colIndex)
        //console.log(cell)
        console.log('cell.style :')
        console.log(cell)
        //console.log(cell)
        console.log(cell.comment)
        //console.log(cell.style)
        //console.log(cell.style.fill)
        //console.log(cell.style.fill.fgColor)

        //console.log(cell.style.border)
        //console.log(cell.style.border.bottom)
        console.log('-------------------------------***********------')
    }



        if (cell.style && cell.style.fill && cell.style.fill.fgColor) {
            const colorClass = getColorClassName(cell.style.fill.fgColor);
            if (colorClass) {
                console.log('-------------------------------***********------')
                console.log('-------------------------------***********------')
                console.log('-------------------------------***********------')
                console.log('-------------------------------***********------')
                console.log('-------------------------------***********------')
                console.log(colorClass)
                className.push(colorClass);
            }
        }

        if (cell.style && cell.style.border && cell.style.border.bottom) {
            const borderClass = getBorderStyleClassName(cell.style.border.bottom);
            if (borderClass) {
                console.log('-------------------------------***********------')
                console.log('-------------------------------***********------')
                console.log('-------------------------------***********------')
                console.log('-------------------------------***********------')
                console.log('-------------------------------***********------')
                console.log(borderClass)
                className.push(borderClass);
            }
        }



        // Add the cell to cellClassMappings with its determined className
        cellClassMappings.push({
            row: rowIndex - 1, // ExcelJS row indices start at 1, but your example seems to be 0-based
            col: colIndex - 1, // Same adjustment for column index
            className: className.join(' ').trim()
        });
    });
});







//console.log(arrayOfArraysofData);

  

//   const mergedCells = worksheet.merges; // This is an array of the merged cell addresses
//   console.log('Merged Cells:');
//   console.log(mergedCells);



    const columnInformation = worksheet_of_table_with_info.columns.map((column, index) => {
    const type_col = worksheet_of_table_with_info.getRow(2).getCell(index + 1).value;
    const width_exact = worksheet_of_table_with_info.getRow(3).getCell(index + 1).value;

    return {
      header: column.header, // This is to identify the column, might be useful if you have headers
      width: column.width,
      width2: excelWidthToPixels(column.width),
      type_col: type_col,
      width_exact: width_exact
    };
  });

  const columnWidths = {
    index_r_start: indexRStart, // The row index where "r_start" is found in the first column
    index_end_titles:indexREndTitles,
    index_start_headers:indexRStartHeaders,
    index_end_headers:indexREndHeaders,
    index_start_cells:indexRStartCells,
    index_end_cells_displayed:indexREndCellsDisplayed,

    length_rows: lengthRows,
    //information_of_columns: columnInformation,
    //mergedCells:mergedcells_results,
    //Data_without_merged_cells:Data_without_merged_cells,

    last_row_after_header:last_row_after_header,
    cellClassMappings:cellClassMappings

  };

  console.log('columnWidths :::::::: ');
  console.log(columnWidths);

  //console.log('worksheet :')
  //console.log(worksheet)
}

// Replace 'path/to/your/excelfile.xlsx' with the path to your actual Excel file
readColumnWidths('example_excel.xlsx');
