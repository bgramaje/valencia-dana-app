import axios from 'axios';
import StatusCode from 'status-code-enum';
import { toast } from 'sonner';
import { DATE_OPTIONS } from './enums';

const toastConfig = {
  description: new Intl.DateTimeFormat('es-ES', DATE_OPTIONS).format(new Date()),
  duration: 2000,
};

/**
 * @method GET
 * @description Performs a GET request to the api.
 * For successful requests, api response will return a 200 status code.
 * @param  {...any} args the axios config for GET requests
 * @returns null if some error has happened, otherwise the data returned by the api
 */
export const GET = async (
  axiosParams = {},
  config = {},
) => {
  const {
    endpoint = null,
    config: axiosConfig = { headers: { 'Content-Type': 'application/json' } },
  } = axiosParams;

  const {
    msg = {
      error: 'Error during GET:',
    },
  } = config;

  try {
    const response = await axios.get(endpoint, axiosConfig);
    if (response.status !== StatusCode.SuccessOK) {
      throw new Error(response?.data?.error ?? 'Unknwon error');
    }
    return response.data;
  } catch (error) {
    toast.error(`${msg?.error}, ${error.message}`, toastConfig);
    return null;
  }
};

/**
 * @method POST
 * @description Performs a PUT request to the api.
 * For successful requests, api response will return a 201 status code.
 * @param {obj} axiosParams, includes the endpoint, body and config
 * @param {string} axiosParams.endpoint
 * @param {json} axiosParams.body the body to send the post request
 * @param {obj} axiosParams.config the axios config
 * @param {obj} config the config for the toast
 * @returns null if some error has happened, otherwise the data returned by the api
 */
export const POST = async (
  axiosParams = {},
  config = {},
) => {
  const {
    endpoint = null,
    body = null,
    config: axiosConfig = { headers: { 'Content-Type': 'application/json' } },
  } = axiosParams;

  const {
    msg = {
      error: 'Error during POST:',
      success: 'Success during POST:',
    },
  } = config;

  try {
    const response = await axios.post(endpoint, body, axiosConfig);
    if (response.status !== StatusCode.SuccessCreated) {
      throw new Error(response?.data?.error ?? 'Unknwon error');
    }
    toast.success(msg.success, toastConfig);
    return response.data;
  } catch (error) {
    toast.error(`${msg?.error}, ${error.message}`, toastConfig);
    return null;
  }
};

/**
 * @method PUT
 * @description Performs a PUT request to the api.
 * For successful requests, api response will return a 201 status code.
 * @param {obj} axiosParams, includes the endpoint, body and config
 * @param {string} axiosParams.endpoint
 * @param {json} axiosParams.body the body to send the post request
 * @param {obj} axiosParams.config the axios config
 * @param {obj} config the config for the toast
 * @returns null if some error has happened, otherwise the data returned by the api
 */
export const PUT = async (
  axiosParams = {},
  config = {},
) => {
  const {
    endpoint = null,
    body = null,
    config: axiosConfig = { headers: { 'Content-Type': 'application/json' } },
  } = axiosParams;

  const {
    msg = {
      error: 'Error during PUT:',
      success: 'Success during PUT:',
    },
  } = config;

  try {
    const response = await axios.put(endpoint, body, axiosConfig);
    if (response.status !== StatusCode.SuccessOK) {
      throw new Error(response?.data?.error ?? 'Unknwon error');
    }
    toast.success(msg.success, toastConfig);
    return response.data;
  } catch (error) {
    toast.error(`${msg?.error}, ${error.message}`, toastConfig);
    return null;
  }
};

/**
 * @method PUT
 * @description Performs a PUT request to the api.
 * For successful requests, api response will return a 201 status code.
 * @param {obj} axiosParams, includes the endpoint, body and config
 * @param {string} axiosParams.endpoint
 * @param {json} axiosParams.body the body to send the delete request
 * @param {obj} axiosParams.config the axios config
 * @param {obj} config the config for the toast
 * @returns null if some error has happened, otherwise the data returned by the api
 */
export const DELETE = async (
  axiosParams = {},
  config = {},
) => {
  const {
    endpoint = null,
    body = null,
    config: axiosConfig = { headers: { 'Content-Type': 'application/json' } },
  } = axiosParams;

  const {
    msg = {
      error: 'Error during DELETE:',
      success: 'Success during DELETE',
    },
  } = config;

  try {
    const response = await axios.delete(endpoint, { data: body, ...axiosConfig });
    if (response.status !== StatusCode.SuccessOK) {
      throw new Error(response?.data?.error ?? 'Unknwon error');
    }
    toast.success(msg.success, toastConfig);
    return response.data;
  } catch (error) {
    toast.error(`${msg?.error}, ${error.message}`, toastConfig);
    return null;
  }
};
