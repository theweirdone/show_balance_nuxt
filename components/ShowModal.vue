<template>
    <b-modal :active.sync="isCardModalActive" :width="640" scroll="keep">
        <div class="card">
            <header class="card-header">
                <div class="card-header-title">Show Name Here</div>
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
    data() {
        return {
            isCardModalActive: false,
        };
    },
};
</script>
