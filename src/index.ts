import dbInit from "./db/initilaize";
import firebaseInit from "./firebase";
import explessInit from "./expless/initilaize";

if(process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

(async () => {
  console.log("Initializing...")
  await firebaseInit();
  await dbInit();
  await explessInit();
})();