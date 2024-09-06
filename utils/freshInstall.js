/**
 *
 * It's relatively easy to overload this function that will result in a long first open time.
 * If something can happen in the background, don't `await FreshInstall()` and instead just
 * `FreshInstall()` in isInitialLoad function.
 *
 */
import StoreModel from "./models/StoreModel.js";

const freshInstall = async ({ shop }) => {
  console.log("This is a fresh install - run functions");
  const existingStore = await StoreModel.query().findOne({ shop });
  if (existingStore) {
    await StoreModel.query().patch({ isActive: true }).where({ shop });
  } else {
    await StoreModel.query().insert({ shop, isActive: true });
  }
};


export default freshInstall;
