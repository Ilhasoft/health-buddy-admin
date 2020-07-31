import { mapGetters } from 'vuex';
import dashboardChartMixin from './dashboard-chart';

const enabledLanguages = [
  'English',
  'Romanian',
  'Bulgarian',
  'Hungarian',
  'Turkish',
  'Macedonian',
  'Greek',
  'Kazakh',
  'Italian',
  'Spanish',
  'Russian',
  'Portuguese',
  'English',
  'Italian',
];

export default {
  mixins: [dashboardChartMixin],
  data() {
    const startPeriod = new Date();
    const endPeriod = new Date();
    startPeriod.setFullYear(endPeriod.getFullYear() - 1);
    return {
      loading: true,
      startPeriod,
      endPeriod,
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
    };
  },
  computed: {
    ...mapGetters(['rapidProProxyUrl', 'rapidProRunUrl', 'googleAnalyticsUrl']),
    fromDate() {
      return `from ${this.getStartDate().toLocaleDateString('en-US')}`;
    },
  },
  methods: {
    changePeriod(period) {
      this.selectedPeriod = period;
      this.fetchData();
    },
    fetchData() {
      if (!this.rapidProProxyUrl || !this.rapidProRunUrl) {
        return;
      }
      this.loading = true;
      this.fetchAll()
        .then((results) => {
          this.loading = false;
          const [
            interactions,
            allFlows,
            pageViews,
            registeredFakes,
            newQuestions,
            lowConfidenceResponses,
            usersPerLanguages,
            totalAsksByPeriod,
            totalAsks,
            totalAnswers,
            totalErrors,
          ] = results;
          this.interactions = interactions;
          this.totalAsks = totalAsksByPeriod;
          this.allFlows = allFlows;
          this.pageViews = pageViews;
          this.totalAnswers = totalAnswers;
          this.totalErrors = totalErrors;
          this.newQuestions = newQuestions;
          this.registeredFakes = registeredFakes;
          this.lowConfidenceResponses = lowConfidenceResponses;
          this.messageMetricsData = this.makeMessageMetricsData(
            totalAsks,
            totalAnswers,
            totalErrors,
          );
          this.reportsData = this.makeReportsData(
            newQuestions,
            registeredFakes,
            lowConfidenceResponses,
          );
          this.usersLanguageData = this.makeUsersLanguageDataData(usersPerLanguages);
        });
    },
    fetchAll() {
      return Promise.all([
        this.fetchInteractions(),
        this.fetchAllFlows(),
        this.fetchVisitorsAccesses(),
        this.fetchRegisteredFakes(),
        this.fetchNewQuestions(),
        this.fetchLowConfidenceResponses(),
        this.fetchUsersPerLanguages(),
        this.fetchChannelStats(),
      ]).then((result) => {
        const totalAsksByPeriod = this.countMessages(
          result[7],
          'incoming',
          this.getStartDate(),
          this.getEndDate(),
        );
        const totalAsks = this.countMessages(result[7], 'incoming');
        const totalAnswers = this.countMessages(result[7], 'outgoing');
        const totalErrors = this.countMessages(result[7], 'errors');
        return [...result.slice(0, 7), totalAsksByPeriod, totalAsks, totalAnswers, totalErrors];
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
    fetchRegisteredFakes() {
      return this.$http.get(`${this.rapidProProxyUrl}labels?uuid=f5b6ad36-6ec7-4bf1-913c-a3484e7c5b3f`)
        .then(({ data }) => this.parseRegisteredFakes(data));
    },
    fetchNewQuestions() {
      return this.$http.get(`${this.rapidProProxyUrl}labels?uuid=69361321-fbfd-4389-b114-22b047d20b43`)
        .then(({ data }) => this.parseRegisteredFakes(data));
    },
    fetchLowConfidenceResponses() {
      return this.$http.get(`${this.rapidProProxyUrl}labels?uuid=9a9707f2-21fd-46f2-85ef-e34db3c35d09`)
        .then(({ data }) => this.parseRegisteredFakes(data));
    },
    fetchChannelStats() {
      return this.$http.get(`${this.rapidProProxyUrl}channel_stats`)
        .then(({ data }) => data);
    },
    fetchUsersPerLanguages() {
      return this.$http.get(`${this.rapidProProxyUrl}groups`)
        .then(({ data }) => this.parserUserPerLanguage(data));
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
    parseAllFlows(data) {
      const { completed } = data;
      return completed || 0;
    },
    countMessages(data, type, after = undefined, before = undefined) {
      const { results } = data;
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
      const { count } = data.results[0] || { count: 0 };
      return count;
    },
    parsePageViews(data) {
      return data.totalsForAllResults['ga:pageviews'];
    },
    parserUserPerLanguage(data) {
      const results = ((data || {}).results || []);
      return results
        .map((result) => this.makeUserPerLanguageResult(result))
        .filter((result) => enabledLanguages.indexOf(result.language) !== -1);
    },
    makeUserPerLanguageResult(result) {
      const count = result.count || 0;
      const name = result.name || '';
      return { count, language: name.replace('Language = ', '') };
    },
    getRapidproStartDate() {
      return this.getStartDate().toISOString().split('T')[0];
    },
    getRapidproEndDate() {
      const endDate = new Date();
      endDate.setDate(this.getEndDate().getDate() + 1);
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
      this.fetchData();
    },
    endPeriod() {
      this.fetchData();
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
