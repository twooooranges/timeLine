<template>
  <div class="about">
    <h1>This is an More page</h1>
    <ul>
      <li v-for="item in navList" :key="item.path">
        <router-link :to="item.path">{{ item.name }}</router-link>
      </li>
    </ul>
    <router-view/>
  </div>
</template>

<script>
export default {
  data() {
    return {
      navList: [{
        name: '地图',
        path: '/more/map'
      }]
    }
  }
}
</script>
