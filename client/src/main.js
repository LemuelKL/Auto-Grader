import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router'
import VueHotkey from 'v-hotkey'
import Autoscroll from 'vue-autoscroll'
import VueScrollTo from 'vue-scrollto'
 
Vue.use(VueScrollTo)

Vue.use(Autoscroll)

Vue.use(VueHotkey, {
  '+': 107,
  '-': 109
})

import VuejsClipper from 'vuejs-clipper'
Vue.use(VuejsClipper, {
  components: {
    clipperBasic: true,
    clipperPreview: true
  }
})

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
