import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

var Airtable = require('airtable');
var base = new Airtable({apiKey: 'patgJCZ5qwSrNhQVx.019ee74e26d6a503b62447d6ad1bd776f29b48a8b9454ea6b40f3a3fd9d98eb5'}).base('appRlVdCdquzazObm');
let arr = []
base('工作表1').select({
    // Selecting the first 3 records in Grid view:
    maxRecords: 100,
    view: "Grid view"
}).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.

    records.forEach(function (record) {
        if (record.get('tags') === '台湾问题') {
            arr.push(record.get('time') + ' ' + record.get('inEvents')|| '' + ' ' + record.get('outEvents') || '')
        }
    });
    console.log('arr', arr)
    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();

}, function done(err) {
    if (err) {
        console.error(err);
        return;
    }
});

Vue.config.productionTip = false

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')