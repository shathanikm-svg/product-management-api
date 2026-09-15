import createApp from './app.js';

const app = createApp();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Product Management API is running on port ${PORT}`);
});
