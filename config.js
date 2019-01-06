exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/travelogue';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/travelogue-test'
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = 'fuckyou';