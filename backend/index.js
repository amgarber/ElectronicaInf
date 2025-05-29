const env = process.env.NODE_ENV || 'development';

if (env === 'production') {
    require('./index.prod');
} else {
    require('./index.local');
}
