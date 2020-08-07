<template>
  <v-row no-gutters justify="center" class="ma-2" id="main">
    <v-card outlined color="#385F73">
      <v-card-text>
        <div v-if="!!paperId && !!candidateId">
          <v-row no-gutters v-for="grading in gradings" :key="grading.questionName" >
            <question-card
              :imgUrl="`/graded/${paperId}/${candidateId}/${grading.questionName}.png`"
              :paperId="paperId"
              :candidateId="candidateId"
              :gradingId="grading._id"
              :questionName="grading.questionName"
              :questionMaxScore="questionScores[grading.questionName]"
              :score="grading.score"
              :comment="grading.customRemark"
              class="mb-1"
              v-if="questionPages[grading.questionName] == page"
            ></question-card>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
    <div class="mx-1 mt-4">
      <v-btn small elevation="0" @click="minusPage">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <span class="mx-2">p.{{page}}</span>
      <v-btn small elevation="0" @click="plusPage">
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>
    </div>
  </v-row>
</template>

<script>
import { axiosInstance } from './../api/api.js'
import _ from "lodash";
import QuestionCard from "./../components/Result/QuestionCard";
export default {
  components: {
    "question-card": QuestionCard,
  },
  props: {
    paperId: String,
    candidateId: String,
  },

  data() {
    return {
      mode: undefined,
      gradings: [],
      questionScores: {},
      questionPages: {},
      numPages: undefined,
      page: 1,
    };
  },
  watch: {
    gradings() {
      axiosInstance
        .get(`/papers/${this.paperId}`)
        .then((res) => res.data)
        .then((data) => {
          this.numPages = data.numPages;
          data.questions.forEach((q) => {
            this.$set(this.questionScores, q.name, q.score);
            this.$set(this.questionPages, q.name, q.page);
          });
        });
    },
  },
  methods: {
    minusPage() {
      if (this.page > 1) this.page -= 1
    },
    plusPage() {
      if (this.page < this.numPages) this.page += 1
    }
  },

  created() {
    axiosInstance
      .get(
        `/gradings/${this.paperId}/*/${this.candidateId}`
      )
      .then((res) => res.data)
      .then((data) => {
        this.gradings = _.cloneDeep(data);
      })
      .catch((err) => {
        return console.error(err);
      });
  },
};
</script>
<style scoped>
#main {
  background-color: #388397;
}
</style>