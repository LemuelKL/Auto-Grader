<template>
  <v-card outlined class="ma-2">
    <v-card-title>Result</v-card-title>

    <v-card-text>
      <div>Candidate: {{candidateId}}</div>
      <div>Paper: {{paperId}}</div>

      <div v-if="!!paperId && !!candidateId">
        <v-row no-gutters v-for="grading in gradings" :key="grading.questionName" justify="center">
          <question-card
            :imgUrl="`http://localhost:3000/graded/${paperId}/${candidateId}/${grading.questionName}.png`"
            :paperId="paperId"
            :candidateId="candidateId"
            :gradingId="grading._id"
            :questionName="grading.questionName"
            :questionMaxScore="questionScores[grading.questionName]"
            :score="grading.score"
            :comment="grading.customRemark"
          ></question-card>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";
import _ from "lodash";
import QuestionCard from "./../components/Result/QuestionCard";
export default {
  components: {
    "question-card": QuestionCard,
  },
  props: {
    paperId: String,
    questionName: String,
    candidateId: String,
  },

  data() {
    return {
      mode: undefined,
      gradings: [],
      questionScores: {},
    };
  },
  watch: {
    gradings() {
      axios
        .get(`http://localhost:3000/papers/${this.paperId}`)
        .then((res) => res.data)
        .then((data) => {
          data.questions.forEach((q) => {
            this.$set(this.questionScores, q.name, q.score);
          });
        });
    },
  },

  created() {
    if (this.questionName == undefined) {
      this.mode = "ALL_QUESTIONS";
      axios
        .get(
          `http://localhost:3000/gradings/${this.paperId}/*/${this.candidateId}`
        )
        .then((res) => res.data)
        .then((data) => {
          this.gradings = _.cloneDeep(data);
        })
        .catch((err) => {
          return console.error(err);
        });
    } else {
      this.mode = "SPECIFIC_QUESTION";
      axios
        .get(
          `http://localhost:3000/gradings/${this.paperId}/${this.questionName}/${this.candidateId}`
        )
        .then((res) => res.data)
        .then((data) => {
          this.gradings = _.cloneDeep(data);
        })
        .catch((err) => {
          return console.error(err);
        });
    }
  },
};
</script>