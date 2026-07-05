const UserSchema = {
  tableName: 'users',
  columns: {
    id: 'uuid',
    username: 'varchar(50)',
    email: 'varchar(100)',
    password: 'varchar(255)',
    role: "varchar(20) default 'employee'",
    created_at: 'timestamptz',
    updated_at: 'timestamptz',
  },
  roleEnum: ['admin', 'employee'],
};

module.exports = UserSchema;
