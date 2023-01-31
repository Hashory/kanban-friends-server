import express from "express";
import { createServer } from "http";
import * as explessOpenAPI from "express-openapi";
import helmet from "helmet";
// import cors from "cors";
import bodyParser from "body-parser";
import path from "node:path";
import openAPISchema from "./openapi";
// import * as user_controller from "./controller/user";
import * as hand_controller from "./controller/hand";

function explessInit() {

  const app = express();
  // app.use(helmet());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  // app.use(cors());
  /*
  app.use(
    checkReferer(
      process.env.NODE_ENV === "development" ? "localhost" : "hashory.work",
    ),
  );
  */

  explessOpenAPI.initialize({
    app,
    apiDoc: path.resolve(__dirname, "openapi.yml"),
     //apiDoc: openAPISchema.toString(),
    validateApiDoc: true,
    operations: {
      // hands
      getHand: [hand_controller.getHand],
      createHand: [hand_controller.createHand],
      updateHand: [hand_controller.updateHand],
      deleteHand: [hand_controller.deleteHand],

      // cards
    },
    errorMiddleware: (err, req, res, next) => {
      res.status(err.status | 500).send(err);
    },
  });

  app.listen(3000, () => {
    console.log("Listening on port 3000");
  });
}


export default explessInit;