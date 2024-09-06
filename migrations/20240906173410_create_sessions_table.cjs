exports.up = function(knex) {
	return knex.schema.createTable('sessions', function(table) {
	  table.string('id').primary();  // Session ID (primary key)
	  table.string('shop').notNullable();  // Shopify shop domain
	  table.json('content').notNullable();  // Session content (stored as JSON)
	  table.timestamps(true, true);  // created_at and updated_at timestamps
	});
  };
  
  exports.down = function(knex) {
	return knex.schema.dropTableIfExists('sessions');
  };
  