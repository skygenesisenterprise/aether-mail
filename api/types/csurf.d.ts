declare module 'csurf' {
  import { RequestHandler } from 'express';
  interface CSURFOptions {
    value?: (req: any) => string;
    cookie?: boolean | object;
    ignoreMethods?: string[];
    sessionKey?: string;
    key?: string;
  }
  function csurf(options?: CSURFOptions): RequestHandler;
  export = csurf;
}