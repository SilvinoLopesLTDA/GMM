const asyncHandler = require("express-async-handler");
const Item = require("../models/itemModel");
const Shop = require("../models/shopModel");

const createItem = asyncHandler(async (req, res) => {
  const userId = req.subaccount ? req.subaccount.user : req.user.id;
  const { name, price, quantity } = req.body;

  if (!name || !price || !quantity) {
    res.status(400);
    throw new Error("Por favor, preencha os campos corretamente!");
  }

  const item = await Item.create({
    user: userId,
    name,
    price,
    quantity,
  });

  res.status(201).json({ _id: item._id, name, price, quantity });
});

const getItems = asyncHandler(async (req, res) => {
  const userId = req.subaccount ? req.subaccount.user : req.user.id;
  const items = await Item.find({ user: userId }).sort("-createdAt");
  res.status(200).json(items);
});

const getItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (item) {
    const { _id, name, price, quantity } = item;
    res.status(200).json({
      _id,
      name,
      price,
      quantity,
    });
  } else {
    res.status(400);
    throw new Error("Item não encontrado!");
  }
});

const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error("Item não encontrado.");
  }

  if (
    !(
      req.user?.role === "master" ||
      req.subaccount?.role === "admin" ||
      (req.subaccount?.role === "worker" &&
        req.subaccount.workerFunction === "Almoxarifado")
    )
  ) {
    res.status(401);
    return res.json({
      message: "Usuário não autorizado para excluir este item.",
    });
  }

  await item.remove();
  res.status(200).json(item);
});

const updateItem = asyncHandler(async (req, res) => {
  const { name, price, quantity } = req.body;
  const { id } = req.params;
  const item = await Item.findById(id);

  if (!item) {
    res.status(404);
    throw new Error("Item não encontrado.");
  }

  const updatedItem = await Item.findByIdAndUpdate(
    { _id: id },
    {
      name,
      price,
      quantity,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json(updatedItem);
});

const placeItemInShop = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const shop = await Shop.findById(id);
  const items = await Item.find();

  if (!shop) {
    res.status(404);
    throw new Error("Barraca não encontrada.");
  }

  if (items.length === 0) {
    res.status(400);
    throw new Error("Nenhum item disponível.");
  }

  let itemList = "Escolha um item digitando o número correspondente:\n";
  items.forEach((item, index) => {
    itemList += `${index}. ${item.name}\n`;
  });

  res.status(200).send(itemList);
});

const handleUserChoice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { selectedItemIndex } = req.body;

  const shop = await Shop.findById(id);
  const items = await Item.find();

  if (!shop) {
    res.status(404);
    throw new Error("Barraca não encontrada.");
  }

  if (selectedItemIndex < 0 || selectedItemIndex >= items.length) {
    res.status(400);
    throw new Error("Índice de item inválido.");
  }

  const selectedItem = items.find(
    (item) => item._id.toString() === selectedItemIndex
  );

  if (!selectedItem) {
    res.status(404);
    throw new Error("Item não encontrado.");
  }

  if (selectedItem.quantity > 0) {
    selectedItem.quantity -= 1;
    await selectedItem.save();
  } else {
    res.status(400);
    throw new Error("Não há unidades suficientes desse item em estoque.");
  }

  shop.items.push(selectedItem);
  await shop.save();

  res.status(200).json({ message: "Item colocado na barraca com sucesso." });
});

const removeItemFromShop = asyncHandler(async (req, res) => {
  const { id, itemId } = req.params;

  const shop = await Shop.findById(id);

  if (!shop) {
    res.status(404);
    throw new Error("Barraca não encontrada.");
  }

  const itemToRemove = shop.items.find(
    (item) => item._id.toString() === itemId
  );

  if (!itemToRemove) {
    res.status(404);
    throw new Error("Item não encontrado na barraca.");
  }

  const originalItem = await Item.findById(itemToRemove._id);
  originalItem.quantity += 1;
  await originalItem.save();

  shop.items = shop.items.filter((item) => item._id.toString() !== itemId);

  await shop.save();

  res.status(200).json({ message: "Item removido da barraca com sucesso." });
});

module.exports = {
  createItem,
  getItems,
  getItem,
  deleteItem,
  updateItem,
  placeItemInShop,
  handleUserChoice,
  removeItemFromShop,
};
