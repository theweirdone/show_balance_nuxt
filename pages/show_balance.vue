<template>
    <section class="section">
        <div class="columns is-mobile">
            <div class="column">
                <h1 class="title is-2 has-text-centered">Show Statistics</h1>
                <ShowList
                    title="New Shows"
                    :shows="newShows"
                    description="Only 1 season with less than 5 episodes"
                />
                <ShowList
                    title="Returned Shows"
                    :shows="returnedShows"
                    description="More than 1 season, latest season less than 5 episodes"
                />
            </div>
            <div class="column">
                <h1 class="title is-2 has-text-centered">Show Balancer</h1>
                <ShowList
                    title="Shows with Complete Seasons"
                    :shows="showsWithCompleteSeasons"
                />
                <ShowList title="Cancelled Shows" :shows="cancelledShows" />
            </div>
        </div>
    </section>
</template>

<script>
import ShowList from '~/components/ShowList';
import HTTP from '~/plugins/ApiGetter.js';

export default {
    name: 'ShowBalance',
    components: {
        ShowList,
    },
    data: () => {
        return {
            allShows: [],
            showsToDisplay: [],
            newShows: [],
            returnedShows: [],
            showsWithCompleteSeasons: [],
            cancelledShows: [],
            errors: [],
        };
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
                        tmpShow.posterUrl = `http://192.168.1.171:8989${showPoster.url}`;
                    }

                    tmpShow.seasons = show.seasons.map((season) => {
                        const tmpSeason = season;
                        tmpSeason.inProgress = false;
                        tmpSeason.hasFiles = false;
                        tmpSeason.hasAllFiles = false;
                        tmpSeason.missingEpisodes = 0;
                        if (season.statistics.nextAiring) {
                            tmpSeason.inProgress = true;
                            tmpShow.seasonInProgress = true;
                        }
                        if (season.statistics.sizeOnDisk !== 0) {
                            tmpSeason.hasFiles = true;
                        }
                        if (
                            season.statistics.episodeFileCount ===
                            season.statistics.totalEpisodeCount
                        ) {
                            tmpSeason.hasAllFiles = true;
                        } else {
                            tmpSeason.missingEpisodes =
                                season.statistics.totalEpisodeCount -
                                season.statistics.episodeFileCount;
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
                                    season.statistics.episodeFileCount ===
                                        season.statistics.totalEpisodeCount &&
                                    season.inProgress === false
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
                // console.log(toUse);
                this.cancelledShows = cancelledShowsReadyToMove;
                this.showsToDisplay = toUse;
                this.newShows = newShows;
                this.returnedShows = returnedShows;
                this.showsWithCompleteSeasons = showsWithCompleteSeasons;
            })
            .catch((err) => {
                this.errors.push(err);
            });
        // eslint-disable-next-line
        // console.log('created');
    },
};
</script>
