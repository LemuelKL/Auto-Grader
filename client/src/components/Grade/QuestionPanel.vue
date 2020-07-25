<template>
  <v-card outlined>
    <v-card-title>Questions</v-card-title>
    <v-card-text>
      <v-row no-gutters class="my-2">
        <v-chip-group
          :value="questionIndex"
          @change="questionIndex = $event"
          active-class="primary"
          mandatory
        >
          <v-chip
            class="ml-1 mt-1"
            v-for="(q, i) in questions"
            :key="i"
          >{{ q.name }}</v-chip>
        </v-chip-group>
      </v-row>

      <v-row no-gutters>
        <div class="font-weight-bold">Score: {{question.score}}</div>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-row no-gutters align="center">
        <v-btn elevation="0" class="ma-2" @click="previousQuestion()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-btn elevation="0" class="ma-2" @click="nextQuestion()">
          <v-icon>mdi-arrow-right</v-icon>
        </v-btn>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    questions: Array,
  },

  data() {
    return {
      questionIndex: 0,
      question: { name: "", score: "" },
    };
  },

  methods: {
    previousQuestion() {
      if (this.questionIndex > 0) {
        this.questionIndex--;
      }
    },
    nextQuestion() {
      if (this.questionIndex < this.questions.length - 1) {
        this.questionIndex++;
      }
    },

    updateQuestion() {
      this.question = this.questions[this.questionIndex];
      this.$emit("questionChanged", this.question);
    },
  },

  watch: {
    questionIndex() {
      this.updateQuestion();
    },
  },
};
</script>