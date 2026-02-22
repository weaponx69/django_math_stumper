// app.app-def.tsx

import defineRemixApp from '@wixc3/define-remix-app';  
export default defineRemixApp({
  appPath: './app', // the root directory of the routes
  routingPattern: 'folder(route)', // see the section below
});
