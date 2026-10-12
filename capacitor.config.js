// Capacitor: bungkus web live jadi APK. Isi tetap web (JS), DB tetap 1 Supabase.
const config = {
  appId: 'id.kerjainc.app',
  appName: 'kerja.inc',
  webDir: 'capacitor-www',
  server: { url: 'https://kerja-inc.vercel.app', cleartext: false },
};
module.exports = config;
