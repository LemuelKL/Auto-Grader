<template>
  <div>
    <v-row no-gutters>
      <v-col cols="8" order="1">
        <v-card outlined class="ma-2">
          <tui-image-editor
            ref="tuiImageEditor"
            :include-ui="useDefaultUI"
            :options="options"
            v-dragscroll="{ target: '.tui-image-editor-wrap'}"
          ></tui-image-editor>
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
          :page="page"
          :zoom="zoom"
          :panMode="panMode"
          @pan-mode-updated="updatePanMode"
          @requestZoomIn="setZoom('in')"
          @requestZoomOut="setZoom('out')"
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
import { dragscroll } from "vue-dragscroll";
import PaperPanel from "./../components/Grade/PaperPanel";
import QuestionPanel from "./../components/Grade/QuestionPanel";
import GradingPanel from "./../components/Grade/GradingPanel";
import $ from "jquery";

export default {
  components: {
    "tui-image-editor": ImageEditor,
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
      // menu
      "menu.normalIcon.color": "#434343",
      "menu.activeIcon.color": "#000000",
      "menu.disabledIcon.color": "#9E9E9E",
      "menu.hoverIcon.color": "#2196F3",
      // submenu
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
        usageStatistics: false,
        cssMaxWidth: 1000,
        cssMaxHeight: 1000,
        selectionStyle: {
          cornerStyle: "circle",
          cornerSize: 10,
          cornerColor: "#000000",
          cornerStrokeColor: "#000000",
          transparentCorners: false,
          lineWidth: 1,
          borderColor: "#000000",
        },
        includeUI: {
          uiSize: {
            width: "auto",
            height: "550px",
          },
          menu: ["draw", "shape", "icon", "text"],
          loadImage: {
            path: `${process.env.VUE_APP_ROOT_API}/graded/welcome.jpg`,
            name: "welcome",
          },
          theme: whiteTheme,
          menuBarPosition: "right",
        },
      },

      page: 1,
      zoom: 100,
      panMode: undefined,

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
        },
      ],
    };
  },
  computed: {
    imageUrl() {
      if (!this.paperId || !this.candidateId || !this.questionName) return "";
      return `${process.env.VUE_APP_ROOT_API}/graded/${this.paperId}/${this.candidateId}/${this.questionName}.png`;
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
        this.zoom = 100;
        $(".tui-image-editor").removeAttr("data-min-width");
        $(".tui-image-editor").removeAttr("data-min-height");
      }
    },
    panMode(val) {
      console.log("Pan Mode: ", val);
      if (val) {
        this.$refs.tuiImageEditor.invoke("changeCursor", "grab");
        $(".tui-image-editor-wrap").css("width", "100%");
        $(".tui-image-editor-wrap").css("height", "100%");
      }
      if (!val) {
        this.$refs.tuiImageEditor.invoke("changeCursor", "crosshair");
        const width = $(".tui-image-editor-size-wrap").width();
        const height = $(".tui-image-editor-size-wrap").height();
        console.log(width, height);
        $(".tui-image-editor-wrap").css("width", width);
        $(".tui-image-editor-wrap").css("height", height);
      }
      this.$forceUpdate();
    },
  },
  methods: {
    updatePanMode(val) {
      this.panMode = !!val;
    },
    setZoom(mode) {
      const canvas = document.querySelector(
        ".tui-image-editor-canvas-container"
      );
      var imageOriginalSize = {
        width: canvas.style.maxWidth,
        height: canvas.style.maxHeight,
      };
      var newWidth;
      var newHeight;
      const editor = document.querySelector(".tui-image-editor");
      console.log("Set Zoom via Button");
      if (mode == "in") {
        newWidth = parseInt(editor.style.width, 10) * 1.1;
        newHeight = parseInt(editor.style.height, 10) * 1.1;
        // Limit maximum zoom by image resolution
        if (
          newWidth > imageOriginalSize.width ||
          newHeight > imageOriginalSize.height ||
          this.zoom >= 300
        ) {
          newWidth = imageOriginalSize.width;
          newHeight = imageOriginalSize.height;
        } else {
          this.zoom += 10;
        }
      } else {
        newWidth = parseInt(editor.style.width, 10) * 0.9;
        newHeight = parseInt(editor.style.height, 10) * 0.9;
        this.zoom -= 10;
        // Limit minimum zoom by 0.5 of original container size
        if (
          parseInt(editor.dataset.minWidth, 10) * 0.5 >
          parseInt(newWidth, 10)
        ) {
          newWidth = parseInt(editor.dataset.minWidth, 10) * 0.5;
          newHeight = parseInt(editor.dataset.minHeight, 10) * 0.5;
          this.zoom = 50;
        }
      }
      editor.style.width = newWidth + "px";
      editor.style.height = newHeight + "px";

      $(editor)
        .find("canvas, .tui-image-editor-canvas-container")
        .css("max-width", editor.style.width)
        .css("max-height", editor.style.height);

      if (editor.dataset.minHeight === undefined) {
        editor.dataset.minHeight = editor.style.height;
        editor.dataset.minWidth = editor.style.width;
      }
    },
  },
  mounted() {
    // FFS an image editing library with no zoom function!?
    const editor = document.querySelector(".tui-image-editor");
    editor.addEventListener("mousewheel", (e) => {
      console.log("Set Zoom via Scroll");
      const canvas = document.querySelector(
        ".tui-image-editor-canvas-container"
      );
      var imageOriginalSize = {
        width: canvas.style.maxWidth,
        height: canvas.style.maxHeight,
      };

      var imageEditorWindow = editor;
      var scrollContainer = $(".tui-image-editor-wrap");
      var initWidth = imageEditorWindow.style.width;
      var initHeight = imageEditorWindow.style.height;
      var scrollContainerInitial = {
        top: scrollContainer.scrollTop(),
        left: scrollContainer.scrollLeft(),
        height: scrollContainer[0].scrollHeight,
        width: scrollContainer[0].scrollWidth,
      };
      var mousePosition = {
        top: e.clientY - $(imageEditorWindow).offset().top,
        left: e.clientX - $(imageEditorWindow).offset().left,
      };
      var newWidth;
      var newHeight;
      var offsetY;
      var offsetX;
      // Zoom step 10%
      var wDelta = e.wheelDelta || e.deltaY;
      if (wDelta > 0) {
        newWidth = parseInt(initWidth, 10) * 1.1;
        newHeight = parseInt(initHeight, 10) * 1.1;
        // Limit maximum zoom by image resolution
        if (
          newWidth > imageOriginalSize.width ||
          newHeight > imageOriginalSize.height ||
          this.zoom >= 300
        ) {
          newWidth = imageOriginalSize.width;
          newHeight = imageOriginalSize.height;
          this.zoom = 300;
        } else {
          this.zoom += 10;
        }
      } else {
        newWidth = parseInt(initWidth, 10) * 0.9;
        newHeight = parseInt(initHeight, 10) * 0.9;
        // Limit minimum zoom by 0.5 of original container size
        if (
          parseInt(imageEditorWindow.dataset.minWidth, 10) * 0.5 >
          parseInt(newWidth, 10)
        ) {
          newWidth = parseInt(imageEditorWindow.dataset.minWidth, 10) * 0.5;
          newHeight = parseInt(imageEditorWindow.dataset.minHeight, 10) * 0.5;
          this.zoom = 50;
        } else {
          this.zoom -= 10;
        }
      }
      imageEditorWindow.style.width = newWidth + "px";
      imageEditorWindow.style.height = newHeight + "px";

      $(imageEditorWindow)
        .find("canvas, .tui-image-editor-canvas-container")
        .css("max-width", imageEditorWindow.style.width)
        .css("max-height", imageEditorWindow.style.height);

      // Save initial size of container
      if (imageEditorWindow.dataset.minHeight === undefined) {
        imageEditorWindow.dataset.minHeight = initHeight;
        imageEditorWindow.dataset.minWidth = initWidth;
      }

      // Calculate scroll offset for new position
      offsetY =
        (scrollContainer[0].scrollHeight - scrollContainerInitial.height) *
        (mousePosition.top / scrollContainerInitial.height);
      offsetX =
        (scrollContainer[0].scrollWidth - scrollContainerInitial.width) *
        (mousePosition.left / scrollContainerInitial.width);

      scrollContainer.scrollTop(scrollContainerInitial.top + offsetY);
      scrollContainer.scrollLeft(scrollContainerInitial.left + offsetX);

      e.preventDefault();
      e.stopPropagation();
    });
    this.panMode = true;
  },
};
</script>

<style lang='scss'>
.tui-image-editor-container .tui-image-editor-wrap {
  overflow: hidden; // Very important
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
  color: #000000;
}
</style>