const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan('dev'));

// Proxies
app.use('/api/auth', createProxyMiddleware({ target: process.env.AUTH_SERVICE_URL, changeOrigin: true }));
app.use(['/api/restaurant', '/api/restaurants'], createProxyMiddleware({
    target: process.env.RESTAURANT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/restaurant(s)?': '/api/restaurants' }
}));
app.use('/api/foods', createProxyMiddleware({ target: process.env.RESTAURANT_SERVICE_URL, changeOrigin: true }));
app.use('/api/reviews', createProxyMiddleware({ target: process.env.RESTAURANT_SERVICE_URL, changeOrigin: true }));
app.use('/api/orders', createProxyMiddleware({ target: process.env.ORDER_SERVICE_URL, changeOrigin: true }));
app.use('/api/delivery', createProxyMiddleware({ target: process.env.DELIVERY_SERVICE_URL, changeOrigin: true }));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API Gateway is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
