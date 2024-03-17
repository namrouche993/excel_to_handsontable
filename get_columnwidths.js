const ExcelJS = require('exceljs');

function excelWidthToPixels(excelWidth) {
  const maxDigitWidth = 7; // This is an approximate max digit width for the default Excel font (Calibri 11)
  const paddingSize = 5; // Excel also adds a small amount of padding to the column width
  return Math.round((excelWidth * maxDigitWidth) + paddingSize);
}

async function readColumnWidths(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0]; // Assuming you want the first worksheet

  // Get the length of the rows (assuming data doesn't have empty rows in between)
  const lengthRows = worksheet.actualRowCount;

  const columnInformation = worksheet.columns.map((column, index) => {
    const type_col = worksheet.getRow(2).getCell(index + 1).value;
    const width_exact = worksheet.getRow(3).getCell(index + 1).value;

    return {
      header: column.header, // This is to identify the column, might be useful if you have headers
      width: column.width,
      width2: excelWidthToPixels(column.width),
      type_col: type_col,
      width_exact: width_exact
    };
  });

  const columnWidths = {
    length_rows: lengthRows,
    information_of_columns: columnInformation
  };

  console.log('columnWidths :::::::: ');
  console.log(columnWidths);
}

// Replace 'path/to/your/excelfile.xlsx' with the path to your actual Excel file
readColumnWidths('example_excel.xlsx');
