<template>
    <b-modal
        :active.sync="isCardModalActive"
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
                    </li>
                    <li v-if="seasonInfo.hasAllFiles && !seasonInfo.inProgress">
                        Ready to Move
                    </li>
                    <li v-if="seasonInfo.inProgress">In Progress</li>
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
    methods: {
        closeModal() {
            this.$store.commit('modal/hideModal');
        },
    },
};
</script>
