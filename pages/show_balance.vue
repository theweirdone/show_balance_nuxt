<template>
    <section class="section">
        <div class="columns is-mobile">
            <div class="column">
                <h1 class="title is-2 has-text-centered">Show Statistics</h1>
                <ShowList
                    :shows="newShows"
                    title="New Shows"
                    description="Only 1 season with less than 5 episodes"
                />
                <ShowList
                    :shows="returnedShows"
                    title="Returned Shows"
                    description="More than 1 season, latest season less than 5 episodes"
                />
                <ShowList
                    :shows="showsMissingEpisodes"
                    title="Shows Missing Episodes"
                    description="Any show with at least one episode in a season"
                />
            </div>
            <div class="column">
                <h1 class="title is-2 has-text-centered">Show Balancer</h1>
                <ShowList
                    :shows="showsWithSeasonsReadyToMove"
                    title="Shows With Seasons Ready to Move"
                    description="More than 2 complete seasons"
                />
                <ShowList
                    :shows="showsWithCompleteSeasons"
                    title="Shows with Complete Seasons"
                    description="More than 1 complete season"
                />
                <ShowList :shows="cancelledShows" title="Cancelled Shows" />
            </div>
        </div>
        <SeriesModal
            :is-card-modal-active="displaySeriesModal"
            :series-info="currentSeriesToDisplay"
        />
        <SeasonModal
            :is-card-modal-active="displaySeasonModal"
            :season-info="currentSeasonToDisplay"
        />
    </section>
</template>

<script>
import ShowList from '~/components/ShowList';
import HTTP from '~/plugins/ApiGetter.js';
import SeasonModal from '~/components/SeasonModal';
import SeriesModal from '~/components/SeriesModal';

export default {
    name: 'ShowBalance',
    components: {
        ShowList,
        SeasonModal,
        SeriesModal,
    },
    data() {
        return {
            allShows: [],
            showsToDisplay: [],
            newShows: [],
            returnedShows: [],
            showsWithCompleteSeasons: [],
            showsWithSeasonsReadyToMove: [],
            showsMissingEpisodes: [],
            cancelledShows: [],
            errors: [],
        };
    },
    computed: {
        displaySeasonModal() {
            return this.$store.state.modal.displaySeasonModal;
        },
        displaySeriesModal() {
            return this.$store.state.modal.displaySeriesModal;
        },
        currentSeasonToDisplay() {
            return this.$store.state.modal.seasonInfo;
        },
        currentSeriesToDisplay() {
            return this.$store.state.modal.seriesInfo;
        },
    },
    created() {
        HTTP.get('series?apikey=21d47040405041e29be8783d087f97a6')
            .then((response) => {
                this.allShows = response.data.map((show) => {
                    const tmpShow = show;
                    tmpShow.hasSpecial = false;
                    tmpShow.hasFiles = false;
                    tmpShow.seasonInProgress = false;
                    if (show.seasonCount !== show.seasons.length) {
                        tmpShow.hasSpecial = true;
                    }
                    if (show.sizeOnDisk !== 0) {
                        tmpShow.hasFiles = true;
                    }
                    const showPoster = tmpShow.images.find(
                        (image) => image.coverType === 'fanart'
                    );
                    if (showPoster) {
                        tmpShow.posterUrl = `http://192.168.1.169:8989${showPoster.url}`;
                    }

                    tmpShow.seasons = show.seasons.map((season) => {
                        const tmpSeason = season;
                        tmpSeason.showTitle = show.title;
                        tmpSeason.showId = show.id;
                        tmpSeason.inProgress = false;
                        tmpSeason.hasFiles = false;
                        tmpSeason.hasAllFiles = false;
                        tmpSeason.missingEpisodes = 0;
                        tmpSeason.readyToMove = false;
                        tmpSeason.movingJobId = false;
                        if (season.statistics.nextAiring) {
                            tmpSeason.inProgress = true;
                            tmpShow.seasonInProgress = true;
                        }
                        if (season.statistics.sizeOnDisk !== 0) {
                            tmpSeason.hasFiles = true;
                        }
                        if (
                            season.statistics.episodeFileCount ===
                                season.statistics.totalEpisodeCount &&
                            season.statistics.sizeOnDisk !== 0
                        ) {
                            tmpSeason.hasAllFiles = true;
                        }
                        if (tmpSeason.hasFiles) {
                            tmpSeason.missingEpisodes =
                                season.statistics.totalEpisodeCount -
                                season.statistics.episodeFileCount;
                        }
                        if (tmpSeason.hasAllFiles && !tmpSeason.inProgress) {
                            tmpSeason.readyToMove = true;
                        }

                        return tmpSeason;
                    });

                    return tmpShow;
                });
                const newShows = this.allShows.filter((show) => {
                    if (
                        show.seasons.length === 1 &&
                        show.hasFiles &&
                        show.seasons[0].seasonNumber === 1 &&
                        show.seasons[0].statistics.episodeCount <= 5
                    ) {
                        return true;
                    }
                    return false;
                });
                const returnedShows = this.allShows.filter((show) => {
                    if (
                        show.seasons.length > 1 &&
                        show.hasFiles &&
                        show.seasons[show.seasons.length - 1].statistics
                            .episodeFileCount > 0 &&
                        show.seasons[show.seasons.length - 1].statistics
                            .episodeFileCount <= 5
                    ) {
                        return true;
                    }
                    return false;
                });
                const showsWithCompleteSeasons = this.allShows.filter(
                    (show) => {
                        const completeSeasons = show.seasons.filter(
                            (season) => {
                                if (
                                    season.hasAllFiles &&
                                    season.inProgress === false &&
                                    season.seasonNumber
                                ) {
                                    return true;
                                }
                                return false;
                            }
                        );
                        if (completeSeasons.length && show.hasFiles) {
                            return true;
                        }
                        return false;
                    }
                );
                const showsWithSeasonsReadyToMove = showsWithCompleteSeasons.filter(
                    (show) => {
                        const completeSeasons = show.seasons.filter(
                            (season) => {
                                if (
                                    season.hasAllFiles &&
                                    season.inProgress === false &&
                                    season.seasonNumber !== 0
                                ) {
                                    return true;
                                }
                                return false;
                            }
                        );
                        if (completeSeasons.length >= 2 && show.hasFiles) {
                            return true;
                        }
                        return false;
                    }
                );
                const toUse = this.allShows.filter((show) => {
                    if (
                        show.sizeOnDisk > 0 &&
                        show.seasons.length > 2 &&
                        show.seasons[show.seasons.length - 1].statistics
                            .sizeOnDisk > 0 && // last season at least one file
                        show.seasons[show.seasons.length - 1].statistics
                            .totalEpisodeCount === // last season is complete
                            show.seasons[show.seasons.length - 1].statistics
                                .episodeFileCount &&
                        show.seasons[show.seasons.length - 2].statistics
                            .sizeOnDisk > 0 && // before last season at least one file
                        show.seasons[show.seasons.length - 2].statistics
                            .totalEpisodeCount === // before last season is complete
                            show.seasons[show.seasons.length - 2].statistics
                                .episodeFileCount
                    ) {
                        return true;
                    }
                    return false;
                });
                const cancelledShows = this.allShows.filter(
                    (show) => show.status === 'ended' && show.hasFiles
                );
                const cancelledShowsReadyToMove = cancelledShows.filter(
                    (show) => {
                        if (show.hasFiles) {
                            return true;
                        }
                        return false;
                    }
                );
                const showsMissingEpisodes = this.allShows.filter((show) => {
                    const seasonsMissingEpisodes = show.seasons.filter(
                        (season) => {
                            if (
                                season.hasFiles &&
                                !season.hasAllFiles &&
                                !season.inProgress &&
                                season.seasonNumber &&
                                season.missingEpisodes
                            ) {
                                return true;
                            }
                            return false;
                        }
                    );

                    if (show.hasFiles && seasonsMissingEpisodes.length) {
                        return true;
                    }
                    return false;
                });
                const sortedByTitle = function(a, b) {
                    if (a.sortTitle < b.sortTitle) {
                        return -1;
                    }
                    if (a.sortTitle > b.sortTitle) {
                        return 1;
                    }
                    return 0;
                };
                const sortedBySizeOnDisk = function(a, b) {
                    if (a.sizeOnDisk < b.sizeOnDisk) {
                        return 1;
                    }
                    if (a.sizeOnDisk > b.sizeOnDisk) {
                        return -1;
                    }
                    return 0;
                };
                // console.log(toUse);
                this.cancelledShows = cancelledShowsReadyToMove.sort(
                    sortedByTitle
                );
                this.showsToDisplay = toUse.sort(sortedByTitle);
                this.newShows = newShows.sort(sortedByTitle);
                this.returnedShows = returnedShows.sort(sortedByTitle);
                this.showsWithCompleteSeasons = showsWithCompleteSeasons.sort(
                    sortedBySizeOnDisk
                );
                this.showsWithSeasonsReadyToMove = showsWithSeasonsReadyToMove.sort(
                    sortedBySizeOnDisk
                );
                this.showsMissingEpisodes = showsMissingEpisodes.sort(
                    sortedByTitle
                );
            })
            .catch((err) => {
                this.errors.push(err);
                // eslint-disable-next-line
                console.log(err);
            });
        // eslint-disable-next-line
        // console.log('created');
    },
};
</script>
