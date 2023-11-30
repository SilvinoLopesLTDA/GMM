const asyncHandler = require("express-async-handler");
const Shop = require("../models/shopModel");
const Purchase = require("../models/purchaseModel");
const Cost = require("../models/costModel");
const mongoose = require("mongoose");

const createShop = asyncHandler(async (req, res) => {
  const { name, password, profit, cost } = req.body;

  if (!req.user && req.subaccount.role !== "admin") {
    res.status(403);
    throw new Error("Você não tem permissão para criar pontos de venda.");
  }

  if (!name || !password) {
    res.status(400);
    throw new Error("Por favor, preencha os campos corretamente!");
  }

  if (password.length > 4) {
    res.status(400);
    throw new Error("A senha não pode conter mais de 4 caracteres!");
  }

  if (password.length < 4) {
    res.status(400);
    throw new Error("A senha não pode conter menos de 4 caracteres!");
  }

  const userId = req.user
    ? req.user.id
    : req.subaccount
    ? req.subaccount.user.toString()
    : null;

  if (!userId) {
    res.status(403);
    throw new Error("Não foi possível determinar o usuário para criar a loja.");
  }

  const shop = await Shop.create({
    user: userId,
    name,
    password,
    profit,
    cost,
  });

  res.status(201).json({ _id: shop._id, name, password, profit, cost });
});

const createItem = asyncHandler(async (req, res) => {
  const { name, price, quantity } = req.body;
  const id = req.params.id;

  if (!name || !price) {
    res.status(400);
    throw new Error("Por favor, preencha os campos corretamente!");
  }

  const shop = await Shop.findById(id);

  if (!shop) {
    res.status(404);
    throw new Error("Ponto de venda não encontrado.");
  }

  const newItem = {
    name,
    price: parseFloat(price),
    quantity,
  };

  shop.items.push(newItem);
  const updatedShop = await shop.save();

  res.status(201).json(updatedShop);
});

const getShops = asyncHandler(async (req, res) => {
  const userId = req.subaccount ? req.subaccount.user : req.user.id;
  const isSubaccountBarraca =
    req.subaccount && req.subaccount.workerFunction === "Barraca";

  if (isSubaccountBarraca) {
    const shops = await Shop.find({ workers: req.subaccount._id }).sort(
      "-createdAt"
    );
    res.status(200).json(shops);
  } else {
    const shops = await Shop.find({ user: userId }).sort("-createdAt");
    res.status(200).json(shops);
  }
});

const getShop = asyncHandler(async (req, res) => {
  const userId = req.subaccount ? req.subaccount.user : req.user.id;
  const shop = await Shop.findById(req.params.id);

  if (!shop) {
    res.status(404);
    throw new Error("Ponto de venda não encontrado.");
  }

  if (shop.user.toString() !== userId.toString()) {
    res.status(401);
    throw new Error("Usuário não Autorizado.");
  }

  res.status(200).json(shop);
});

const deleteShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop) {
    res.status(404);
    throw new Error("Ponto de venda não encontrado.");
  }

  if (!req.user && req.subaccount.role !== "admin") {
    res.status(403);
    throw new Error("Você não tem permissão para criar pontos de venda.");
  }

  await shop.remove();
  res.status(200).json(shop);
});

const deleteItem = asyncHandler(async (req, res) => {
  const itemId = req.params.id;

  const shop = await Shop.findOne({ "items._id": itemId });

  if (!req.user && req.subaccount.role !== "admin") {
    res.status(403);
    throw new Error("Você não tem permissão para criar pontos de venda.");
  }

  if (!shop) {
    res.status(404);
    throw new Error("Ponto de venda não encontrado.");
  }

  if (shop.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error({ message: "Ponto de venda Deletado com Sucesso." });
  }

  shop.items = shop.items.filter((item) => item._id.toString() !== itemId);

  const updatedShop = await shop.save();

  res.status(200).json(updatedShop);
});

const updateShop = asyncHandler(async (req, res) => {
  const { name, password, profit, cost } = req.body;
  const { id } = req.params;
  const shop = await Shop.findById(id);

  if (!req.user && req.subaccount.role !== "admin") {
    res.status(403);
    throw new Error("Você não tem permissão para criar pontos de venda.");
  }

  if (!shop) {
    res.status(404);
    throw new Error("Ponto de venda não encontrado.");
  }

  const newCost = parseFloat(cost);
  const oldCost = shop.cost;
  const costDifference = newCost - oldCost;

  shop.name = name;
  shop.password = password;
  shop.profit = parseFloat(profit);
  shop.cost = newCost;

  if (costDifference !== 0) {
    const transaction = new Cost({
      user: req.user.id,
      shop: shop._id,
      costValue: Math.abs(costDifference),
    });

    await transaction.save();

    shop.costsUpdated.push(transaction);

    const updatedShop = await shop.save();

    res.status(200).json(updatedShop);
  } else {
    const updatedShop = await shop.save();
    res.status(200).json(updatedShop);
  }
});

const updateItem = asyncHandler(async (req, res) => {
  const { name, price, quantity } = req.body;
  const { shopId, itemId } = req.params;

  const shop = await Shop.findById(shopId);
  if (!shop) {
    res.status(404);
    throw new Error("Ponto de venda não encontrado.");
  }

  const item = shop.items.find((item) => item._id.toString() === itemId);
  if (!item) {
    res.status(404);
    throw new Error("Item não encontrado.");
  }

  item.name = name;
  item.price = price;
  item.quantity = quantity;

  const updatedShop = await shop.save();

  res.status(200).json(updatedShop);
});

const purchaseItem = asyncHandler(async (req, res) => {
  const { shopId } = req.params;
  const { cart } = req.body;
  const userId = req.subaccount ? req.subaccount.user : req.user.id;

  if (!userId) {
    res.status(401);
    throw new Error("Usuário não autenticado.");
  }

  const shop = await Shop.findById(shopId);
  if (!shop) {
    res.status(404);
    throw new Error("Ponto de venda não encontrado.");
  }

  for (const cartItem of cart) {
    const { itemId, quantity } = cartItem;
    const item = shop.items.find((item) => item._id.toString() === itemId);
    if (!item) {
      res.status(404);
      throw new Error(`Item com ID ${itemId} não encontrado.`);
    }

    if (item.quantity < quantity) {
      res.status(400);
      throw new Error(`Quantidade insuficiente para o item com ID ${itemId}.`);
    }

    item.quantity = quantity;
  }

  const updatedShop = await shop.save();

  res.status(200).json(updatedShop);
});

const registerPurchase = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { id } = req.params;

  if (!cart || cart.length === 0) {
    res.status(400);
    throw new Error("O carrinho está vazio.");
  }

  const shop = await Shop.findById(id);

  if (!shop) {
    res.status(404);
    throw new Error("Ponto de venda não encontrado.");
  }

  const purchaseItems = [];

  for (const cartItem of cart) {
    const itemId = mongoose.Types.ObjectId(cartItem.id);
    const shopItem = shop.items.find((item) => item._id.equals(itemId));
    if (!shopItem) {
      res.status(400);
      throw new Error(`Item com ID ${itemId} não encontrado na barraca.`);
    }

    purchaseItems.push({
      id: shopItem._id,
      name: shopItem.name,
      price: shopItem.price,
      quantity: cartItem.quantity,
    });
  }

  const profitValue = purchaseItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const newPurchase = new Purchase({
    user: req.user.id,
    shop: shop._id,
    items: purchaseItems,
    profitValue,
  });

  shop.profit += parseFloat(profitValue);

  await newPurchase.save();

  purchaseItems.forEach((item) => {
    const shopItem = shop.items.find((shopItem) =>
      shopItem._id.equals(item.id)
    );
    if (shopItem) {
      shopItem.quantity -= item.quantity;
      if (shopItem.quantity < 0) {
        shopItem.quantity = 0;
      }
    }
  });

  shop.purchases.push(newPurchase);

  const updatedShop = await shop.save();

  res.status(200).json(updatedShop);
});

const getPurchases = asyncHandler(async (req, res) => {
  const userId = req.user
    ? req.user.id
    : req.subaccount
    ? req.subaccount.user.toString()
    : null;
  if (!req.user && req.subaccount.role !== "admin") {
    res.status(403);
    throw new Error("Você não tem permissão para utilizar essa função.");
  } else {
    const purchases = await Purchase.find({ user: userId }).sort("-createdAt");
    res.status(200).json(purchases);
  }
});

const getCosts = asyncHandler(async (req, res) => {
  const userId = req.user
    ? req.user.id
    : req.subaccount
    ? req.subaccount.user.toString()
    : null;
  if (!req.user && req.subaccount.role !== "admin") {
    res.status(403);
    throw new Error("Você não tem permissão para utilizar essa função.");
  } else {
    const costs = await Cost.find({ user: userId }).sort("-createdAt");
    res.status(200).json(costs);
  }
});

const addWorker = asyncHandler(async (req, res) => {
  const shopId = req.params.id;
  const { workers } = req.body;

  const shop = await Shop.findById(shopId);
  if (!shop) {
    res.status(404);
    throw new Error("Ponto de venda não encontrado.");
  }

  if (!req.user && req.subaccount.role !== "admin") {
    res.status(403);
    throw new Error("Você não tem permissão para utilizar essa função.");
  } else {
    shop.workers = workers;
    const updatedShop = await shop.save();
    res.status(200).json(updatedShop);
  }
});

const removeWorker = asyncHandler(async (req, res) => {
  const shopId = req.params.id;
  const workers = req.body;

  if (!workers) {
    res.status(400);
    throw new Error("Nenhum trabalhador fornecido para remoção.");
  }

  const shop = await Shop.findById(shopId);
  if (!shop) {
    res.status(404);
    throw new Error("Ponto de venda não encontrado.");
  }

  if (!req.user && req.subaccount.role !== "admin") {
    res.status(403);
    throw new Error("Você não tem permissão para utilizar essa função.");
  } else {
    const validWorkerIds = workers
      .map((workerId) => workerId.trim())
      .filter((workerId) => mongoose.Types.ObjectId.isValid(workerId));

    if (validWorkerIds.length === 0) {
      res.status(400);
      throw new Error("IDs de trabalhadores inválidos fornecidos.");
    }

    const removedWorkers = shop.workers.filter(
      (workerId) => !validWorkerIds.includes(workerId.toString())
    );

    if (removedWorkers.length === shop.workers.length) {
      res.status(404);
      throw new Error("Nenhum trabalhador foi removido desta barraca.");
    }

    shop.workers = removedWorkers.map((workerId) =>
      mongoose.Types.ObjectId(workerId)
    );
    const updatedShop = await shop.save();
    res.status(200).json(updatedShop);
  }
});

module.exports = {
  createShop,
  createItem,
  getShops,
  getShop,
  deleteShop,
  deleteItem,
  updateShop,
  updateItem,
  purchaseItem,
  registerPurchase,
  getPurchases,
  getCosts,
  addWorker,
  removeWorker,
};
