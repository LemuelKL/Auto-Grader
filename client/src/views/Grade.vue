<template>
  <div>
    <v-container>
      <v-row>
        <v-progress-linear :value="page/numPages*100"></v-progress-linear>
        <v-card tile width="100%">
          <v-row no-gutters>
            <v-col cols="4" order="2">
              <v-card outlined class="ma-2">
                <v-card-title>Paper Info</v-card-title>
                <v-row no-gutters align="center">
                  <v-combobox
                    v-model="selectedPaper"
                    hide-details
                    outlined
                    :items="ungradedPapers"
                    item-value="id"
                    item-text="name"
                    class="ma-2"
                  ></v-combobox>
                </v-row>

                <v-row no-gutters align="start">
                  <v-col cols="12">
                    <v-card outlined class="ma-2">
                      <v-card-subtitle class="pl-2 pt-2 pr-2 pb-0">ID: {{ selectedPaper.id }}</v-card-subtitle>
                      <v-card-subtitle
                        class="pl-2 pt-2 pr-2 pb-0"
                      >Students: {{ paperInfo.candidates.length }}</v-card-subtitle>
                      <v-card-subtitle class="pl-2 pt-2 pr-2 pb-0">Pages: {{ paperInfo.numPages }}</v-card-subtitle>
                      <v-card-subtitle
                        class="pl-2 pt-2 pr-2 pb-2"
                      >Questions: {{ paperInfo.questions.length }}</v-card-subtitle>
                      <v-card-actions>
                        <v-row no-gutters align="center">
                          <v-btn class="ma-2" @click="previousPage()">
                            <v-icon>mdi-arrow-left-thick</v-icon>
                          </v-btn>
                          <v-card outlined width="64" height="36">
                            <v-card-title class="pa-0 justify-center">{{page}}</v-card-title>
                          </v-card>
                          <v-btn class="ma-2" @click="nextPage()">
                            <v-icon>mdi-arrow-right-thick</v-icon>
                          </v-btn>
                        </v-row>
                        <v-row no-gutters align="center">
                          <v-btn class="ma-2" @click="zoomIn()" v-hotkey="{'+': this.zoomIn}">
                            <v-icon>mdi-magnify-plus</v-icon>
                          </v-btn>
                          <v-card outlined width="64" height="36">
                            <v-card-title class="pa-0 justify-center">{{`${zoom}%`}}</v-card-title>
                          </v-card>
                          <v-btn class="ma-2" @click="zoomOut()" v-hotkey="{'-': this.zoomOut}">
                            <v-icon>mdi-magnify-minus</v-icon>
                          </v-btn>
                        </v-row>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>

              <v-card outlined class="ma-2">
                <v-card-title>Grader</v-card-title>

                <v-row no-gutters class="ma-2">
                  <v-col cols="6">
                    <v-chip
                      class="ml-1 mt-1"
                      v-for="(q, i) in paperInfo.questions"
                      :key="i"
                      :color="i == questionIndex ? 'yellow' : ''"
                    >{{ q.name }}</v-chip>
                  </v-col>
                  <v-col cols="6">
                    <v-combobox
                      v-model="selectedStudent"
                      hide-details
                      outlined
                      :items="ungradedStudents"
                      item-value="pyccode"
                      item-text="ename"
                      class="ma-2"
                    ></v-combobox>
                  </v-col>
                </v-row>

                <v-row no-gutters>
                  <v-col cols="6">
                    <v-card outlined class="ma-2">
                      <v-card-title>{{paperInfo.questions[questionIndex].name}}</v-card-title>
                      <v-card-subtitle>Max Score: {{currentQuestionScore}}</v-card-subtitle>
                      <v-card-actions>
                        <v-row no-gutters align="center">
                          <v-btn class="ma-2" @click="previousQuestion()">
                            <v-icon>mdi-arrow-left</v-icon>
                          </v-btn>
                          <v-btn class="ma-2" @click="nextQuestion()">
                            <v-icon>mdi-arrow-right</v-icon>
                          </v-btn>
                        </v-row>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                  <v-col cols="6" order="2">
                    <v-card outlined class="ma-2">
                      <v-card-title>{{selectedStudent.cname}} {{selectedStudent.class}} ({{selectedStudent.classNo}}) {{selectedStudent.pyccode}}</v-card-title>
                      <v-card-subtitle>Score: {{displayScore}}</v-card-subtitle>
                      <v-card-actions>
                        <v-row no-gutters align="center">
                          <v-btn
                            class="ma-2"
                            @click="previousStudent()"
                            v-hotkey="{'left': this.previousStudent}"
                          >
                            <v-icon>mdi-arrow-left</v-icon>
                          </v-btn>
                          <v-btn
                            class="ma-2"
                            @click="nextStudent()"
                            v-hotkey="{'right': this.nextStudent}"
                          >
                            <v-icon>mdi-arrow-right</v-icon>
                          </v-btn>
                        </v-row>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
            <v-col cols="8" order="1">
              <v-card outlined class="ma-2">
                <div
                  class="pdf-viewer-wrapper"
                  v-dragscroll="true"
                  v-autoscroll:arg="{ x: currentQuestionPos.sx*zoom/100, y: currentQuestionPos.sy*zoom/100, type: 'absolute'}"
                  :style="`max-height: ${currentQuestionPos.sheight*zoom/100}px;`"
                >
                  <pdf-viewer
                    :src="pdfUrl"
                    @num-pages="numPages = $event"
                    :page="page"
                    :style="`width: ${paperInfo.width*zoom/100}px; margin: auto`"
                  ></pdf-viewer>
                </div>
              </v-card>
              <v-card outlined class="ma-2">
                <v-card-title>Actions</v-card-title>
                <v-card-subtitle>Give a score: {{givenScore}}</v-card-subtitle>
                <v-card-text>
                  <v-chip-group
                    v-model="givenScoreOnes"
                    active-class="deep-purple--text text--accent-4"
                    mandatory
                  >
                    <v-chip v-for="score in scoresToChoose" :key="score" :value="score">{{ score }}</v-chip>
                  </v-chip-group>
                  <v-chip-group
                    v-model="givenScoreTenths"
                    active-class="deep-purple--text text--accent-4"
                    mandatory
                  >
                    <v-chip v-for="score in decimalChips" :key="score" :value="score">{{ score }}</v-chip>
                  </v-chip-group>
                </v-card-text>
                <v-card-actions>
                  <v-btn @click="submitGrading">
                    {{graded?'Update Grading':'Submit Grading'}}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import Pdf from "vue-pdf";
import { dragscroll } from "vue-dragscroll";
import axios from "axios";

export default {
  components: {
    "pdf-viewer": Pdf
  },
  directives: {
    dragscroll
  },
  data() {
    return {
      page: 1,
      numPages: null,
      zoom: 100,

      pdfDir: "",

      ungradedStudents: [],
      selectedStudent: "",

      ungradedPapers: [], // Array of paperInfo
      selectedPaper: "",

      // The document received from MongoDB
      // Dummy keys here so that Vue would render
      paperInfo: {
        candidates: [],
        numPages: 0,
        questions: [
          { name: "?", pos: { sx: 0, sy: 0, swidth: 0, sheight: 400 } }
        ],
        width: 0,
        height: 0
      }, // Be fetched and overwritten each time selectedPaper changes

      questionIndex: 0,

      grading: { candidate: "", score: 0 }, // From API
      graded: false,
      givenScoreOnes: 0,
      givenScoreTenths: 0,

    };
  },

  methods: {
    previousPage() {
      if (this.page > 1) this.page = this.page - 1;
    },
    nextPage() {
      if (this.page < this.numPages) this.page = this.page + 1;
    },

    zoomIn() {
      if (this.zoom < 250) this.zoom = this.zoom + 10;
    },
    zoomOut() {
      if (this.zoom > 10) this.zoom = this.zoom - 10;
    },

    previousQuestion() {
      if (this.questionIndex > 0) this.questionIndex--;
    },
    nextQuestion() {
      if (this.questionIndex < this.paperInfo.questions.length - 1)
        this.questionIndex++;
    },

    previousStudent() {
      if (this.studentIndex > 0) {
        this.selectedStudent = this.ungradedStudents[this.studentIndex - 1];
      }
    },
    nextStudent() {
      if (this.studentIndex < this.numStudents - 1) {
        this.selectedStudent = this.ungradedStudents[this.studentIndex + 1];
      }
    },

    fetchGrading() {
      axios
        .get(
          `http://localhost:3000/gradings/${this.selectedPaper.id}/${this.currentQuestoinName}/${this.selectedStudent.pyccode}`
        )
        .then(response => response.data)
        .then(data => {
          if (data != null) {
            this.grading = data;
            this.graded = true

            // Such a crappy code but hey it works
            var decPart = '0.' + (data.score+"").split(".")[1];
            var intPart = (data.score+"").split(".")[0];
            this.givenScoreTenths = parseFloat(decPart)
            this.givenScoreOnes = parseInt(intPart)
          }
          else {
            this.grading = { candidate: "", score: 0 };
            this.graded = false
          }
        });
    },
    submitGrading() {
      const grading = {
        paperId: this.selectedPaper.id,
        questionName: this.currentQuestoinName,
        candidate: this.selectedStudent.pyccode,
        score: this.givenScore,
        presetRemark: '',
        customRemark: ''
      }
      axios.post('http://localhost:3000/gradings', grading)
    }
  },

  computed: {
    pdfUrl: function() {
      if (this.pdfDir == "" || this.selectedStudent == "")
        return "http://localhost:3000/welcome.pdf";
      else return `${this.pdfDir}/${this.selectedStudent.pyccode}.pdf`;
    },
    // This is such a crude implementation, I hope Vue's gonna optimize this for me
    studentIndex: function() {
      return this.ungradedStudents.findIndex(
        s => s.pyccode === this.selectedStudent.pyccode
      );
    },
    numStudents: function() {
      return this.ungradedStudents.length;
    },
    currentQuestionPos: function() {
      return this.paperInfo.questions[this.questionIndex].pos;
    },
    currentQuestionScore: function() {
      return this.paperInfo.questions[this.questionIndex].score;
    },
    currentQuestoinName: function() {
      return this.paperInfo.questions[this.questionIndex].name;
    },
    scoresToChoose: function() {
      if (this.currentQuestionScore != undefined) {
        return [...Array(parseInt(this.currentQuestionScore) + 1).keys()];
      } else return [...Array(1).keys()];
    },

    displayScore: function() {
      if (this.grading.candidate == this.selectedStudent.pyccode)
        return this.grading.score;
      else return "?"; // Maybe sth will go out of sync?
    },
    givenScore: function () {
      return this.givenScoreOnes + this.givenScoreTenths
    },
    decimalChips: function () {
      if (this.givenScoreOnes == this.currentQuestionScore)
        return [0]
      else return [0, 0.5]
    }
  },

  watch: {
    selectedPaper: function() {
      this.pdfDir = `http://localhost:3000/ungraded/${this.selectedPaper.id}`;

      axios
        .get(`http://localhost:3000/papers/${this.selectedPaper.id}`)
        .then(response => response.data)
        .then(data => {
          this.paperInfo = data;
        });

      axios
        .get(
          `http://localhost:3000/papers/ungraded/${this.selectedPaper.id}/students`
        )
        .then(response => response.data)
        .then(data => {
          var students = data;
          for (let student of students) {
            axios
              .get(`http://localhost:3000/students/${student}`)
              .then(response => response.data)
              .then(data => {
                this.ungradedStudents.push(data);
              });
          }
        });
    },

    questionIndex: function() {
      const question = this.paperInfo.questions.find(
        q => q.name == this.paperInfo.questions[this.questionIndex].name
      );
      const pageToGoTo = question.page;
      this.page = pageToGoTo;
      
      this.fetchGrading()
    },

    selectedStudent: function () {
      this.fetchGrading()
    }
  },

  created() {
    axios
      .get("http://localhost:3000/papers/ungraded")
      .then(response => response.data)
      .then(data => {
        for (let d of data) {
          axios
            .get(`http://localhost:3000/papers/${d}`)
            .then(response => response.data)
            .then(data => {
              this.ungradedPapers.push(data);
            });
        }
      });
  }
};
</script>

<style lang='scss'>
.pdf-viewer-wrapper {
  overflow: hidden; // Very important
  background-color: bisque;
  cursor: grab;
}
</style>