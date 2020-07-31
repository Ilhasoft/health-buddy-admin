export default {
  data() {
    return {
      dailyTrafficData: [],
      messageMetricsData: [],
      reportsData: [],
      usersLanguageData: [],
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
      return usersPerLanguages.map((result) => ({ label: result.language, value: result.count }));
    },
  },
};
