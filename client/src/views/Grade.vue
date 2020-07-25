<template>
  <div>
    <v-row no-gutters>
      <v-col cols="8" order="1">
        <v-card outlined class="ma-2">
          <div
            class="pdf-viewer-wrapper"
            v-dragscroll="true"
            v-autoscroll:arg="{ x: questionRegion.sx * zoom / 100, y: questionRegion.sy * zoom / 100, type: 'absolute'}"
            :style="`max-height: ${ questionRegion.sheight * zoom / 100 }px;`"
          >
            <pdf-viewer
              :src="pdfUrl"
              :page="page"
              :style="`width: ${width*zoom/100}px; margin: auto`"
            ></pdf-viewer>
          </div>
        </v-card>
        <grading-panel
          v-show="!!paperId"
          :candidates="candidates"
          @candidate-updated="candidateId = $event.pyccode"
          :paperId="paperId"
          :questionName="questionName"
          :questionScore="questionScore"
          ref="gp"
          class="ma-2"
        ></grading-panel>
      </v-col>

      <v-col cols="4" order="2">
        <paper-panel
          :page.sync="page"
          :zoom.sync="zoom"
          @paperChanged="paperId = $event"
          @updatePaperWidth="width = $event"
          @updateCandidates="Object.assign(candidates, $event); $refs.gp.updateCandidate()"
          @questionsArrived="Object.assign(questions, $event); $refs.qp.updateQuestion()"
          class="ma-2"
        ></paper-panel>

        <question-panel
          v-show="!!paperId"
          :questions="questions"
          @questionChanged="questionName = $event.name; questionScore = $event.score"
          ref="qp"
          class="ma-2"
        ></question-panel>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Pdf from "vue-pdf";
import { dragscroll } from "vue-dragscroll";
import PaperPanel from "./../components/Grade/PaperPanel";
import QuestionPanel from "./../components/Grade/QuestionPanel";
import GradingPanel from "./../components/Grade/GradingPanel";

export default {
  components: {
    "pdf-viewer": Pdf,
    "paper-panel": PaperPanel,
    "question-panel": QuestionPanel,
    "grading-panel": GradingPanel,
  },
  directives: {
    dragscroll,
  },
  data() {
    return {
      // For pdf-viewer
      page: 1,
      zoom: 100,
      width: 595,

      paperId: "",
      candidateId: "",
      questionName: "",
      questionScore: 0,

      candidates: [
        {
          pyccode: "",
          cname: "",
          ename: "",
          class: "",
          classNo: "",
        },
      ],

      questions: [
        {
          name: "",
          score: 0,
          pos: { sx: "0", sy: "0", sheight: "842" },
        },
      ],
    };
  },
  computed: {
    pdfUrl: function () {
      if (this.candidateId == "")
        return "http://localhost:3000/welcome.pdf";
      else
        return `http://localhost:3000/ungraded/${this.paperId}/${this.candidateId}.pdf`;
    },
    questionRegion: function () {
      return this.questions.find((q) => q.name == this.questionName).pos;
    },
  },
  watch: {
    questionName (val) {
      this.page = this.questions.find(q => q.name == val).page
    }
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