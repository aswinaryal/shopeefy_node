const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const router = express.Router();
const mongoose = require("mongoose");

router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" }
    });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

router.post("/", async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      if (mongoose.isValidObjectId(orderItem.product)) {
        let newOrderItem = new OrderItem({
          quantity: orderItem.quantity,
          product: orderItem.product
        });
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
      } else {
        return Promise.reject(
          `Not valid id for this product ${JSON.stringify(orderItem)}`
        );
      }
    })
  );

  const orderItemsIdsResolved = await orderItemsIds;

  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      if (orderItem) {
        console.log("Order item =>>", orderItem);

        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
      }
    })
  );
  console.log("total prices", totalPrices);
  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  try {
    let order = new Order({
      orderItems: orderItemsIdsResolved,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user
    });

    order = await order.save();

    if (!order) return res.status(400).send("the order cannot be created!");

    res.send(order);
  } catch (e) {
    console.log(e);
    res.status(500).json({
      status: "failed",
      error: e
    });
  }
});

router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status
    },
    { new: true }
  );

  if (!order) return res.status(400).send("the order cannot be updated!");

  res.send(order);
});

router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndRemove(req.params.id);
    if (order) {
      const deletedOrderItems = Promise.all(
        order.orderItems.map(async (item) => {
          return await OrderItem.findByIdAndRemove(item);
        })
      );

      await deletedOrderItems;

      return res
        .status(200)
        .json({ success: true, message: "Order deleted successfully" });
    } else {
      return res
        .status(404)
        .json({ success: true, message: "Could not delete order" });
    }
  } catch (e) {
    return res.status(500).json({
      message: "could not delete this order"
    });
  }
});

router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } }
  ]);

  if (!totalSales) {
    return res.status(400).send("The order sales cannot be generated");
  }

  res.send({ totalSales: totalSales.pop().totalsales });
});

router.get("/get/count", async (req, res) => {
  const orderCount = await Order.countDocuments((count) => count);

  if (!orderCount) {
    res.status(500).json({ success: false });
  }
  res.send({ orderCount: orderCount });
});

router.get(`/get/userOrders/:userid`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" }
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});

module.exports = router;
