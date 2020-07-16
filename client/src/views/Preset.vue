<template>
  <div>
    <v-card outlined class="ma-4">
      <v-card-title>Remark Presets Panel</v-card-title>
      <v-card-text>
        <v-card outlined class="ma-4">
          <v-card-title>Manange Existing Remarks</v-card-title>
          <v-card-text>
            <PresetManager ref="PresetManager" :papers="papers"></PresetManager>
          </v-card-text>
        </v-card>
        <v-card outlined class="ma-4">
          <v-card-title>Create New Remarks</v-card-title>
          <v-card-text>
            <v-text-field outlined label="Name" v-model="presetName"></v-text-field>
            <v-text-field outlined label="Description" v-model="presetDescription"></v-text-field>
            <v-row align="center" no-gutters>
              <v-checkbox v-model="paperSpecific" hide-details class="shrink mr-2 mt-0"></v-checkbox>
              <v-combobox
                :disabled="!paperSpecific"
                :label="`Paper Specific${paperSpecific?` - ${selectedPaper.id}`:''}`"
                :items="papers"
                item-text="name"
                item-value="id"
                v-model="selectedPaper"
              ></v-combobox>
            </v-row>
            <v-btn @click="submitPreset">Create</v-btn>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";
import PresetManager from './../components/PresetManager'
export default {
  components: {
    PresetManager
  },
  data() {
    return {
      paperSpecific: false,
      papers: [],
      selectedPaper: {},

      presetName: "",
      presetDescription: "",

      presets: []
    };
  },
  methods: {
    fetchPresets() {
      axios
        .get("http://localhost:3000/presets")
        .then(response => response.data)
        .then(data => {
          this.presets = data;
        });
    },
    submitPreset() {
      var data = {
        paperId: this.paperSpecific ? this.selectedPaper.id : "",
        presetName: this.presetName,
        presetDescription: this.presetDescription
      };
      axios.post("http://localhost:3000/presets", data).then(response => response.data).then(data => {
        data
        this.$refs.PresetManager.fetchRemarks()
      }).catch(err => {
        err
        this.$refs.PresetManager.fetchRemarks()
      });
    }
  },
  created() {
    axios
      .get("http://localhost:3000/papers")
      .then(response => response.data)
      .then(data => {
        this.papers = data;
      });
  }
};
</script>