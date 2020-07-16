 <template>
    <div>
        <v-dialog v-model="dialog" persistent max-width="300">
          <template v-slot:activator="{ }">
            <v-btn
              @click.stop="dialog = true"
              icon
              width="auto"
              height="auto"
              class="pa-1"
              style="border: 2px solid #52baa2; border-radius: 20px"
            >
                <v-avatar size="15">D</v-avatar>
            </v-btn>
          </template>
          <v-card>
            <v-card-title class="headline">Account information</v-card-title>
            <v-card-text>
              Your are logged in automatically as a user with limited rights to avoid unrealistic use of the software. 
              Since most of your settings are stored in the backend, this would affect other users aswell.
              During the presentation of this prototype we would like to show you what is possible with admin rights.
              </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" text @click="dialog = false">Ok</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
</template>


<script>
export default {
    data(){
        return{
            dialog: false
        }
    }
}
</script>
