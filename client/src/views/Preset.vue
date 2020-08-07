<template>
  <div>
    <v-card outlined class="ma-4">
      <preset-manager :papers="papers"></preset-manager>
    </v-card>
  </div>
</template>

<script>
import { axiosInstance } from './../api/api.js'
import PresetManager from "./../components/PresetManager";
export default {
  components: {
    'preset-manager': PresetManager
  },
  data() {
    return {
      papers: []
    };
  },
  created() {
    axiosInstance
      .get("/papers")
      .then(response => response.data)
      .then(data => {
        this.papers = data;
      });
  }
};
</script>