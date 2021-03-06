import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import App from './App.vue';
import router from './router';
import store from './store';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import registerGlobalComponents from './components/_globals/index.js';

Vue.config.productionTip = false;

Vue.use(BootstrapVue);
registerGlobalComponents(Vue);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
