<template>
    <b-modal
        :active.sync="isModalActive"
        :width="640"
        scroll="keep"
        @close="closeModal"
    >
        <div class="card">
            <header class="card-header">
                <div class="card-header-title">
                    {{ seasonInfo.showTitle }} Season
                    {{ seasonInfo.seasonNumber }}
                </div>
            </header>
            <div class="card-content">
                <ul>
                    <li v-if="seasonInfo.missingEpisodes">
                        {{ seasonInfo.missingEpisodes }} Episodes Missing
                        <b-progress
                            :value="
                                seasonInfo.episodeStatistics.percentComplete
                            "
                            show-value
                            format="percent"
                            type="is-danger"
                        >
                            {{
                                seasonInfo.episodeStatistics
                                    .numberOfEpisodesWithoutFiles
                            }}
                            of
                            {{
                                seasonInfo.episodeStatistics
                                    .numberOfEpisodesWithAirdates
                            }}
                        </b-progress>
                    </li>
                    <li v-if="seasonInfo.hasAllFiles && !seasonInfo.inProgress">
                        Ready to Move
                    </li>
                    <li v-if="seasonInfo.inProgress">
                        In Progress
                        <b-progress
                            :value="
                                seasonInfo.episodeStatistics.percentComplete
                            "
                            show-value
                            format="percent"
                            type="is-warning"
                        >
                            {{
                                seasonInfo.episodeStatistics
                                    .numberOfEpisodesWithFiles
                            }}
                            of
                            {{
                                seasonInfo.episodeStatistics
                                    .numberOfEpisodesWithAirdates
                            }}
                        </b-progress>
                    </li>
                </ul>
            </div>
        </div>
    </b-modal>
</template>

<script>
export default {
    props: {
        isCardModalActive: {
            type: Boolean,
            required: true,
            default: false,
        },
        seasonInfo: {
            type: Object,
            required: true,
            default: () => {
                return {};
            },
        },
    },
    data() {
        return {
            cardModalToggle: false,
        };
    },
    computed: {
        isModalActive: {
            get() {
                return this.cardModalToggle;
            },
            set(value) {
                this.cardModalToggle = value;
            },
        },
    },
    watch: {
        isCardModalActive(newVal) {
            this.cardModalToggle = newVal;
        },
    },
    methods: {
        closeModal() {
            this.$store.commit('modal/hideModal');
        },
    },
};
</script>
