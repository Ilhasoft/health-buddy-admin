export default {
  data() {
    return {
      dailyTrafficData: [],
      messageMetricsData: [],
      reportsData: [],
      usersLanguageData: [],
      interactionsByChannelData: [],
      runsPerDayData: [],
    };
  },
  methods: {
    makeDailyTrafficData(visitorsAccesses, usersAccesses) {
      return [
        {
          label: 'Visitors',
          value: visitorsAccesses,
          backgroundColor: '#2FA2F4',
        },
        {
          label: 'Users',
          value: usersAccesses,
          backgroundColor: '#F8C239',
        },
      ];
    },
    makeMessageMetricsData(totalSent, totalReceived, totalFail) {
      return [
        {
          label: 'Sent',
          value: totalSent,
          backgroundColor: '#374EA2',
        },
        {
          label: 'Fail',
          value: totalFail,
          backgroundColor: '#E2231A',
        },
        {
          label: 'Received',
          value: totalReceived,
          backgroundColor: '#1CABE2',
        },
      ];
    },
    makeInteractionsByChannelData(web, mobile, app, facebook, telegram) {
      return [
        {
          label: 'Web',
          value: web,
          backgroundColor: '#80bd41',
        },
        {
          label: 'Web mobile',
          value: mobile,
          backgroundColor: '#f7c10c',
        },
        {
          label: 'App',
          value: app,
          backgroundColor: '#4bace2',
        },
        {
          label: 'Facebook',
          value: facebook,
          backgroundColor: '#e64d35',
        },
        {
          label: 'Telegram',
          value: telegram,
          backgroundColor: '#182a6d',
        },
      ];
    },
    makeReportsData(newQuestions, totalFakes, lowConfidenceResponses) {
      return [
        {
          label: 'Reported Rumors',
          value: totalFakes,
          backgroundColor: '#F7652B',
        },
        {
          label: 'Low Confidence',
          value: lowConfidenceResponses,
          backgroundColor: '#F8C239',
        },
        {
          label: 'New Questions',
          value: newQuestions,
          backgroundColor: '#2FA2F4',
        },
      ];
    },
    makeUsersLanguageDataData(usersPerLanguages) {
      Object.values(usersPerLanguages).forEach((languageData) => {
        languageData.data.sort((d1, d2) => d1.label - d2.label);
        languageData.data.forEach((data) => {
          // eslint-disable-next-line
          data.label = data.label.toISOString().split('T')[0];
        });
      });
      return usersPerLanguages;
    },
    makeRunsPerDayData(makeRunsPerDay) {
      return makeRunsPerDay.map(
        (result) => ({ label: result.day, value: result.totalInteractions }),
      );
    },
  },
};
