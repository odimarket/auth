module.exports = {
  APP_NAME: '',
  APP_DESCRIPTION: '',
  AUTH_SERVICE_URL: 'http://localhost:4005',
  CORE_SERVICE_URL: 'http://localhost:4007',
  scopes: {
    admin: [
      'CREATE_BUYER',
      'UPDATE_BUYER',
      'DELETE_BUYER',
      'VIEW_BUYERS',
      'CREATE_ADMIN',
      'UPDATE_ADMIN',
      'DELETE_ADMIN',
      'VIEW_ADMINS',
      'VIEW_SETTINGS',
      'CLIENTS_SETTINGS',
      'PRODUCTS_SETTINGS',
      'ROLES_SETTINGS',
      'SCOPES_SETTINGS',
    ],
  },
};
