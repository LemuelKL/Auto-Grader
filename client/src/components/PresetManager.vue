<template>
  <v-container fluid>
    <v-data-iterator
      :items="presets"
      :items-per-page.sync="itemsPerPage"
      :page="page"
      :search="search"
      :sort-by="sortBy.toLowerCase()"
      :sort-desc="sortDesc"
      hide-default-footer
    >
      <template v-slot:header>
        <v-toolbar dark color="blue darken-3" class="mb-1">
          <v-text-field
            v-model="search"
            clearable
            flat
            solo-inverted
            hide-details
            prepend-inner-icon="mdi-magnify"
            label="Search"
          ></v-text-field>
          <template v-if="$vuetify.breakpoint.mdAndUp">
            <v-spacer></v-spacer>
            <v-select
              v-model="sortBy"
              flat
              solo-inverted
              hide-details
              :items="keys"
              prepend-inner-icon="mdi-magnify"
              label="Sort by"
            ></v-select>
            <v-spacer></v-spacer>
            <v-btn-toggle v-model="sortDesc" mandatory>
              <v-btn large depressed color="blue" :value="false">
                <v-icon>mdi-arrow-up</v-icon>
              </v-btn>
              <v-btn large depressed color="blue" :value="true">
                <v-icon>mdi-arrow-down</v-icon>
              </v-btn>
            </v-btn-toggle>
          </template>
        </v-toolbar>
      </template>

      <template v-slot:default="props">
        <v-row>
          <v-col v-for="(item, index) in props.items" :key="index" cols="12" sm="6" md="4" lg="3">
            <v-card>
              <v-card-title class="subheading font-weight-bold">{{ item.name }}</v-card-title>

              <v-divider></v-divider>

              <v-list dense>
                <v-list-item v-for="(key, index) in filteredKeys(item)" :key="index">
                  <v-list-item-content :class="{ 'blue--text': sortBy === key }">{{ key }}:</v-list-item-content>
                  <v-list-item-content
                    class="align-end"
                    :class="{ 'blue--text': sortBy === key }"
                  >{{ item[key.toLowerCase()] }}</v-list-item-content>
                </v-list-item>
              </v-list>
              <v-card-actions>
                <v-row no-gutters align="center">
                  <v-btn text @click="editPreset(item._id)">Edit</v-btn>
                  <v-btn text @click="deletePreset(item._id)">Delete</v-btn>
                  <v-alert
                    :ref="`${item._id}-delete`"
                    text
                    dense
                    type="error"
                    transition="slide-x-transition"
                    :value="false"
                    class="mb-0 ml-1"
                  >Preset already in-use.</v-alert>
                </v-row>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <template v-slot:footer>
        <v-row class="ma-2" align="center" justify="center">
          <span class="grey--text">Items per page</span>
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn dark text color="primary" class="ml-2" v-bind="attrs" v-on="on">
                {{ itemsPerPage }}
                <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(number, index) in itemsPerPageArray"
                :key="index"
                @click="updateItemsPerPage(number)"
              >
                <v-list-item-title>{{ number }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-spacer></v-spacer>

          <v-btn fab dark color="blue darken-3" class="ml-1" @click="createPreset">
            <v-icon>mdi-plus</v-icon>
          </v-btn>

          <v-spacer></v-spacer>

          <span class="mr-4 grey--text">Page {{ page }} of {{ numberOfPages }}</span>
          <v-btn fab dark color="blue darken-3" class="mr-1" @click="formerPage">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn fab dark color="blue darken-3" class="ml-1" @click="nextPage">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-row>
      </template>
    </v-data-iterator>
    <preset-dialog
      :papers="papers"
      :show.sync="presetDialog"
      :mode="presetDialogMode"
      :presetId="presetId"
      :preset="preset"
      @presetUpdated="updatePresetVisual"
      @presetCreated="spawnPreset"
    ></preset-dialog>
  </v-container>
</template>v

<script>
import { axiosInstance } from './../api/api.js'
import PresetDialog from "./PresetDialog";
export default {
  props: {
    papers: Array
  },
  components: {
    "preset-dialog": PresetDialog
  },
  data() {
    return {
      itemsPerPageArray: [4, 8, 12],
      search: "",
      filter: {},
      sortDesc: false,
      page: 1,
      itemsPerPage: 4,
      sortBy: "name",
      keys: ["Name", "Description", "Paper", "Question"],
      presets: [],

      // Props for PresetDialog
      presetDialog: false,
      presetDialogMode: "???",
      presetId: "",
      preset: {}
    };
  },
  computed: {
    numberOfPages() {
      return Math.ceil(this.presets.length / this.itemsPerPage);
    }
  },
  methods: {
    filteredKeys(item) {
      // Field appears if filter() is supplied with True
      console.log(item);
      return this.keys.filter(
        key =>
          (key === "Description" && item.description != "") ||
          (key === "Paper" && item.paperId != "") ||
          (key === "Question" && item.question != "")
      );
    },
    nextPage() {
      if (this.page + 1 <= this.numberOfPages) this.page += 1;
    },
    formerPage() {
      if (this.page - 1 >= 1) this.page -= 1;
    },
    updateItemsPerPage(number) {
      this.itemsPerPage = number;
    },
    fetchPaperNameById(paperId) {
      return new Promise((resolve, reject) => {
        axiosInstance
          .get(`/papers/${paperId}`)
          .then(response => response.data)
          .then(data => {
            resolve(data.name);
          })
          .catch(err => {
            console.error(err);
            reject();
          });
      });
    },
    fetchPresets() {
      axiosInstance
        .get("/presets")
        .then(response => response.data)
        .then(async data => {
          this.presets = [];
          for (let d of data) {
            var r = {};
            r.name = d.name;
            r.description = d.description;
            r._id = d._id;
            r.paperId = d.paperId;
            if (d.paperId != "") {
              r.paper = `${await this.fetchPaperNameById(d.paperId)} - ${
                d.paperId
              }`;
            }
            else r.paper = ""
            r.questionName = d.questionName;
            if (d.questionName != "") {
              r.question = d.questionName;
            }
            else r.question = ""
            this.presets.push(r);
          }
        });
    },
    createPreset() {
      this.presetDialogMode = "Create";
      this.presetDialog = true;
    },
    editPreset(_id) {
      this.presetDialogMode = "Edit";
      this.presetId = _id;
      this.preset = this.presets.find(r => r._id == this.presetId);
      this.presetDialog = true;
    },
    deletePreset(_id) {
      // Check if preset is already in-use in Papers
      axiosInstance
        .get(`/presets/${_id}/gradings`)
        .then(response => response.data)
        .then(data => {
          if (data.length != 0) {
            this.$refs[`${_id}-delete`][0].value = true;
            setTimeout(() => {
              this.$refs[`${_id}-delete`][0].value = false;
            }, 1000)
          } else {
            axiosInstance
              .delete(`/presets/${_id}`)
              .then(response => {
                if (response.status == 200) console.log("Good");
                const index = this.presets.findIndex(p => p._id === _id);
                this.presets.splice(index, 1);
              });
          }
        });
    },
    async updatePresetVisual(newPreset) {
      var index = this.presets.findIndex(r => r._id == newPreset._id);
      if (newPreset.paperId != "") {
        newPreset.paper = `${await this.fetchPaperNameById(
          newPreset.paperId
        )} - ${newPreset.paperId}`;
      }
      if (newPreset.questionName != "") {
        newPreset.question = newPreset.questionName;
      }
      else newPreset.question = "";
      this.$set(this.presets, index, newPreset); // Vue's reactivity for Array https://vuejs.org/v2/guide/reactivity.html#For-Arrays
    },
    async spawnPreset(newPreset) {
      if (newPreset.paperId != "") {
        newPreset.paper = `${await this.fetchPaperNameById(
          newPreset.paperId
        )} - ${newPreset.paperId}`;
      }
      if (newPreset.questionName != "") {
        newPreset.question = newPreset.questionName;
      }
      else newPreset.question = "";
      this.presets.push(newPreset);
    }
  },
  created() {
    this.fetchPresets();
  }
};
</script>