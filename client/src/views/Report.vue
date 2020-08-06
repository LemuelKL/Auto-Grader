<template>
  <div class="ma-2">
    <result-table @report-changed="handleReportChange" @paper-changed="updateFileName"></result-table>
    <div class="my-4"></div>
    <v-btn :disabled="!(!!reportData && !!reportFields)">
      <vue-json-excel
        :data="reportData"
        :fields="reportFields"
        :name="reportFileName"
      >Download Report (.xls)</vue-json-excel>
    </v-btn>
  </div>
</template>
<script>
import ResultTable from "./../components/Report/ResultTable";
import VueJsonExcel from "vue-json-excel";
export default {
  components: {
    "result-table": ResultTable,
    "vue-json-excel": VueJsonExcel,
  },
  data() {
    return {
      reportData: undefined,
      reportFields: undefined,
      reportFileName: "",
    };
  },
  methods: {
    handleReportChange(headers, result) {
      var jsonText = "{";
      headers.forEach((h) => {
        jsonText += `"${h.text}":"${h.value}",`;
      });
      jsonText = jsonText.slice(0, jsonText.length - 1);
      jsonText += "}";
      this.reportFields = JSON.parse(jsonText);
      this.reportData = result;
    },
    updateFileName(name) {
      this.reportFileName = `${name.replace(/\.[^/.]+$/, "")} Report.xls`;
    },
  },
};
</script>