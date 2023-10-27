import axios from "axios";

export const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

const API_URL = `${BACKEND_URL}/api/items`;

// Create New Item
const createItem = async (formData) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const response = await axios.post(`${API_URL}/create-item`, formData, config);
  return response.data;
};

// Get all Items
const getItems = async () => {
  const response = await axios.get(`${API_URL}`);
  return response.data;
};

// Get a Item
const getItem = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Delete a Item
const deleteItem = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

// Update  Item
const updateItem = async (id, formData) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const response = await axios.patch(
    `${API_URL}/update-item/${id}`,
    formData,
    config
  );
  return response.data;
};

// Place Item Shop
const placeItemInShop = async (shopId, formData) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const response = await axios.patch(
    `${API_URL}/place-item/${shopId}`,
    formData,
    config
  );
  return response.data;
};

// Handle User Choice
const handleUserChoice = async ({ id, selectedItemIndex }) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const response = await axios.patch(
    `${API_URL}/handle-choice/${id}`,
    { selectedItemIndex },
    config
  );
  return response.data;
};

// Remove Item From Shop
const removeItemFromShop = async (id, itemId) => {
  const response = await axios.delete(
    `${API_URL}/shops/${id}/remove-item/${itemId}`
  );
  return response.data;
};

const itemsService = {
  createItem,
  getItems,
  getItem,
  deleteItem,
  updateItem,
  placeItemInShop,
  handleUserChoice,
  removeItemFromShop,
};

export default itemsService;
