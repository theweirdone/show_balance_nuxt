<template>
    <div class="box">
        <h2 class="title has-text-centered">{{ title }}</h2>
        <h2 v-if="description" class="subtitle has-text-centered">
            {{ description }}
        </h2>
        <div class="show-list">
            <ul v-if="shows.length">
                <li v-for="show in shows" :key="show.id">
                    {{ show.title }}
                    <div v-if="show.seasons" class="tags">
                        <span
                            v-for="season in show.seasons"
                            :key="season.seasonNumber"
                            class="tag is-rounded"
                            :class="classy(season)"
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
export default {
    props: {
        title: {
            type: String,
            required: true,
        },
        shows: {
            type: Array,
            required: false,
        },
        description: {
            type: String,
            required: false,
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
    },
};
</script>

<style lang="scss" scoped>
h2.title,
h2.subtitle,
.tag {
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
