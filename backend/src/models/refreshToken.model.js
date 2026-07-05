const RefreshTokenSchema = {
  tableName: 'refresh_tokens',
  columns: {
    id: 'uuid',
    user_id: 'uuid',
    token: 'text',
    expires_at: 'timestamptz',
    created_at: 'timestamptz',
  },
};

module.exports = RefreshTokenSchema;
