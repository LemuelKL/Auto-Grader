<template>
  <v-app dark>
    <v-app-bar
      app
      dense
    >
      <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
      <v-toolbar-title>Auto Grader</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary
      app
    >
      <v-list
        nav
      >
        <v-list-item to="/Home">
          <v-list-item-icon>
            <v-icon>mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>

        <v-list-item to="/Paper">
          <v-list-item-icon>
            <v-icon>mdi-file-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Paper</v-list-item-title>
        </v-list-item>

        <v-list-item to="/Preset">
          <v-list-item-icon>
            <v-icon>mdi-database</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Preset</v-list-item-title>
        </v-list-item>


        <v-list-item to="/Grade">
          <v-list-item-icon>
            <v-icon>mdi-square-edit-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Grade</v-list-item-title>
        </v-list-item>

        <v-list-item to="/Report">
          <v-list-item-icon>
            <v-icon>mdi-microsoft-excel</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Report</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>
    
  </v-app>
</template>

<script>
  export default {
    data () {
      return {
        drawer: false,
      }
    }
  }
</script>