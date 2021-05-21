const domino = require('domino');
const fs = require('fs');
const path = require('path');
const template = fs.readFileSync('dist/material-dashboard-angular2/browser/index.html').toString();
const win = domino.createWindow(template);
global['window'] = win;
global['document'] = win.document;
global['DOMTokenList'] = win.DOMTokenList;
global['Node'] = win.Node;
global['Text'] = win.Text;
global['HTMLElement'] = win.HTMLElement;
global['navigator'] = win.navigator;
// global['matchMedia']=win.matchMedia();
win.matchMedia = (query => ({
  matches: query.indexOf('(min-width: 1025px)') !== -1,
  }));
import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';
import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/material-dashboard-angular2/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  //app.get('/app/**', (req, res) => { res.sendFile(join(DIST_FOLDER, 'browser', 'index.html')); });
  // server.get('/login', (req, res) => {
  //   // res.render(join(distFolder, 'browser', 'index.html'));
  //   // res.sendFile(join(distFolder, 'browser', 'index.html')); 
  // });
  // server.get('*', (req, res) => {
  //   res.render('index', { req });
  // });


  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));
// csr
  server.get('/dashboard', function(req, res) {
    res.sendFile(join(distFolder,'index.html'));
  });

//   server.get('*', (req, res) => {
//     return res.sendFile(path.join(APP_CONFIG.client_root, './index.html'));
// });

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

function run(): void {
  const port = process.env.PORT || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
console.log(`HERE ${moduleFilename}`);
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

// module.exports = require('./src/main.server');
// export * from './src/main.server';
 export * from './src/main.server';
