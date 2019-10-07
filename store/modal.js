export const state = () => ({
    displayModal: false,
    seasonInfo: {
        title: 'Show Title',
    },
});

export const mutations = {
    toggleDisplay(state) {
        state.displayModal = !state.displayModal;
    },
    showModal(state) {
        state.displayModal = true;
    },
    hideModal(state) {
        state.displayModal = false;
        state.seasonInfo = {};
    },
    setSeasonInfo(state, info) {
        state.seasonInfo = info;
    },
};
