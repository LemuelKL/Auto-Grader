<template>
  <v-dialog :value="show" @input="$emit('update:show', false)" max-width="290">
    <v-card>
      <v-card-title>New Question</v-card-title>
      <v-card-text class="pb-0">
        <v-form v-model="valid" ref="form">
          <v-text-field
            dense
            outlined
            label="Name"
            v-model="name"
            :rules="[rules.required, rules.uniqueName]"
          ></v-text-field>
          <v-text-field
            dense
            outlined
            label="Score"
            v-model="score"
            :rules="[rules.required, rules.scoreType]"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-row no-gutters class="ml-3 mr-3">
          <v-btn text @click="addQuestion">Add</v-btn>
          <v-spacer></v-spacer>
          <v-btn text @click="cancel">Cancel</v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    show: Boolean,
    existingQuestions: Array
  },

  methods: {
    cancel() {
      this.$emit("update:show", false);
    },
    addQuestion() {
      this.$refs.form.validate();
      if (this.valid) {
        this.$emit("questionAdded", this.name, this.score);
        this.$emit("update:show", false);
      }
    }
  },

  data() {
    return {
      name: "",
      score: null,

      valid: false,
      rules: {
        required: value => !!value || "Required.",
        uniqueName: name =>
          !this.existingQuestions.find(eQ => eQ.name === name) ||
          "Already exists.",
        scoreType: score => {
          var c1 = /^\d*\.?((5)|(0))?$/;
          var c2 = /^([1-9]{0,1})([0-9]{1})(\.[0-9])?$/;
          if (score.match(c1) && score.match(c2)) return true;
          return "Invalid.";
        }
      }
    };
  },

  watch: {
    show: function(val) {
      if (val === false) {
        this.$refs.form.reset();
      }
    }
  }
};
</script>