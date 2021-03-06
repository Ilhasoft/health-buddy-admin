<template>
  <section class="dashboard">
    <div v-if="this.$route.name !== 'IframeDashboard'">
      <ilha-header>
      </ilha-header>
      <b-loading
        :is-full-page="false"
        :active="downloading">
      </b-loading>
      <div class="dashboard-actions m-2 m-t-1 m-b-0">
        <div class="columns">
          <div class="column">
            <b-button
              @click="downloadPdf"
              outlined
              type="is-primary"
              class="periods-container__button"
            >
              Export PDF
            </b-button>
          </div>
          <div class="column">
            <b-button
              @click="downloadCSV"
              outlined
              type="is-primary"
              class="periods-container__button"
            >
              Export CSV
            </b-button>
          </div>
        </div>
      </div>
    </div>
    <div
      class="m-2 m-t-1" id="chart-panel">
      <div class="m-b-1">
        <ilha-title>
          Overview
        </ilha-title>

        <div
          v-if="!downloading"
          class="columns m-t-1 m-b-0 date-filter"
        >
          <b-field class="column m-b-0">
            <b-datepicker
              v-model="startPeriod"
              :min-date="minDateInteractions"
              :max-date="endPeriod"
              ref="startDatepicker"
              expanded
              placeholder="Start">
            </b-datepicker>
            <b-button
              @click="$refs.startDatepicker.toggle()"
              icon-left="calendar-today"
              type="is-primary" />
          </b-field>
          <b-field class="column m-b-0">
            <b-datepicker
              v-model="endPeriod"
              :min-date="startPeriod"
              ref="endDatepicker"
              expanded
              placeholder="End">
            </b-datepicker>
            <b-button
              @click="$refs.endDatepicker.toggle()"
              icon-left="calendar-today"
              type="is-primary" />
          </b-field>
        </div>

        <div class="columns m-t-1 m-b-1">
          <div class="column is-3">
            <ilha-summary-box
              :loading="loading"
              class="has-background-blue has-text-white"
            >
              <template v-slot:icon>
                <ilha-icon type="tag-white" class="icon is-medium"/>
              </template>
              <template v-slot:metric>
                <span title="Total number of conversations on the Bot.">Total Interactions</span>
              </template>
              <template v-slot:amount>
                {{ interactions | toUSD }}
              </template>
            </ilha-summary-box>
          </div>
          <div class="column is-3">
            <ilha-summary-box
              :loading="loading"
              class="has-background-yellow has-text-white"
            >
              <template v-slot:icon>
                <ilha-icon type="users-white" class="icon is-medium"/>
              </template>
              <template v-slot:metric>
                <span title="The number of asked questions.">Total questions</span>
              </template>
              <template v-slot:amount>
                {{ totalAsks | toUSD }}
              </template>
            </ilha-summary-box>
          </div>
          <div class="column is-3">
            <ilha-summary-box
              :loading="loading"
              class="has-background-green has-text-white"
            >
              <template v-slot:icon>
                <ilha-icon type="trend-white" class="icon is-medium"/>
              </template>
              <template v-slot:metric>
                <span title="Total number of conversations completed on the Bot">
                  Total complete Interaction
                </span>
              </template>
              <template v-slot:amount>
                {{ allFlows | toUSD }}
              </template>
            </ilha-summary-box>
          </div>
          <div class="column is-3">
            <ilha-summary-box
              :loading="loading"
              class="has-background-red has-text-white"
            >
              <template v-slot:icon>
                <ilha-icon type="trend-white" class="icon is-medium"/>
              </template>
              <template v-slot:metric>
                <span title="The number of times the website has been accessed">Total Views</span>
              </template>
              <template v-slot:amount>
                {{ pageViews | toUSD }}
              </template>
            </ilha-summary-box>
          </div>
        </div>
        <div class="columns m-b-1">
          <div class="column is-12">
            <ilha-chart-summary-box
              ref="lineChart1"
              :loading="loadingRunsPerDays"
              :chart-data="runsPerDayData"
              :chart-type="'line'"
              :show-datapoint="showDataPointsIterations"
              :background-color="'#78ddf4'"
              class="has-background-white">
              <template v-slot:title>
                <span title="Total number of conversations on the Bot per Day.">
                  Total Interacts with Bot per Day
                </span>
              </template>
            </ilha-chart-summary-box>
          </div>
        </div>
        <div
          v-if="!downloading"
          class="columns m-t-1 date-filter"
        >
          <b-field class="column">
            <b-dropdown v-model="languagesGroup" multiple aria-role="list">
              <template #trigger>
                <b-button
                    type="is-primary"
                    icon-right="menu-down">
                    Selected ({{ languagesGroup.length }})
                </b-button>
              </template>
              <b-dropdown-item
                v-for="(language, index) in this.usersLanguageData"
                :key="index"
                :value="language.label"
                aria-role="listitem">
                <span>{{language.label}}</span>
              </b-dropdown-item>
            </b-dropdown>
          </b-field>
        </div>
        <div class="columns m-b-1">
          <div class="column is-12">
            <ilha-chart-summary-box
              ref="lineChart2"
              :loading="loadingUserPerLanguage"
              :chart-data="filterLanguagesData"
              :show-datapoint="showDataPointsLanguages"
              :chart-type="this.languagesGroup.length === 1 ? 'bar' : 'line'"
              :background-color="'#78ddf4'"
              class="has-background-white">
              <template v-slot:title>
                <span title="Number of users access per language.">
                  Access per Language
                </span>
              </template>
            </ilha-chart-summary-box>
          </div>
        </div>
      </div>
      <div class="m-t-1">
        <ilha-title title="Statistics about message, channels, reports, etc.">
          Secondary
        </ilha-title>
        <div
          v-if="!downloading"
          class="columns m-t-1 m-b-0 date-filter"
        >
          <b-field class="column m-b-0">
            <b-datepicker
              v-model="startPeriodThird"
              :min-date="minDateInteractions"
              :max-date="endPeriodThird"
              ref="startDatepickerThird"
              expanded
              placeholder="Start">
            </b-datepicker>
            <b-button
              @click="$refs.startDatepickerThird.toggle()"
              icon-left="calendar-today"
              type="is-primary" />
          </b-field>
          <b-field class="column m-b-0">
            <b-datepicker
              v-model="endPeriodThird"
              :min-date="startPeriodThird"
              ref="endDatepickerThird"
              expanded
              placeholder="End">
            </b-datepicker>
            <b-button
              @click="$refs.endDatepickerThird.toggle()"
              icon-left="calendar-today"
              type="is-primary" />
          </b-field>
        </div>
        <div class="columns m-t-1 m-b-1">
          <div class="column is-4">
            <ilha-chart-summary-box
              ref="messageChart"
              :loading="loadingOtherChartData"
              :chart-data="messageMetricsData"
              class="has-background-white">
              <template v-slot:title>
                <span title="Traffic number for incoming, outgoing, and failed messages.">
                  Message Metrics
                </span>
              </template>
            </ilha-chart-summary-box>
          </div>
          <div class="column is-4">
            <ilha-chart-summary-box
              ref="reportChart"
              :loading="loadingOtherChartData"
              :chart-data="reportsData"
              class="has-background-white"
            >
              <template v-slot:title>
                <span title="The number of registered reports grouped by report type(Question, level of confidence, etc).">
                  New Reports Registered
                </span>
              </template>
            </ilha-chart-summary-box>
          </div>
          <div class="column is-4">
            <ilha-chart-summary-box
              ref="interactionsByChannelChart"
              :loading="loadingOtherChartData"
              :chart-data="interactionsByChannelData"
              class="has-background-white"
            >
              <template v-slot:title>
                <span title="The number of registered reports grouped by which channel(Facebook, Telegram, etc) it were created by.">
                  Interaction by Channel
                </span>
              </template>
            </ilha-chart-summary-box>
          </div>
        </div>
        <div class="m-t-1">
          <ilha-title title="Topics that reporters are searching for, ordered by amount per topic in a period of time.">
            Most viewed
          </ilha-title>
          <div
            v-if="!downloading"
            class="columns m-t-1 m-b-0 date-filter"
          >
            <b-field class="column m-b-0">
              <b-datepicker
                v-model="startPeriodViewed"
                :min-date="minDateInteractions"
                :max-date="endPeriodViewed"
                ref="startDatepickerViewed"
                expanded
                placeholder="Start">
              </b-datepicker>
              <b-button
                @click="$refs.startDatepickerViewed.toggle()"
                icon-left="calendar-today"
                type="is-primary" />
            </b-field>
            <b-field class="column m-b-0">
              <b-datepicker
                v-model="endPeriodViewed"
                :min-date="startPeriodViewed"
                ref="endDatepickerViewed"
                expanded
                placeholder="End">
              </b-datepicker>
              <b-button
                @click="$refs.endDatepickerViewed.toggle()"
                icon-left="calendar-today"
                type="is-primary" />
            </b-field>
          </div>
          <div class="m-t-1 m-b-1">
            <ilha-summary-table
              :url="summaryTableUrl"
              :format-result-func="formatResultFunc"
              :per-page="mostViewedTotalRow"
              :header="header"
              :mobile-cards="mobileCards"
              ref="mostViewed"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import * as JsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import dashboardMixin from '../mixins/dashboard';

export default {
  mixins: [dashboardMixin],
  computed: {
    ...mapState(['serverUrl']),
    showDataPointsIterations() {
      return this.downloading && this.runsPerDayData.length <= 30;
    },
    showDataPointsLanguages() {
      return this.downloading && this.usersLanguageData.length <= 30;
    },
    filterLanguagesData() {
      if (this.languagesGroup.length === 0) {
        return this.usersLanguageData;
      }

      return this.usersLanguageData.filter(
        (language) => this.languagesGroup.includes(language.label),
      );
    },
  },
  data() {
    return {
      mobileCards: false,
      downloading: false,
      header: [
        {
          property: 'name',
          label: 'Name',
        },
        {
          property: 'completed',
          label: 'Total Access',
        },
      ],
      formatResultFunc: (data) => {
        const results = data.data || [];
        return { ...data, data: { results, count: results.length } };
      },
      token: this.$route.query.token,
      languagesGroup: [],
    };
  },
  methods: {
    downloadPdf() {
      const contentArea = document.querySelector('#chart-panel');
      contentArea.parentElement.classList.add('print');
      this.downloading = true;
      this.mostViewedTotalRow = 1000;
      setTimeout(() => {
        this.resizeCharts();
        setTimeout(() => {
          this.buildAndDownloadPDF();
        }, 1000);
      }, 10);
    },
    downloadCSV() {
      this.downloading = true;
      const rows = [
        ['metric', 'value'],
        ['interactions', this.interactions],
        ['totalAsks', this.totalAsks],
        ['allFlows', this.allFlows],
        ['pageViews', this.pageViews],
        ['totalAnswers', this.totalAnswers],
        ['totalErrors', this.totalErrors],
        ['newQuestions', this.newQuestions],
        ['registeredFakes', this.registeredFakes],
        ['lowConfidenceResponses', this.lowConfidenceResponses],
      ];
      const accessPerLanguage = [['country', 'access']].concat(
        this.usersLanguageData.map((data) => [data.label, data.value]),
      );
      const mostViewed = [['flow', 'access']].concat(
        (this.$refs.mostViewed.data || []).map(
          (data) => [data.name, data.completed],
        ),
      );
      this.exportToCsv('metrics.csv', rows);
      this.exportToCsv('Access per Language.csv', accessPerLanguage);
      this.exportToCsv('Most viewed.csv', mostViewed);
      this.downloading = false;
    },
    exportToCsv(filename, rows) {
      const csvFile = rows.map((row) => this.processRow(row)).join('\n');

      const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    buildAndDownloadPDF() {
      const margin = 60;
      const contentArea = document.querySelector('#chart-panel');
      html2canvas(contentArea).then((canvas) => {
        const pdf = new JsPDF('p', 'px', [contentArea.clientWidth + margin, contentArea.clientHeight + margin]);
        const widthWithoutMargin = pdf.internal.pageSize.getWidth() - margin;
        const heightWithoutMargin = pdf.internal.pageSize.getHeight() - margin;
        contentArea.parentElement.classList.remove('print');
        const img = canvas.toDataURL('image/png');
        pdf.addImage(img, 'png', margin / 2, margin / 2, widthWithoutMargin, heightWithoutMargin);
        pdf.save('dashboard.pdf');
        this.downloading = false;
        this.mostViewedTotalRow = 10;
        setTimeout(() => this.resizeCharts(), 0);
      });
    },
    processRow(row) {
      let finalVal = '';
      for (let j = 0; j < row.length; j += 1) {
        let innerValue = row[j] === null ? '' : row[j].toString();
        if (row[j] instanceof Date) {
          innerValue = row[j].toLocaleString();
        }
        let result = innerValue.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0) {
          result = `"${result}"`;
        }
        if (j > 0) {
          finalVal += ',';
        }
        finalVal += result;
      }
      return `${finalVal}`;
    },
    resizeCharts() {
      this.$refs.messageChart.$refs.donut.initChart();
      this.$refs.reportChart.$refs.donut.initChart();
      this.$refs.lineChart1.$refs.line.initChart();
      if (this.languagesGroup.length !== 1) {
        this.$refs.lineChart2.$refs.line.initChart();
      } else {
        this.$refs.lineChart2.$refs.bar.initChart();
      }
    },
  },
  filters: {
    toUSD(value) {
      return `${(+value).toLocaleString('en-US')}`;
    },
  },
  watch: {
    serverUrl() {
      this.fetchData();
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>

<style lang="scss">
@import "../assets/styles/variables";

.dashboard {
  position: relative;
  /deep/ .search-field {
    opacity: 0;
    input {
      display: none;
    }
  }
}

.dashboard-actions {
  display: flex;
  > div:last-child {
    margin-left: auto !important;
  }
  @media screen and (max-width: 768px) {
    display: block;
  }
}
.date-filter {
  @media screen and (min-width: 768px) {
    width: 400px;
  }
}
</style>
