exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/travelogue';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/travelogue-test'
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET || 'jurassic92';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
exports.UNSPLASH_ACCESS_KEY = '6f8d2ffa610d122e3ce491da3b1f9fc50ef4623e6056e2efa8d9b3de7c85a5bb';