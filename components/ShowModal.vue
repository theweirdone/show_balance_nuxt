<template>
    <b-modal
        :active.sync="isCardModalActive"
        :width="640"
        scroll="keep"
        @close="closeModal"
    >
        <div class="card">
            <header class="card-header">
                <div class="card-header-title">{{ seasonInfo.showTitle }}</div>
            </header>
            <div class="card-content">
                <ul>
                    <li>Episodes Missing</li>
                    <li>Ready to Move</li>
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
