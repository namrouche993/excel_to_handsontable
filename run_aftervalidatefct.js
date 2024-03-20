const ExcelJS = require('exceljs');

async function generateValidationScript(excelFilePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelFilePath);
  
  const sheet = workbook.worksheets[0];
  const mappings = new Map();

  const functionToProps = {};

  // Define a map of function names to their parameters
  const functionParams = {
    'afterValidatefct_date': '(isValid, oldvalue, row, prop, source, hot, commentsPlugin, decimalSeparator.current, userLocale.current, navigator_language.current, userTimeZone, usTimeZones, use_en_time, use_english_date_by_user_himeself_in_modal.current, setNotification)',
    'afterValidatefct_dropdown': '(isValid, oldvalue, row, prop, source, hot, commentsPlugin, isLoading, setNotification)',
    'afterValidatefct_email': '(isValid, oldvalue, row, prop, source, hot, commentsPlugin, emails_length_em, setNotification)',
    'afterValidatefct_onlynb': '(isValid, oldvalue, row, prop, source, hot, commentsPlugin, onlynumbers_length_on, setNotification)',
    'afterValidatefct_phonenumber': '(isValid, oldvalue, row, prop, source, hot, commentsPlugin, phonenumbers_length_pn, setNotification)',
    'afterValidatefct_text': '(isValid, oldvalue, row, prop, source, hot, commentsPlugin, text_length_txt, setNotification)',
    'afterValidatefct_percentage': '(isValid, oldvalue, row, prop, source, hot, commentsPlugin, decimalSeparator.current, userLocale.current, afterdigit_percentage_percperc, smallafterdigit_percentage_percperc, afterdigitsmallnb_percentage_percperc, bignbpercent_percperc, smallnbpercent_percperc, decimalnumbers_toshow_withoutrenderer_inpercentage_percperc, is_negativenb_accepted_percperc, is_float_accepted_percperc, display_plus_sign_in_the_start, setNotification)',
    'afterValidatefct_amounts': '(isValid, oldvalue, row, prop, source, hot, commentsPlugin, decimalSeparator.current, userLocale.current, last_row_after_header, currencyht_nbnb, currencyht_toshow_nbnb, afterdigit_nbnb, smallafterdigit_nbnb, afterdigitsmallnb_nbnb, bignb_nbnb, smallnb_nbnb, decimalnumbers_toshow_withoutrenderer_innumbers_nbnb, usegrouping_nbnb_if_true, is_negativenb_accepted_nbnb, display_plus_sign_in_the_start, setNotification)',
    'afterValidatefct_integers': '(isValid, oldvalue, row, prop, source, hot, commentsPlugin, decimalSeparator.current, userLocale.current, currencyht_intint, currencyht_toshow_intint, afterdigit_intint, smallafterdigit_intint, afterdigitsmallnb_intint, bignb_intint, smallnb_intint, decimalnumbers_toshow_withoutrenderer_innumbers_intint, usegrouping_intint_if_true, is_negativenb_accepted_intint, is_float_accepted_intint, display_plus_sign_in_the_start, setNotification)'
  };

  // Assuming the structure is always in the first two rows
  for (let i = 1; i <= sheet.columnCount; i++) {
    const propCell = sheet.getRow(1).getCell(i).text;
    const functionCell = sheet.getRow(2).getCell(i).text;

    if (propCell && functionCell) {
      const propIndex = parseInt(propCell.replace('C', ''), 10);
      //mappings.set(propIndex, functionCell);
      if (!functionToProps[functionCell]) {
        functionToProps[functionCell] = [];
      }
      functionToProps[functionCell].push(propIndex);

    }
  }

  let functionStr = `function afterValidatefct(isValid, oldvalue, row, prop, source, hot, userLocale, decimalSeparator, navigator_language, use_english_date_by_user_himeself_in_modal, commentsPlugin, isLoading, setNotification) {\n`;
  
  Object.entries(functionToProps).forEach(([functionName, propIndexes], index) => {
    // Join all prop indexes with logical OR for the condition
    const condition = propIndexes.map(index => `prop == ${index}`).join(' || ');

    if (index === 0) {
      functionStr += `  if (${condition}) {\n`;
    } else {
      functionStr += `  else if (${condition}) {\n`;
    }

    const params = functionParams[functionName]; // Retrieve the specific parameters for the function
    functionStr += `    ${functionName}${params};\n`; // Use the specific parameters
    functionStr += `  }\n`;
  });

  functionStr += `}\n`;

  console.log(functionStr);


}

// Replace 'path/to/your/excel/file.xlsx' with the actual file path
generateValidationScript('conditions.xlsx');
