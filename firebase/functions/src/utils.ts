import { initializeApp, getApps } from "firebase-admin/app";

export function getApp() {
  const apps = getApps();
  let app;
  if (apps.length === 0) {
    app = initializeApp();
  } else {
    app = apps[0];
  }
  return app;
}
