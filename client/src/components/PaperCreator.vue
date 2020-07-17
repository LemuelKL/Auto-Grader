<template>
  <div>
    <v-card outlined class="pa-3 mt-3">
      <v-card-title>Create a New Paper</v-card-title>
      <v-card-text>
        <v-row no-gutters>
          <v-file-input
            outlined
            v-model="template"
            accept=".pdf"
            type="file"
            label="Paper Template"
          ></v-file-input>
        </v-row>

        <v-row no-gutters>
          <candidate-register @candidatesChanged="updateCandidates"></candidate-register>
        </v-row>

        <v-row no-gutters>
          <question-register
            :src="imageSrc"
            :page="page"
            :numPages="numPages"
            :imgW="imgW"
            :imgH="imgH"
            @requestPage="handlePageChangeRequest"
            :questions.sync="questions"
          ></question-register>
        </v-row>

        <v-row no-gutters class="mt-5">
          <v-btn
            @click="submitPaper"
            :disabled="!this.template || awaitingNumPagesResult"
          >Create Paper</v-btn>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import axios from "axios";
import QuestoniRegister from "./QuestionRegister";
import CandidateRegister from "./CandidateRegister";
export default {
  components: {
    "question-register": QuestoniRegister,
    "candidate-register": CandidateRegister
  },
  data() {
    return {
      template: null,
      numPages: 0,
      page: 1,
      imgsDir: "",
      imgW: 0,
      imgH: 0,
      questions: [], // Array of objects, see newQuestion() in child
      candidates: [], // List of pyccodes supplied by child CandidateRegister

      awaitingNumPagesResult: false
    };
  },
  methods: {
    submitPaper() {
      const formData = new FormData();
      formData.append("template", this.template);
      formData.append(
        "candidates",
        JSON.stringify(this.candidates)
      );
      formData.append("questions", JSON.stringify(this.questions));

      axios
        .post("http://localhost:3000/papers", formData)
        .then(res => {
          this.responseData = res.data;
        })
        .catch(err => {
          this.responseData = err;
        });
    },
    handlePageChangeRequest(mode) {
      if (mode == "+") {
        if (this.page < this.numPages) {
          this.page++;
        }
      }
      if (mode == "-") {
        if (this.page > 1) {
          this.page--;
        }
      }
      if (mode >= 1 && mode < this.numPages) this.page = mode;
    },
    updateCandidates(candidates) {
      this.candidates = []
      candidates.forEach(c => {
        this.candidates.push(c.pyccode)
      });
    }
  },
  watch: {
    template: async function() {
      this.awaitingNumPagesResult = true;
      this.maxScores = [];
      const formData = new FormData();
      formData.append("pdf", this.template);
      axios
        .post("http://localhost:3000/pdf", formData)
        .then(response => response.data)
        .then(data => {
          console.log(data);
          this.numPages = data.numPages;
          this.awaitingNumPagesResult = false;
          this.imgsDir = data.imgsPath;
          this.page = 1;
          this.imgW = data.width;
          this.imgH = data.height;
        });
    }
  },
  computed: {
    imageSrc: function() {
      if (this.imgsDir == "") return "";
      return this.imgsDir + `/${this.page}.png`;
    },
    numQuestions: function() {
      return this.questions.length;
    }
  }
};
</script>
