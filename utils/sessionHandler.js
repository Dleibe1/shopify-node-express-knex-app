import { Session } from "@shopify/shopify-api";
import SessionModel from "./models/SessionModel.js";

/**
 * Stores the session data into the PostgreSQL database.
 *
 * @param {Session} session - The Shopify session object.
 * @returns {Promise<boolean>} Returns true if the operation was successful.
 */
const storeSession = async (session) => {
  await SessionModel.query().insert({
    id: session.id,
    shop: session.shop,
    content: JSON.stringify(session),
  });

  return true;
};

/**
 * Loads the session data from the PostgreSQL database.
 *
 * @param {string} id - The session ID.
 * @returns {Promise<Session | undefined>} Returns the Shopify session object or undefined if not found.
 */
const loadSession = async (id) => {
  const sessionResult = await SessionModel.query().findById(id);
  if (!sessionResult) {
    return undefined;
  }
  const sessionObj = JSON.parse(sessionResult.content);
  return new Session(sessionObj);
};

/**
 * Deletes the session data from the PostgreSQL database.
 *
 * @param {string} id - The session ID.
 * @returns {Promise<boolean>} Returns true if the operation was successful.
 */
const deleteSession = async (id) => {
  await SessionModel.query().deleteById(id);
  return true;
};

export default { storeSession, loadSession, deleteSession };
