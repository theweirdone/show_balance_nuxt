<template>
    <div class="box">
        <h2 class="title has-text-centered">{{ title }}</h2>
        <h2 v-if="description" class="subtitle has-text-centered">
            {{ description }}
        </h2>
        <div class="show-list">
            <ul v-if="shows.length">
                <li v-for="show in shows" :key="show.id">
                    <div class="show-title" @click="seriesModal(show)">
                        {{ show.title }}
                    </div>
                    <div v-if="show.seasons" class="tags">
                        <span
                            v-for="season in show.seasons"
                            :key="season.seasonNumber"
                            class="tag is-rounded"
                            :class="classy(season)"
                            @click="seasonModal(season)"
                            >{{ season.seasonNumber }}
                        </span>
                    </div>
                </li>
            </ul>
            <ul v-else>
                <li>No shows...</li>
            </ul>
        </div>
    </div>
</template>

<script>
import HTTP from '~/plugins/ApiGetter.js';

export default {
    props: {
        title: {
            type: String,
            required: true,
        },
        shows: {
            type: Array,
            required: false,
            default() {
                return [];
            },
        },
        description: {
            type: String,
            required: false,
            default: '',
        },
    },
    methods: {
        classy: (season) => {
            return {
                'is-success': season.hasAllFiles && !season.inProgress,
                'is-danger':
                    !season.hasAllFiles &&
                    season.hasFiles &&
                    !season.inProgress,
                'is-warning': season.hasFiles && season.inProgress,
                'is-light': !season.hasFiles,
            };
        },
        seasonModal(season) {
            const episodesPath = `episode?apikey=21d47040405041e29be8783d087f97a6&seriesId=${season.showId}`;
            HTTP.get(episodesPath).then((episodeResponse) => {
                const episodeData = episodeResponse.data;

                const seasonEpisodes = episodeData.filter(
                    (episode) => episode.seasonNumber === season.seasonNumber
                );
                const seasonEpisodesWithFiles = seasonEpisodes.filter(
                    (episode) => episode.hasFile
                );
                const seasonEpisodesWithoutFiles = seasonEpisodes.filter(
                    (episode) => episode.hasFile === false
                );
                const seasonEpisodesWithAirdates = seasonEpisodes.filter(
                    (episode) => episode.airDate
                );
                season.episodeStatistics = {
                    numberOfEpisodesWithFiles: seasonEpisodesWithFiles.length,
                    numberOfEpisodesWithoutFiles:
                        seasonEpisodesWithoutFiles.length,
                    numberOfEpisodesWithAirdates:
                        seasonEpisodesWithAirdates.length,
                    numberOfEpisodesWithoutAirdates:
                        seasonEpisodes.length -
                        seasonEpisodesWithAirdates.length,
                    percentComplete:
                        (seasonEpisodesWithFiles.length /
                            seasonEpisodes.length) *
                        100,
                    totalNumberOfEpisodes: seasonEpisodes.length,
                };
                season.episodeData = seasonEpisodes;
                this.$store.commit('modal/setSeasonInfo', season);
                this.$store.commit('modal/showSeasonModal');
            });
        },
        seriesModal(show) {
            const episodesPath = `episode?apikey=21d47040405041e29be8783d087f97a6&seriesId=${show.id}`;
            HTTP.get(episodesPath).then((episodeResponse) => {
                const episodeData = episodeResponse.data;

                const newSeasons = [];
                show.seasons.forEach((season) => {
                    const seasonEpisodes = episodeData.filter(
                        (episode) =>
                            episode.seasonNumber === season.seasonNumber
                    );
                    const seasonEpisodesWithFiles = seasonEpisodes.filter(
                        (episode) => episode.hasFile
                    );
                    const seasonEpisodesWithoutFiles = seasonEpisodes.filter(
                        (episode) => episode.hasFile === false
                    );
                    const seasonEpisodesWithAirdates = seasonEpisodes.filter(
                        (episode) => episode.airDate
                    );
                    const percentComplete =
                        (seasonEpisodesWithFiles.length /
                            seasonEpisodes.length) *
                        100;
                    const isReadyToMove =
                        season.readyToMove && percentComplete === 100;
                    season.episodeStatistics = {
                        numberOfEpisodesWithFiles:
                            seasonEpisodesWithFiles.length,
                        numberOfEpisodesWithoutFiles:
                            seasonEpisodesWithoutFiles.length,
                        numberOfEpisodesWithAirdates:
                            seasonEpisodesWithAirdates.length,
                        numberOfEpisodesWithoutAirdates:
                            seasonEpisodes.length -
                            seasonEpisodesWithAirdates.length,
                        percentComplete,
                        isReadyToMove,
                        totalNumberOfEpisodes: seasonEpisodes.length,
                    };
                    season.episodeData = seasonEpisodes;
                    newSeasons.push(season);
                });

                show.seasons = newSeasons;

                this.$store.commit('modal/setSeriesInfo', show);
                this.$store.commit('modal/showSeriesModal');
            });
        },
    },
};
</script>

<style lang="scss" scoped>
h2.title,
h2.subtitle,
.tag,
.show-title {
    cursor: pointer;
}
.show-list {
    max-height: 500px;
    overflow: scroll;
}
img {
    width: 25px;
}
li {
    color: #030181;
}
</style>
