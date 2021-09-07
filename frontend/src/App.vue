<template>
<div id="app">
  <Header></Header>
  <router-view></router-view>
  
  <Footer></Footer>
</div>
</template>

<script>
import Footer from './components/Footer'
import Header from './components/Header'
export default {
  name: 'App',
  components: {
        Header,
        Footer
    }
};
</script>
