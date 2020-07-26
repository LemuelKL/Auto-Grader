<template>
  <div>
    <v-row no-gutters>
      <v-col cols="8" order="1">
        <v-card outlined class="ma-2">
          <tui-image-editor ref="tuiImageEditor" :include-ui="useDefaultUI" :options="options"></tui-image-editor>
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
import { ImageEditor } from "@toast-ui/vue-image-editor";
import "tui-color-picker/dist/tui-color-picker.css";
import "tui-image-editor/dist/tui-image-editor.css";
//import Pdf from "vue-pdf";
import { dragscroll } from "vue-dragscroll";
import PaperPanel from "./../components/Grade/PaperPanel";
import QuestionPanel from "./../components/Grade/QuestionPanel";
import GradingPanel from "./../components/Grade/GradingPanel";

export default {
  components: {
    "tui-image-editor": ImageEditor,
    //"pdf-viewer": Pdf,
    "paper-panel": PaperPanel,
    "question-panel": QuestionPanel,
    "grading-panel": GradingPanel,
  },
  directives: {
    dragscroll,
  },
  data() {
    var whiteTheme = {
      "common.bi.image": "",
      "common.bisize.width": "0px",
      "common.bisize.height": "0px",
      "header.backgroundColor": "transparent",
      "common.backgroundColor": "#EEEEEE",
      "submenu.backgroundColor": "#f5f5f5",

      "menu.normalIcon.color": "#434343",
      "menu.activeIcon.color": "#000000",
      "menu.disabledIcon.color": "#9E9E9E",
      "menu.hoverIcon.color": "#2196F3",

      "submenu.normalIcon.color": "#434343",
      "submenu.activeIcon.color": "#000000",
      "submenu.normalLabel.color": "#000000",
      "submenu.normalLabel.fontWeight": "regular",
      "submenu.activeLabel.color": "#000000",
      "submenu.activeLabel.fontWeight": "bold",

      // rango style
      "range.pointer.color": "#2196F3",
      "range.subbar.color": "#666",
      "range.bar.color": "#d1d1d1",

      "range.value.color": "#000000",
      "range.value.fontWeight": "lighter",
      "range.value.fontSize": "11px",
      "range.value.border": "1px solid #353535",
      "range.value.backgroundColor": "#f5f5f5",
      "range.title.color": "#000000",
      "range.title.fontWeight": "regular",

      // colorpicker style
      "colorpicker.button.border": "1px solid #1e1e1e",
      "colorpicker.title.color": "#000000",
    };
    return {
      // For vue-image-editor
      useDefaultUI: true,
      options: {
        // for tui-image-editor component's "options" prop
        usageStatistics: false,
        cssMaxWidth: 1000,
        cssMaxHeight: 1000,
        selectionStyle: {
          cornerStyle: 'circle',
          cornerSize: 10,
          cornerColor: '#000000',
          cornerStrokeColor: '#000000',
          transparentCorners: false,
          lineWidth: 1,
          borderColor: '#000000'
        },
        includeUI: {
          uiSize: {
            width: "auto",
            height: "550px",
          },
          menu: ["draw", "shape", "icon", "text"],
          loadImage: {
            path: "http://localhost:3000/graded/welcome.jpg",
            name: "welcome",
          },
          theme: whiteTheme,
          menuBarPosition: "right",
        },
      },

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
    questionRegion: function () {
      return this.questions.find((q) => q.name == this.questionName).pos;
    },
    imageUrl() {
      if (!this.paperId || !this.candidateId || !this.questionName) return "";
      return `http://localhost:3000/graded/${this.paperId}/${this.candidateId}/${this.questionName}.png`;
    },
  },
  watch: {
    questionName(val) {
      this.page = this.questions.find((q) => q.name == val).page;
    },
    imageUrl(val) {
      if (val != "") {
        this.$refs.tuiImageEditor.invoke(
          "loadImageFromURL",
          `${val}?t=${new Date().getTime()}`, // Add this query to force the browser to re-request and not re-use cache  
          `${this.candidateId} - ${this.questionName}`
        );
      }
    },
  },
};
</script>

<style lang='scss'>
.pdf-viewer-wrapper {
  overflow: hidden; // Very important
  background-color: bisque;
  cursor: grab;
}
.tui-image-editor-header {
  display: none;
}
.tui-image-editor-container .tui-image-editor-main {
  top: 0;
}
.tui-image-editor-container .tui-image-editor-controls {
  background-color: #f5f5f5;
}
.tui-image-editor-container .tui-image-editor-range-wrap label {
  color: #000000
}
</style>