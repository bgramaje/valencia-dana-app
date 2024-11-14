import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';
import { isEmpty } from 'lodash';
import { DATE_OPTIONS, TOAST_ERROR_CLASSNAMES } from './enums';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function hasAnyAttribute(obj, attributes) {
  return attributes.some((attr) => attr in obj && !isEmpty(obj[attr]));
}

export const fetcher = (url, options, successMessage) => fetch(url, options)
  .then(async (response) => {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error');
    }
    return response.json();
  })
  .then((data) => {
    if (isEmpty(successMessage)) return data;

    toast.success(successMessage, {
      description: new Intl.DateTimeFormat('es-ES', DATE_OPTIONS).format(new Date()),
      duration: 2000,
    });
    return data;
  })
  .catch((error) => {
    toast.error(`Error: ${error.message}`, {
      duration: 2000,
      classNames: TOAST_ERROR_CLASSNAMES,
    });
    throw error;
  });

export const convertToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
});
