import moment from 'moment';
export const toDateTimePickerFormat = (dateString?: string) => moment(dateString).format('YYYY-MM-DDTHH:mm');
export const toDatePickerFormat = (dateString?: string) => moment(dateString).format('YYYY-MM-DD');
