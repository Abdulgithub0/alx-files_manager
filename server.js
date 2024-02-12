import express from 'express';
import router from './routes/index';

const app = express();

// register the Router instance from index.js file  on app
app.use(router);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log('Successfully setup express instance, running on port: ', port));
