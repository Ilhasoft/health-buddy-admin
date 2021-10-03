/* eslint-disable camelcase */
import { mapGetters } from 'vuex';
import dashboardChartMixin from './dashboard-chart';

const registeredFakesLabelUuid = 'f5b6ad36-6ec7-4bf1-913c-a3484e7c5b3f';
const newQuestionsLabelUuid = '69361321-fbfd-4389-b114-22b047d20b43';
const lowConfidenceResponsesLabelUuid = '9a9707f2-21fd-46f2-85ef-e34db3c35d09';

export default {
  mixins: [dashboardChartMixin],
  data() {
    const minDateInteractions = new Date(2020, 2, 17);
    const minDateUserPerLanguage = new Date(2020, 7, 21);
    const startPeriod = minDateInteractions;
    const startPeriodThird = minDateInteractions;
    const startPeriodViewed = minDateInteractions;
    const endPeriod = new Date();
    const endPeriodThird = new Date();
    const endPeriodViewed = new Date();
    return {
      loading: true,
      loadingRunsPerDays: true,
      loadingUserPerLanguage: true,
      loadingOtherChartData: true,
      startPeriod,
      startPeriodThird,
      startPeriodViewed,
      endPeriod,
      endPeriodThird,
      endPeriodViewed,
      startPeriodUserPerLanguage: minDateUserPerLanguage,
      endPeriodUserPerLanguage: new Date(endPeriod.getTime()),
      minDateInteractions,
      minDateUserPerLanguage,
      selectedPeriod: 'year',
      periods: ['today', 'month', 'year'],
      interactions: 0,
      totalAsks: 0,
      allFlows: 0,
      pageViews: 0,
      totalAnswers: 0,
      totalErrors: 0,
      newQuestions: 0,
      registeredFakes: 0,
      lowConfidenceResponses: 0,
      oldestTime: new Date(2019, 5, 2),
      mostViewedTotalRow: 10,
    };
  },
  computed: {
    ...mapGetters(['rapidProUrl', 'rapidProProxyUrl', 'rapidProRunUrl', 'rapidProGroupsUrl', 'googleAnalyticsUrl', 'rapidProLabelsCountUrl']),
    fromDate() {
      return `from ${this.getStartDate().toLocaleDateString('en-US')}`;
    },
    summaryTableUrl() {
      const { token } = this.$route.query;
      const queryParams = [
        `start_date=${this.getStartPeriodViewedDate()}`,
        `end_date=${this.getEndPeriodViewedDate()}`,
      ].join('&');
      let url = `${process.env.VUE_APP_SERVER_URL}rapidpro/runs/most_accessed/completed?${queryParams}&`;
      if (token) {
        url += `token=${token}&`;
      }
      return url;
    },
  },
  methods: {
    changePeriod(period) {
      this.selectedPeriod = period;
      this.fetchData();
    },
    fetchData() {
      this.fetchFirstSection();
      this.fetchSecondSection();
      this.fetchThirdSection();
    },
    fetchFirstSection() {
      if (!this.rapidProProxyUrl || !this.rapidProRunUrl) {
        return;
      }
      this.loading = true;
      Promise.all([
        this.fetchInteractions(),
        this.fetchAllFlows(),
        this.fetchVisitorsAccesses(),
        this.fetchChannelStats(),
      ]).then(([interactions, allFlows, pageViews, channelStats]) => {
        this.loading = false;
        this.interactions = interactions;
        this.totalAsks = this.countMessages(
          channelStats,
          'incoming',
          undefined,
          this.getStartDate(),
          this.getEndDate(),
        );
        this.allFlows = allFlows;
        this.pageViews = pageViews;
      });

      this.loadingRunsPerDays = true;
      this.fetchInteractionsPerDay().then((result) => {
        this.loadingRunsPerDays = false;
        this.runsPerDayData = this.makeRunsPerDayData(result);
      });
    },
    fetchSecondSection() {
      if (!this.rapidProProxyUrl || !this.rapidProRunUrl) {
        return;
      }
      this.loadingUserPerLanguage = true;
      this.fetchUsersPerLanguages()
        .then((result) => {
          this.loadingUserPerLanguage = false;
          this.usersLanguageData = this.makeUsersLanguageDataData(result);
        });
    },
    fetchThirdSection() {
      if (!this.rapidProProxyUrl || !this.rapidProRunUrl) {
        return;
      }
      this.loadingOtherChartData = true;
      Promise.all([
        this.fetchLabelById(registeredFakesLabelUuid),
        this.fetchLabelById(newQuestionsLabelUuid),
        this.fetchLabelById(lowConfidenceResponsesLabelUuid),
        this.fetchChannelStats(),
      ]).then(([registeredFakes, newQuestions, lowConfidenceResponses, channelStatus]) => {
        this.loadingOtherChartData = false;
        this.registeredFakes = registeredFakes;
        this.newQuestions = newQuestions;
        this.lowConfidenceResponses = lowConfidenceResponses;
        this.totalAnswers = this.countMessages(channelStatus, 'outgoing');
        this.totalErrors = this.countMessages(channelStatus, 'errors');
        const totalAsks = this.countMessages(channelStatus, 'incoming');
        this.messageMetricsData = this.makeMessageMetricsData(
          this.totalAnswers,
          totalAsks,
          this.totalErrors,
        );
        this.reportsData = this.makeReportsData(
          this.newQuestions,
          this.registeredFakes,
          this.lowConfidenceResponses,
        );
        const totalWeb = this.countMessages(channelStatus, 'outgoing', 'EX2')
        + this.countMessages(channelStatus, 'errors', 'EX2')
        + this.countMessages(channelStatus, 'incoming', 'EX2');   

        const totalFacebook = this.countMessages(channelStatus, 'outgoing', 'FBA')
        + this.countMessages(channelStatus, 'errors', 'FBA')
        + this.countMessages(channelStatus, 'incoming', 'FBA');

        const totalMobile = this.countMessages(channelStatus, 'outgoing', 'EX1')
        + this.countMessages(channelStatus, 'errors', 'EX1')
        + this.countMessages(channelStatus, 'incoming', 'EX1');

        const totalTelegram = this.countMessages(channelStatus, 'outgoing', 'TG')
        + this.countMessages(channelStatus, 'errors', 'TG')
        + this.countMessages(channelStatus, 'incoming', 'TG');

        const totalViber = this.countMessages(channelStatus, 'outgoing', 'VP')
        + this.countMessages(channelStatus, 'errors', 'VP')
        + this.countMessages(channelStatus, 'incoming', 'VP');
        
        const totalVk = this.countMessages(channelStatus, 'outgoing', 'VK')
        + this.countMessages(channelStatus, 'errors', 'VK')
        + this.countMessages(channelStatus, 'incoming', 'VK'); 

        this.interactionsByChannelData = this.makeInteractionsByChannelData(
          

          totalWeb,
          totalMobile,
          totalFacebook,
          totalTelegram,
          totalViber,
          totalVk,
        );
      });
    },
    fetchInteractions() {
      const queryParams = [
        'flow=f7015954-1564-4e44-84f0-124843428498',
        `start_date=${this.getRapidproStartDate()}`,
        `end_date=${this.getRapidproEndDate()}`,
      ].join('&');
      return this.$http.get(`${this.rapidProRunUrl}?${queryParams}`)
        .then(({ data }) => this.parseTotalInteractions(data));
    },
    fetchInteractionsPerDay() {
      const queryParams = [
        'flow__uuid=f7015954-1564-4e44-84f0-124843428498',
        `start_date=${this.getRapidproStartDate()}`,
        `end_date=${this.getRapidproEndDate()}`,
      ].join('&');
      return this.$http.get(`${this.rapidProRunUrl}all?${queryParams}`)
        .then(({ data }) => this.parseRunsByDay(data));
    },
    fetchAllFlows() {
      const queryParams = [
        'flow=5f80320a-9122-4798-9056-0d999771841a',
        `start_date=${this.getRapidproStartDate()}`,
        `end_date=${this.getRapidproEndDate()}`,
      ].join('&');
      return this.$http.get(`${this.rapidProRunUrl}?${queryParams}`)
        .then(({ data }) => this.parseAllFlows(data));
    },
    fetchVisitorsAccesses() {
      const queryParams = [
        `start_date=${this.getGAStartDate()}`,
        `end_date=${this.getGAEndDate()}`,
        'metrics=pageviews',
      ].join('&');
      return this.$http.get(`${this.googleAnalyticsUrl}?${queryParams}`)
        .then(({ data }) => this.parsePageViews(data));
    },
    fetchLabelById(uuid) {
      const queryParams = [
        `start_date=${this.getThirdSectionStartDate()}`,
        `end_date=${this.getThirdSectionEndDate()}`,
        `uuid=${uuid}`,
      ].join('&');
      return this.$http.get(
        `${this.rapidProLabelsCountUrl}?${queryParams}`,
      ).then(({ data }) => this.parseRegisteredFakes(data));
    },
    fetchChannelStats() {
      return this.$http.get(`${this.rapidProProxyUrl}channel_stats`)
        .then(({ data }) => {
          this.filterChannelStatsByDate(data, this.startPeriodThird, this.endPeriodThird);
          return data;
        });
    },
    fetchUsersPerLanguages() {
      const queryParams = [
        `start_date=${this.getRapidproStartDateUserPerLanguage()}`,
        `end_date=${this.getRapidproEndDateUserPerLanguage()}`,
      ].join('&');
      return this.$http.get(`${this.rapidProProxyUrl}groups?${queryParams}`)
        .then(({ data }) => this.parserUserPerLanguage(data));
    },
    filterChannelStatsByDate(data, start, end) {
      const { results } = data;
      results.forEach((result) => {
        result.daily_count.forEach((countType) => {
          // eslint-disable-next-line no-param-reassign
          countType.data = countType.data.filter((date) => {
            const currentDate = new Date(date.date);
            currentDate.setHours(0, 0, 0, 0);
            return currentDate >= start && currentDate <= end;
          });
        });
      });
    },
    parseTotalInteractions(data) {
      const {
        active,
        completed,
        expired,
        interrupted,
      } = data;
      return (active || 0) + (completed || 0) + (interrupted || 0) + (expired || 0);
    },
    parseRunsByDay(data) {
      return data.map((d) => this.parseDayRun(d));
    },
    parseDayRun(data) {
      return {
        totalInteractions: data.completed + data.active + data.expired,
        day: data.day.split('T')[0],
      };
    },
    parseAllFlows(data) {
      const { completed } = data;
      return completed || 0;
    },
    countMessages(data, type, channelType = undefined, after = undefined, before = undefined) {
      const resultsUnfiltered = data.results;
      let results = channelType
        ? resultsUnfiltered.filter((r) => r.channel_type === channelType) : resultsUnfiltered;

      if(channelType){
        if(channelType == 'EX1'){
          results = resultsUnfiltered.filter((r) => r.name === "HealthBuddy Mobile app") 
        }
        else if(channelType == "EX2"){
          results = resultsUnfiltered.filter((r) => r.name === "WEB");
        }
        else{
          results = resultsUnfiltered.filter((r) => r.channel_type === channelType);
        }
      }
      else{
        results = resultsUnfiltered;
      }


      const dailyCountList = results.map((result) => result.daily_count);
      const filteredMessages = dailyCountList.map(
        (dc) => dc.find((d) => d.name.toLowerCase() === type),
      );
      const counts = filteredMessages.reduce(
        (current, previous) => current.concat(previous.data),
        [],
      ).map((r) => ({ ...r, date: new Date(r.date) }));

      if (!after) {
        return counts.reduce((current, previous) => current + previous.count, 0);
      }
      return counts
        .filter((count) => {
          if (!before) {
            return count.date >= after;
          }
          return count.date >= after && count.date <= before;
        })
        .reduce((current, previous) => current + previous.count, 0);
    },
    parseRegisteredFakes(data) {
      const { msg_count } = data[0] || { msg_count: 0 };
      return msg_count;
    },
    parsePageViews(data) {
      return data.totalsForAllResults['ga:pageviews'];
    },
    parserUserPerLanguage(data) {
      const results = ((data || {}).results || []);
      return results
        .map((result) => this.makeUserPerLanguageResult(result))
        .filter((result) => result.name.includes('Language =') || result.name.includes('language ='));
        
    },
    makeUserPerLanguageResult(result) {
      const count = result.count || 0;
      const uuid = result.uuid || '';
      const name = result.name || '';
      return {
        uuid, count, name, language: name.substring(0, 1) == 'l' ? name.replace('language = ', '') : name.replace('Language = ', '')
      };
      
    },
    getThirdSectionStartDate() {
      return this.startPeriodThird.toISOString().split('T')[0];
    },
    getThirdSectionEndDate() {
      return this.endPeriodThird.toISOString().split('T')[0];
    },
    getStartPeriodViewedDate() {
      return this.startPeriodViewed.toISOString().split('T')[0];
    },
    getEndPeriodViewedDate() {
      return this.endPeriodViewed.toISOString().split('T')[0];
    },
    getRapidproStartDate() {
      return this.getStartDate().toISOString().split('T')[0];
    },
    getRapidproEndDate() {
      const endDate = new Date(this.getEndDate().getTime());
      // endDate.setDate(this.getEndDate().getDate() + 1);
      return endDate.toISOString().split('T')[0];
    },
    getRapidproStartDateUserPerLanguage() {
      return this.startPeriodUserPerLanguage.toISOString().split('T')[0];
    },
    getRapidproEndDateUserPerLanguage() {
      const endDate = new Date(this.endPeriodUserPerLanguage.getTime());
      // endDate.setDate(this.endPeriodUserPerLanguage.getDate() + 1);
      return endDate.toISOString().split('T')[0];
    },
    getStartDate() {
      return this.startPeriod;
    },
    getEndDate() {
      return this.endPeriod;
    },
    getGAStartDate() {
      const diffTime = Math.abs(new Date() - this.startPeriod);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays}daysAgo`;
    },
    getGAEndDate() {
      const diffTime = Math.abs(new Date() - this.endPeriod);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays}daysAgo`;
    },
  },
  watch: {
    startPeriod() {
      this.fetchFirstSection();
    },
    endPeriod() {
      this.fetchFirstSection();
    },
    startPeriodThird() {
      this.fetchThirdSection();
    },
    endPeriodThird() {
      this.fetchThirdSection();
    },
    startPeriodUserPerLanguage() {
      this.fetchSecondSection();
    },
    endPeriodUserPerLanguage() {
      this.fetchSecondSection();
    },
  },
};

// Interact with Bot -> podemos filtrar por período,
// mas não escolhemos o canal (web, telegram, etc...)

// Total Asks -> podemos filtrar por período,
// e podemos escolher o canal (web, telegram, etc...)

// All flow on Bot -> podemos filtrar por período,
// mas não escolhemos o canal (web, telegram, etc...)

// Daily Traffic -> mudar nome para Total traffic, a princípio
// poderá ser filtrado por período. Preciso estudar o google analytics

// Message Metrics -> podemos filtrar por período e
// podemos escolher o canal (web, telegram, etc...)

// New reports registreds -> Os tipos são: Low confidence response,
// New question e Reported Rumors. Porém por enquanto só existe o
// Reported Rumors no bot. Não poderá ser filtrado período, nem canal.

// O UUID do Interact with Bot e do All flow on Bot são definidos
// pelo cliente (unicef). Se houver mudanças, eles precisaram nos informar.
