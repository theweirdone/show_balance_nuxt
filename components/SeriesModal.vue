<template>
    <b-modal
        :active.sync="isModalActive"
        :width="640"
        @close="closeModal"
        scroll="keep"
    >
        <div class="card">
            <header class="card-header">
                <div class="card-header-title">
                    {{ seriesInfo.title }}
                </div>
            </header>
            <div class="card-content">
                <ul v-if="allSeasons.length">
                    <li v-for="season in allSeasons" :key="season.seasonNumber">
                        Season {{ season.seasonNumber }}
                        <b-button
                            v-if="
                                seasonsMoving.find(
                                    (s) => s.seasonId === season.seasonNumber
                                )
                            "
                            @click="
                                checkMovingStatus(
                                    seasonsMoving.find(
                                        (s) =>
                                            s.seasonId === season.seasonNumber
                                    ).jobId
                                )
                            "
                            type="is-primary"
                            outlined
                            size="is-small"
                        >
                            Moving
                        </b-button>
                        <b-button
                            v-if="season.readyToMove && !season.monitored"
                            @click="moveSeason(season)"
                            type="is-info"
                            outlined
                            size="is-small"
                        >
                            Move
                        </b-button>
                        <b-button
                            v-if="season.readyToMove && season.monitored"
                            type="is-warning"
                            outlined
                            size="is-small"
                        >
                            Move
                        </b-button>
                        <b-button
                            v-if="season.readyToMove && season.monitored"
                            type="is-primary"
                            outlined
                            size="is-small"
                        >
                            UnMonitor
                        </b-button>
                        <b-progress
                            v-if="season.missingEpisodes"
                            :value="season.episodeStatistics.percentComplete"
                            show-value
                            format="percent"
                            type="is-danger"
                        >
                            {{
                                season.episodeStatistics
                                    .numberOfEpisodesWithoutFiles
                            }}
                            of
                            {{
                                season.episodeStatistics
                                    .numberOfEpisodesWithAirdates
                            }}
                        </b-progress>
                        <b-progress
                            v-if="season.inProgress"
                            :value="season.episodeStatistics.percentComplete"
                            show-value
                            format="percent"
                            type="is-warning"
                        >
                            {{
                                season.episodeStatistics
                                    .numberOfEpisodesWithFiles
                            }}
                            of
                            {{
                                season.episodeStatistics
                                    .numberOfEpisodesWithAirdates
                            }}
                        </b-progress>
                    </li>
                </ul>
                <h3 v-else>Whoops, no seasons to transfer</h3>
            </div>
        </div>
    </b-modal>
</template>

<script>
import HTTP from '~/plugins/ApiMover.js';
const crypto = require('crypto');

export default {
    props: {
        isCardModalActive: {
            type: Boolean,
            required: true,
            default: false,
        },
        seriesInfo: {
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
            seasonsReadyToMove: [],
            allSeasons: [],
            errors: [],
            seasonsMoving: [],
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
        seriesInfo(newVal) {
            if (newVal.seasons) {
                this.seasonsReadyToMove = newVal.seasons.filter((season) => {
                    if (season.readyToMove) {
                        return true;
                    }
                    return false;
                });
                this.allSeasons = newVal.seasons;
            }
        },
    },
    methods: {
        closeModal() {
            this.$store.commit('modal/hideSeriesModal');
        },
        moveSeason(season) {
            // get season path
            let seasonPath = '';
            if (season.episodeData.length) {
                const firstEpisodePath = season.episodeData[0].episodeFile.path;
                const splitPath = firstEpisodePath.split('\\');
                // eslint-disable-next-line
                const episodeFileName = splitPath.pop();
                seasonPath = splitPath.join('\\');
            }
            const data = {
                path: seasonPath,
                sid: crypto
                    .createHash('md5')
                    .update(seasonPath)
                    .digest('hex'),
                id: season.seasonNumber,
            };
            console.table(data);
            // if successfully got seasonPath
            if (seasonPath !== '') {
                HTTP.post('/move/season', data)
                    .then((response) => {
                        // eslint-disable-next-line
                        console.log(response);
                        if (response.status === 200) {
                            if (response.data.result.id) {
                                const toSend = {
                                    seasonId: response.data.result.data.id,
                                    jobId: response.data.result.id,
                                };
                                this.seasonsMoving.push(toSend);
                            }
                        }
                    })
                    .catch(function(err) {
                        // eslint-disable-next-line
                        console.log("Move request returned error");
                        // eslint-disable-next-line
                        console.log(err);
                    });
            }
        },
        checkMovingStatus(jobId) {
            // eslint-disable-next-line
            console.log("Checking moving status");
            // eslint-disable-next-line
            console.log(jobId);
            const jobIdUrl = `job-status/${jobId}`;
            HTTP.get(jobIdUrl)
                .then((response) => {
                    // eslint-disable-next-line
                    console.log(response);
                    if (response.status === 2000) {
                        // eslint-disable-next-line
                        console.log('good status');
                    }
                })
                .catch((err) => {
                    this.errors.push(err);
                });
        },
    },
};
</script>
