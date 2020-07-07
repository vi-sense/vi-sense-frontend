<template>
    <v-overlay :z-index="5" v-if="!sceneLoaded">
        <h1 v-if="loadingFailed" style="color: firebrick">Loading Scene failed</h1>
        <div  v-else style="display: flex; align-items: center; justify-content: center; flex-direction: column">
            <h1 class="pa-4">Loading Scene</h1>
            <v-progress-circular
                    :rotate="-90"
                    :size="100"
                    :width="15"
                    :value="sceneLoadingProgress"
                    color="rgba(82, 186, 162, 1)">
                {{ sceneLoadingProgress }}
            </v-progress-circular>

        </div>
    </v-overlay>
</template>

<script>
    import {eventBus} from "../main";

    export default {
        name: "LoadingOverlay",
        data() {
            return {
                sceneLoaded: false,
                sceneLoadingProgress: 0,
                loadingFailed: false
            }
        },
        created() {
            eventBus.$on("loading-progress", (percentDone) => this.sceneLoadingProgress = Math.floor(percentDone))
            eventBus.$on("loading-finished", () => this.sceneLoaded = true)
            eventBus.$on("loading-failed", () => this.loadingFailed = true)
        }
    }
</script>

<style scoped lang="scss">
    .v-progress-circular >>> .v-progress-circular__overlay{
        transition: none;
    }
</style>