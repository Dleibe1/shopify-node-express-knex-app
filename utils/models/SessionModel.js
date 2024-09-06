import { Model } from 'objection';
import knexConfig from "../../knexfile.cjs";

Model.knex(knexConfig);

class SessionModel extends Model {
  static get tableName() {
    return 'sessions';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'shop', 'content'],

      properties: {
        id: { type: 'string' },
        shop: { type: 'string' },
        content: { type: 'string' }, 
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    };
  }
}

export default SessionModel;
