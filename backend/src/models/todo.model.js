const TodoSchema = {
  tableName: 'todos',
  columns: {
    id: 'uuid',
    created_by: 'uuid',
    assigned_to: 'uuid',
    title: 'varchar(255)',
    description: 'text',
    status: "varchar(20) default 'pending'",
    created_at: 'timestamptz',
    updated_at: 'timestamptz',
  },
  statusEnum: ['pending', 'completed'],
};

module.exports = TodoSchema;
