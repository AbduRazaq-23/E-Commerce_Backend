import Stripe from "stripe";
import { v4 as uuid4 } from "uuid";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const paymentGateWay = asyncHandler((req, res) => {
  const {
    data: { product, token },
  } = req.body;

  const idempotency_key = uuid4();

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
          description: `purchase of ${product.name}`,
          shipping: {
            name: token.card.name,
            address: {
              country: token.card.address_country,
            },
          },
        },
        { idempotency_key }
      );
    })
    .then((result) =>
      res.status(200).json(new ApiResponse(200, result, "successfully ordered"))
    )
    .catch((error) => console.log(error));
});

export { paymentGateWay };
