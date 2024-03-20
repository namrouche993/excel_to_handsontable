function afterValidatefct(isValid, oldvalue, row, prop, source, hot, userLocale, decimalSeparator, navigator_language, use_english_date_by_user_himeself_in_modal, commentsPlugin, isLoading, setNotification) {
  if (prop == 1 || prop == 5) {
    afterValidatefct_onlynb(isValid, oldvalue, row, prop, source, hot, commentsPlugin, onlynumbers_length_on, setNotification);
  }
  else if (prop == 2 || prop == 4) {
    afterValidatefct_email(isValid, oldvalue, row, prop, source, hot, commentsPlugin, emails_length_em, setNotification);
  }
  else if (prop == 3) {
    afterValidatefct_dropdown(isValid, oldvalue, row, prop, source, hot, commentsPlugin, isLoading, setNotification);
  }
  else if (prop == 6) {
    afterValidatefct_phonenumber(isValid, oldvalue, row, prop, source, hot, commentsPlugin, phonenumbers_length_pn, setNotification);
  }
  else if (prop == 7) {
    afterValidatefct_date(isValid, oldvalue, row, prop, source, hot, commentsPlugin, decimalSeparator.current, userLocale.current, navigator_language.current, userTimeZone, usTimeZones, use_en_time, use_english_date_by_user_himeself_in_modal.current, setNotification);
  }
  else if (prop == 8) {
    afterValidatefct_percentage(isValid, oldvalue, row, prop, source, hot, commentsPlugin, decimalSeparator.current, userLocale.current, afterdigit_percentage_percperc, smallafterdigit_percentage_percperc, afterdigitsmallnb_percentage_percperc, bignbpercent_percperc, smallnbpercent_percperc, decimalnumbers_toshow_withoutrenderer_inpercentage_percperc, is_negativenb_accepted_percperc, is_float_accepted_percperc, display_plus_sign_in_the_start, setNotification);
  }
  else if (prop == 9 || prop == 16) {
    afterValidatefct_amounts(isValid, oldvalue, row, prop, source, hot, commentsPlugin, decimalSeparator.current, userLocale.current, last_row_after_header, currencyht_nbnb, currencyht_toshow_nbnb, afterdigit_nbnb, smallafterdigit_nbnb, afterdigitsmallnb_nbnb, bignb_nbnb, smallnb_nbnb, decimalnumbers_toshow_withoutrenderer_innumbers_nbnb, usegrouping_nbnb_if_true, is_negativenb_accepted_nbnb, display_plus_sign_in_the_start, setNotification);
  }
  else if (prop == 10 || prop == 12 || prop == 13 || prop == 14 || prop == NaN) {
    afterValidatefct_text(isValid, oldvalue, row, prop, source, hot, commentsPlugin, text_length_txt, setNotification);
  }
  else if (prop == 11) {
    afterValidatefct_integers(isValid, oldvalue, row, prop, source, hot, commentsPlugin, decimalSeparator.current, userLocale.current, currencyht_intint, currencyht_toshow_intint, afterdigit_intint, smallafterdigit_intint, afterdigitsmallnb_intint, bignb_intint, smallnb_intint, decimalnumbers_toshow_withoutrenderer_innumbers_intint, usegrouping_intint_if_true, is_negativenb_accepted_intint, is_float_accepted_intint, display_plus_sign_in_the_start, setNotification);
  }
}
