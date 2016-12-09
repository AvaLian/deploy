import moment from 'moment';

export function fomatDate (date) {
  if (!date) {
    return;
  }
  return moment(date).format('YYYY-MM-DD H:MM:SS');
};