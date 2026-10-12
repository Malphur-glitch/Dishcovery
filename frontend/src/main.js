import { createApp } from 'vue';
// Only Bootstrap grid and utilities: excludes reboot, buttons and modal styles.
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import 'bootstrap/dist/css/bootstrap-utilities.min.css';
// Original common stylesheet first; page sheets are loaded by the router.
import './assets/css/style.css';
import './assets/css/compatibility.css';
import App from './App.vue';
import router from './router/index.js';
createApp(App).use(router).mount('#app');
