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
    makeInteractionsByChannelData(totalWeb, totalMobile, totalWhatsapp, totalViber, totalFacebook, totalTelegram, totalVk) {
      return [
        {
          label: 'Web',
          value: totalWeb,
          backgroundColor: '#80bd41',
        },
        {
          label: 'Mobile',
          value: totalMobile,
          backgroundColor: '#f7c10c',
        },
        {
          label: 'WhatsApp',
          value: totalWhatsapp,
          backgroundColor: '#4bace2',
        },
        {
          label: 'Viber',
          value: totalViber,
          backgroundColor: '#8f5db7',
        },
        {
          label: 'Facebook',
          value: totalFacebook,
          backgroundColor: '#e64d35',
        },
        {
          label: 'Telegram',
          value: totalTelegram,
          backgroundColor: '#182a6d',
        },
        {
          label: 'VK',
          value: totalVk,
          backgroundColor: '#4C75A3',
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
      usersPerLanguages.sort(
        (languageA, languageB) => languageA.language.localeCompare(languageB.language),
      );
      return usersPerLanguages.map((result) => ({ label: result.language, value: result.count }));
    },
    makeRunsPerDayData(makeRunsPerDay) {
      return makeRunsPerDay.map(
        (result) => ({ label: result.day, value: result.totalInteractions }),
      );
    },
  },
};
