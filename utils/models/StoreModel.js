import { Model } from 'objection';

class StoreModel extends Model {

  static get tableName() {
    return 'active_stores'; 
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['shop'],

      properties: {
        id: { type: 'integer' },  
        shop: { type: 'string', minLength: 1, maxLength: 255 },
        isActive: { type: 'boolean', default: false },
      },
    };
  }
}

export default StoreModel;
