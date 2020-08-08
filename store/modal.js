export const state = () => ({
    displaySeasonModal: false,
    displaySeriesModal: false,
    seasonInfo: {
        title: 'Show Title',
    },
    seriesInfo: {
        title: 'Show Title',
    },
    episodesInfo: [],
});

export const mutations = {
    toggleDisplay(state) {
        state.displaySeasonModal = !state.displaySeasonModal;
    },
    showSeasonModal(state) {
        state.displaySeasonModal = true;
    },
    hideSeasonModal(state) {
        state.displaySeasonModal = false;
        state.seasonInfo = {};
    },
    showSeriesModal(state) {
        state.displaySeriesModal = true;
    },
    hideSeriesModal(state) {
        state.displaySeriesModal = false;
        state.seriesInfo = {};
    },
    setSeasonInfo(state, info) {
        state.seasonInfo = info;
    },
    setSeriesSeasonMovingJobId(state, data) {
        const seasonId = data.seasonId;
        const jobId = data.jobId;
        const season = state.seriesInfo.seasons.find(
            (season) => (season.id = seasonId)
        );
        season.movingJobId = jobId;
    },
    setSeriesInfo(state, info) {
        state.seriesInfo = info;
    },
    setEpisodesInfo(state, info) {
        state.episodesInfo = info;
    },
    clearEpisodesInfo(state) {
        state.episodesInfo = [];
    },
};
