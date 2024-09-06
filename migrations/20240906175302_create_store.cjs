exports.up = function(knex) {
	return knex.schema.createTable('active_stores', (table) => {
	  table.increments('id').primary();  // Auto-incrementing primary key
	  table.string('shop').notNullable().unique();  // Shop field, required and unique
	  table.boolean('isActive').defaultTo(false);  // Default value for isActive
	  table.timestamps(true, true);  // Adds created_at and updated_at columns
	});
  };
  
  exports.down = function(knex) {
	return knex.schema.dropTableIfExists('active_stores');
  };
  