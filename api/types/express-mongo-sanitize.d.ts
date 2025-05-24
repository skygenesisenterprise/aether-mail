declare module 'express-mongo-sanitize' {
  import { RequestHandler } from 'express';
  const mongoSanitize: () => RequestHandler;
  export default mongoSanitize;
}