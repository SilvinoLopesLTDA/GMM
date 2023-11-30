import axios from "axios";
import { toast } from "react-toastify";

export const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

export const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/user/register`,
      userData,
      { withCredentials: true }
    );
    if (response.statusText === "OK") {
      toast.success("Usuário Cadastrado com sucesso!");
    }
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
  }
};

export const registerSubUser = async (formData) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/user/register-subaccount`,
      formData,
      {
        withCredentials: true,
      }
    );
    if (response.statusText === "OK") {
      toast.success("Usuário cadastrado com sucesso!");
    }
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
  }
};

export const LoginUser = async (userData) => {
  const response = await axios.post(`${BACKEND_URL}/api/user/login`, userData);
  if (response.statusText === "OK") {
    toast.success("Usuário logado com sucesso!");
  }
  return response.data;
};

export const confirmateEmail = async (confirmationToken) => {
  console.log(confirmationToken);
  const response = await axios.get(
    `${BACKEND_URL}/api/user/confirm-email/${confirmationToken}`
  );
  return response.data;
};

export const LogoutUser = async (userData) => {
  try {
    await axios.get(`${BACKEND_URL}/api/user/logout`, userData);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
  }
};

export const forgotPassword = async (userData) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/user/forgot-password`,
      userData
    );
    toast.success(response.data.message);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
  }
};

export const resetPassword = async (userData, resetToken) => {
  try {
    const response = await axios.put(
      `${BACKEND_URL}/api/user/reset-password/${resetToken}`,
      userData
    );
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
  }
};

export const getLoginStatus = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/user/loggedin`);
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
  }
};

export const getUser = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/user/get-user`);
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
  }
};

export const updateUser = async (formData) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    const response = await axios.patch(
      `${BACKEND_URL}/api/user/update-user`,
      formData,
      config
    );
    return response;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
  }
};

export const changePassword = async (formData) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/user/change-password`,
      formData
    );
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
  }
};

export const listSubaccounts = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/user/get-subaccounts`);
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
  }
};

export const getSubaccountById = async (id) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/user/get-subaccount/${id}`
    );
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
  }
};

export const updateSubaccount = async (id, formData) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/user/update-subaccount/${id}`,
      formData
    );
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
  }
};

export const deleteSubaccount = async (id) => {
  try {
    const response = await axios.delete(
      `${BACKEND_URL}/api/user/delete-subaccount/${id}`
    );
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
  }
};

export const deleteAccount = async (password) => {
  try {
    const response = await axios.delete(
      `${BACKEND_URL}/api/user/delete-account`,
      password
    );
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    toast.error(message);
  }
};
