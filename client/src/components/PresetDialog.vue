<template>
  <v-dialog :value="show" @input="$emit('update:show')" max-width="30%">
    <v-card>
      <v-card-title>{{mode}}</v-card-title>
      <v-card-text>
        <v-text-field outlined label="Name" v-model="name"></v-text-field>
        <v-textarea outlined label="Description" v-model="description"></v-textarea>
        <v-row align="center" no-gutters>
          <v-checkbox v-model="paperSpecific" hide-details class="shrink ml-2 mr-2 mt-0"></v-checkbox>
          <v-select
            :disabled="!paperSpecific"
            :label="`Paper Specific${paperSpecific?` - ${specifiedPaperId}`:''}`"
            :items="papers"
            item-text="name"
            item-value="id"
            v-model="specifiedPaperId"
            :menu-props="{ top: false, offsetY: true }"
            hide-details
            outlined
          ></v-select>
        </v-row>
        <v-row align="center" no-gutters class="mt-2">
          <v-checkbox
            v-model="questionSpecific"
            :disabled="!paperSpecific"
            hide-details
            class="shrink ml-2 mr-2 mt-0"
          ></v-checkbox>
          <v-select
            :disabled="!questionSpecific || !paperSpecific"
            :label="`Question Specific${questionSpecific?` - ${specifiedQuestionName}`:''}`"
            :items="availableQuestionNames"
            item-text="name"
            item-value="id"
            v-model="specifiedQuestionName"
            :menu-props="{ top: false, offsetY: true }"
            hide-details
            outlined
          ></v-select>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-row class="ml-1 mr-1">
          <v-btn text @click="submitPreset">Submit</v-btn>
          <v-spacer></v-spacer>
          <v-btn text @click="$emit('update:show', false)">Cancel</v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
export default {
  props: {
    show: Boolean,
    mode: String,
    papers: Array,
    presetId: String,

    preset: Object // Cannot directly mutate, also cannot be returned in Data as default values.
  },
  data() {
    return {
      // Serve the dialog only
      paperSpecific: false,
      specifiedPaperId: "",
      questionSpecific: false,
      specifiedQuestionName: "",
      name: "",
      description: "",

      // From API
      availableQuestionNames: []
    };
  },
  methods: {
    submitPreset() {
      var preset = {};
      preset.name = this.name;
      preset.description = this.description;
      if (this.paperSpecific) preset.paperId = this.specifiedPaperId;
      else preset.paperId = "";
      if (this.questionSpecific)
        preset.questionName = this.specifiedQuestionName;
      else preset.questionName = "";
      if (this.mode === "Edit") {
        axios
          .put(`http://localhost:3000/presets/${this.presetId}`, preset)
          .then(response => response.data)
          .then(updatedPreset => {
            this.$emit("update:show", false);
            this.$emit("presetUpdated", updatedPreset);
          });
      }
      if (this.mode === "Create") {
        axios
          .post(`http://localhost:3000/presets`, preset)
          .then(response => response.data)
          .then(newPreset => {
            this.$emit("update:show", false);
            this.$emit("presetCreated", newPreset);
          });
      }
    }
  },
  watch: {
    // Initialize values
    preset: function() {
      if (this.mode === "Edit") {
        this.paperSpecific = !(this.preset.paperId === "");
        this.specifiedPaperId = this.preset.paperId;
        this.questionSpecific = !(this.preset.questionName === "");
        this.specifiedQuestionName = this.preset.questionName;
        this.name = this.preset.name;
        this.description = this.preset.description;
      }
    },
    // Clear dialog UI
    show: function(val) {
      if (val === true && this.mode === "Create") {
        this.paperSpecific = false;
        this.specifiedPaperId = "";
        this.name = "";
        this.description = "";
      }
    },

    paperSpecific: function(val) {
      if (val == false) {
        this.specifiedPaperId = "";
      }
    },

    specifiedPaperId: function(val) {
      axios
        .get(`http://localhost:3000/papers/${val}`)
        .then(response => response.data)
        .then(data => {
          this.availableQuestionNames = [];
          for (let q of data.questions) {
            this.availableQuestionNames.push(q.name);
          }
        });
    }
  }
};
</script>