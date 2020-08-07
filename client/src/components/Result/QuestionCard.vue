<template>
  <v-row no-gutters justify="space-between">
    <v-card outlined flat class="mx-2">
      <v-card-text>
        <v-img :src="imgUrl" contain>
          <v-chip label class="success mb-2" id="score-chip">{{score}}/{{questionMaxScore}}</v-chip>
        </v-img>
      </v-card-text>
    </v-card>

    <v-card outlined flat class="mx-2" v-if="tags.length != 0 || !!comment">
      <v-card-text v-if="tags.length != 0">
        <v-chip
          label
          class="mr-2"
          v-for="tag in tags"
          :key="tag._id"
          link
          @click="toggleTag(tag._id)"
          :class="`${(tag._id === activeTagId)?'primary':''}`"
        >{{tag.name}}</v-chip>
        <v-card-text v-show="showTagDescription">{{tagDescription}}</v-card-text>
      </v-card-text>
      <v-divider v-if="tags.length != 0 && !!comment"></v-divider>
      <v-card-text v-if="!!comment" class="pt-1">
        <v-textarea
          flat
          no-resize
          disabled
          hide-details
          solo
          prepend-icon="mdi-comment"
          auto-grow
          rows="1"
          :value="comment"
        ></v-textarea>
      </v-card-text>
    </v-card>
  </v-row>
</template>

<script>
import { axiosInstance } from './../../api/api.js'
export default {
  props: {
    imgUrl: String,
    paperId: String,
    candidateId: String,
    gradingId: String,
    questionName: String,
    questionMaxScore: Number,
    score: Number,
    comment: String,
  },
  data() {
    return {
      tags: [],
      activeTagId: "",
      showTagDescription: false,
      tagDescription: "",
    };
  },
  methods: {
    toggleTag(_id) {
      if (_id === this.activeTagId) {
        this.showTagDescription = !this.showTagDescription;
        this.activeTagId = "";
      } else {
        this.showTagDescription = true;
        this.activeTagId = _id;
      }
      const d = this.tags.find((t) => t._id === this.activeTagId).description;
      if (d === "") {
        this.tagDescription = "No description.";
      } else {
        this.tagDescription = d;
      }
    },
  },
  created() {
    axiosInstance
      .get(
        `/gradingTags/${this.paperId}/${this.questionName}/${this.candidateId}`
      )
      .then((res) => res.data)
      .then((data) => {
        this.tags = data;
      });
  },
};
</script>
<style scoped>
#question-name-chip {
  float: right;
}
#score-chip {
  float: right;
}
</style>