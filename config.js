// Вход по почте через Appwrite Cloud (работает из России, в отличие от Firebase).
// Пока projectId пустой, сайт работает без аккаунтов: прогресс хранится в браузере.
// Как получить значения — см. SETUP.md.
window.APPWRITE_CONFIG = {
  endpoint: 'https://fra.cloud.appwrite.io/v1', // регион проекта (Frankfurt)
  projectId: '',                                // ID проекта из консоли Appwrite
  databaseId: 'main',                           // ID базы данных
  tableId: 'progress',                          // ID таблицы с прогрессом
};
