import { Model } from 'objection';
import Knex from 'knex';

import knexConfig from "../../knexfile.cjs"

Model.knex(knexConfig);

class SessionModel extends Model {
  static get tableName() {
    return 'sessions';
  }

  static get idColumn() {
    return 'id';
  }
}

export default SessionModel;
