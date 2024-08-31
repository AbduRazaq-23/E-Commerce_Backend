import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

//@dec import routes
import userRoutes from "./routes/user.route.js";
import categoryRoutes from "./routes/category.routes.js";
import productsRoutes from "./routes/product.routes.js";

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productsRoutes);

export default app;
